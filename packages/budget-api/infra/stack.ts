import { 
  App,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_lambda,
  aws_apigatewayv2,
  aws_apigatewayv2_authorizers,
  aws_apigatewayv2_integrations,
  aws_certificatemanager,
  aws_dynamodb,
  aws_ec2,
  aws_events,
  aws_events_targets,
  aws_iam,
  aws_logs,
  aws_rds,
  aws_secretsmanager,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LOCAL_DOMAIN } from '../src/constants/environment';
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from '../src/utils/cdk';
import path = require('path');

// Heavily inspired by https://www.freecodecamp.org/news/aws-lambda-rds/
// and https://sewb.dev/posts/cdk-series:-creating-an-elasticache-cluster-bc1zupe

[
  'ENV_NAME',
  'CORS_DOMAINS',
  'DOMAIN_NAME'
].forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`process.env.${envVar} must be defined, variable ${envVar} currently set to ${process.env[envVar]}`);
  }
});

export class BudgetApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const STACK_NAME = `${process.env.ENV_NAME}-${id}`;
    const ALLOWED_ORIGINS = getAllowedOrigins(process.env.CORS_DOMAINS, LOCAL_DOMAIN);
    const CERT_ARN = 'arn:aws:acm:us-east-1:360115878429:certificate/6432f08a-5ab8-442b-be1c-6ceaabe27f0a';
    const SUBNET_TYPE = aws_ec2.SubnetType.PRIVATE_WITH_NAT;

    const createLambdaAndRoute = (
      lambdaName: string,
      lambdaHandler: string,
      version: string,
      lambdaEntry: string,
      route: string,
      httpMethods: Array<aws_apigatewayv2.HttpMethod>,
    ) => {
      let props: NodejsFunctionProps = {
        runtime: aws_lambda.Runtime.NODEJS_24_X,
        functionName: `${STACK_NAME}-${lambdaName}-${version}`,
        handler: lambdaHandler,
        entry: path.join(__dirname, `../src/${version}`, lambdaEntry),
        timeout: Duration.seconds(60),
        bundling: {
          externalModules: [
            'pg-native',
          ],
        },
        environment: {
          ALLOWED_ORIGINS: ALLOWED_ORIGINS.join(','),
          DATABASE_URL: dbProxy.endpoint,
          DYNAMODB_TABLE_NAME: dynamodbTable.tableName,
          DYNAMODB_INDEX_NAME: dynamodbTableUsersIndex,
        },
      };
      if (version === 'v1') {
        props = Object.assign(props, {
          vpc,
          vpcSubnets: vpc.selectSubnets({
            subnetType: SUBNET_TYPE,
          }),
          securityGroups: [lambdaSecurityGroup],
        });
      }

      const lambda: aws_lambda.IFunction = new NodejsFunction(
        this,
        `${STACK_NAME}-${lambdaName}Lambda${version === 'v1' ? '' : `-${version}`}`,
        {
          ...props,
        }
      );

      if (version === 'v2') {
        dynamodbTable.grantReadWriteData(lambda);
      }

      secret.grantRead(lambda);
      const integration = new aws_apigatewayv2_integrations.HttpLambdaIntegration(
        `${STACK_NAME}-${lambdaName}Integration`,
        lambda
      );
  
      budgetApi.addRoutes({
        path: `/${version}${route}`,
        methods: httpMethods,
        integration: integration,
        authorizer: version === 'v2' ? authorizerV2 : authorizerV1,
      });

      lambda.role?.addManagedPolicy(
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaENIManagementAccess',
        ),
      );
    };

    const vpc = new aws_ec2.Vpc(
      this,
      `${STACK_NAME}-Vpc`,
      {
        maxAzs: 2,
        natGateways: 1,
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: `${STACK_NAME}-Vpc-Subnet-PWN`,
            subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
          },
          {
            cidrMask: 24,
            name: `${STACK_NAME}-Vpc-Subnet-PUB`,
            subnetType: aws_ec2.SubnetType.PUBLIC,
          },
        ],
      }
    );

    const dbSecurityGroup = new aws_ec2.SecurityGroup(
      this,
      `${STACK_NAME}-dbSecurityGroup`,
      {
        vpc,
      }
    );

    const lambdaSecurityGroup = new aws_ec2.SecurityGroup(
      this,
      `${STACK_NAME}-lambdaSecurityGroup`,
      {
        vpc,
      }
    );

    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      aws_ec2.Port.tcp(5432),
      'Allow lambdas to access budget postgres database'
    );
    
    const databaseName = (`${process.env.ENV_NAME}${id.replace('-', '')}db`);
    const db = new aws_rds.DatabaseInstance(
      this,
      `${STACK_NAME}-Database`,
      {
        engine: aws_rds.DatabaseInstanceEngine.postgres({
          version: aws_rds.PostgresEngineVersion.VER_14_20,
        }),
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.BURSTABLE3,
          aws_ec2.InstanceSize.MICRO
        ),
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SUBNET_TYPE,
        }),
        databaseName,
        securityGroups: [dbSecurityGroup],
        credentials: aws_rds.Credentials.fromGeneratedSecret('postgres'),
        allocatedStorage: 10,
        maxAllocatedStorage: 200,
        allowMajorVersionUpgrade: true,
      }
    );

    const dynamodbTable = new aws_dynamodb.TableV2(
      this,
      `${STACK_NAME}-Table`,
        {
        partitionKey: {
          name: 'pk',
          type: aws_dynamodb.AttributeType.STRING
        },
        sortKey: {
          name: 'sk',
          type: aws_dynamodb.AttributeType.STRING
        },
        tableName: `${STACK_NAME}-Table`,
        removalPolicy: RemovalPolicy.RETAIN,
        billing: aws_dynamodb.Billing.onDemand(),
        pointInTimeRecovery: true,
      }
    );
    const dynamodbTableUsersIndex = `${STACK_NAME}-Users`;
    dynamodbTable.addGlobalSecondaryIndex({
      indexName: dynamodbTableUsersIndex,
      partitionKey: {
        name: 'sk',
        type: aws_dynamodb.AttributeType.STRING
      },
      projectionType: aws_dynamodb.ProjectionType.KEYS_ONLY,
    });
    const dynamodbTableItemsIndex = `${STACK_NAME}-Index-Items`;
    dynamodbTable.addGlobalSecondaryIndex({
      indexName: dynamodbTableItemsIndex,
      partitionKeys: [
        {
          name: 'pk',
          type: aws_dynamodb.AttributeType.STRING
        }
      ],
      sortKeys: [
        {
          name: 'sk',
          type: aws_dynamodb.AttributeType.STRING
        },
        {
          name: 'settledDate',
          type: aws_dynamodb.AttributeType.STRING
        }
      ],
      projectionType: aws_dynamodb.ProjectionType.ALL
    });

    const secret = new aws_secretsmanager.Secret(
      this,
      `${STACK_NAME}-Secret`,
      {
        description: `Secret for Budget API`,
        secretName: `${STACK_NAME}-Secret`,
      }
    );

    const proxySecurityGroup = new aws_ec2.SecurityGroup(
      this,
      `${STACK_NAME}-proxySecurityGroup`,
      {
        vpc,
        description: 'Security group for RDS Proxy',
      }
    );

    proxySecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      aws_ec2.Port.tcp(5432),
      'Allow lambdas to access RDS proxy'
    );

    dbSecurityGroup.addIngressRule(
      proxySecurityGroup,
      aws_ec2.Port.tcp(5432),
      'Allow proxy to access database'
    );

    const dbProxy = new aws_rds.DatabaseProxy(
      this,
      'Proxy',
      {
        proxyTarget: aws_rds.ProxyTarget.fromInstance(db),
        secrets: [db.secret!],
        securityGroups: [proxySecurityGroup],
        vpc,
        requireTLS: false,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SUBNET_TYPE,
        }),
      }
    );

    const authorizerLambdaV1: aws_lambda.IFunction = new NodejsFunction(this, `${STACK_NAME}-AuthorizerLambda`, {
      runtime: aws_lambda.Runtime.NODEJS_24_X,
      functionName: `${STACK_NAME}-AuthorizerLambda-v1`,
      handler: 'handler',
      entry: path.join(__dirname, '..', 'src', 'v1', 'authorizer', 'index.ts'),
      bundling: {
        externalModules: [
          'pg-native',
        ],
      },
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SUBNET_TYPE,
      }),
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DATABASE_URL: dbProxy.endpoint,
      }
    });
    secret.grantRead(authorizerLambdaV1);
    authorizerLambdaV1.role?.addManagedPolicy(
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaENIManagementAccess',
      ),
    );

    const authorizerV1 = new aws_apigatewayv2_authorizers.HttpLambdaAuthorizer(
      `${STACK_NAME}-HttpLambdaAuthorizer-v1`,
      authorizerLambdaV1,
      {
        responseTypes: [aws_apigatewayv2_authorizers.HttpLambdaResponseType.IAM],
        resultsCacheTtl: Duration.seconds(0),
      }
    );

    const authorizerLambdaV2: aws_lambda.IFunction = new NodejsFunction(this, `${STACK_NAME}-AuthorizerLambdaV2`, {
      runtime: aws_lambda.Runtime.NODEJS_24_X,
      functionName: `${STACK_NAME}-AuthorizerLambda-v2`,
      handler: 'handler',
      entry: path.join(__dirname, '..', 'src', 'v2', 'authorizer', 'index.ts'),
      environment: {
        DYNAMODB_TABLE_NAME: dynamodbTable.tableName,
        DYNAMODB_INDEX_NAME: dynamodbTableUsersIndex,
      }
    });
    authorizerLambdaV2.role?.addManagedPolicy(
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaENIManagementAccess',
      ),
    );
    dynamodbTable.grantReadData(authorizerLambdaV2);

    const authorizerV2 = new aws_apigatewayv2_authorizers.HttpLambdaAuthorizer(
      `${STACK_NAME}-HttpLambdaAuthorizerV2`,
      authorizerLambdaV2,
      {
        responseTypes: [aws_apigatewayv2_authorizers.HttpLambdaResponseType.IAM],
        resultsCacheTtl: Duration.seconds(0),
      }
    );

    const domainName = new aws_apigatewayv2.DomainName(
      this,
      `${STACK_NAME}-DomainName`,
      {
        domainName: process.env.DOMAIN_NAME || '',
        certificate: aws_certificatemanager.Certificate.fromCertificateArn(this, 'cert', CERT_ARN),
      }
    );

    const budgetApi = new aws_apigatewayv2.HttpApi(
      this,
      `${STACK_NAME}-HttpApi`,
      {
        apiName: `${STACK_NAME}-HttpApi`,
        corsPreflight: {
          allowHeaders: getAllowedPreflightHeaders(),
          allowMethods: getAllowedPreflightMethods(),
          allowCredentials: false,
          allowOrigins: ALLOWED_ORIGINS,
        },
        defaultAuthorizer: authorizerV1,
        description: 'Rest API for the Budget application',
        defaultDomainMapping: { domainName },
      }
    );

    const accessLogGroup = new aws_logs.LogGroup(
      this,
      `${STACK_NAME}-HttpApiAccessLogs`,
      {
        retention: aws_logs.RetentionDays.TWO_WEEKS,
      }
    );

    // Configure the default stage's access logging using escape hatches if direct properties aren't available
    // The apigatewayv2 module is evolving, so direct properties might become available later.
    // The current way is via the CfnStage L1 construct:
    const cfnStage = budgetApi.defaultStage?.node.defaultChild as aws_apigatewayv2.CfnStage;
    if (cfnStage) {
      cfnStage.accessLogSettings = {
        destinationArn: accessLogGroup.logGroupArn,
        format: JSON.stringify({
          requestId: '$context.requestId',
          ip: '$context.identity.sourceIp',
          requestTime: '$context.requestTime',
          httpMethod: '$context.httpMethod',
          resourcePath: '$context.resourcePath',
          status: '$context.status',
          protocol: '$context.protocol',
          responseLength: '$context.responseLength',
        }),
      };
    }

    createLambdaAndRoute(
      'GetAuth',
      'getHandler',
      'v1',
      '/handlers/auth/login/item.ts',
      '/auth/login',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetAuth',
      'getHandler',
      'v2',
      '/handlers/auth/login/item.ts',
      '/auth/login',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetMigrations',
      'getHandler',
      'v1',
      '/handlers/db/migrations/item.ts',
      '/db/migrations',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetSeeds',
      'getHandler',
      'v1',
      '/handlers/db/seeds/item.ts',
      '/db/seeds',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetDbDescription',
      'getHandler',
      'v1',
      '/handlers/db/describe/item.ts',
      '/db/describe',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetBudgetItemsForYear',
      'getHandler',
      'v1',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetBudgetItemsForYear',
      'getHandler',
      'v2',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CountBudgetItemsForYear',
      'countHandler',
      'v2',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items/count',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetStartingBalanceForYear',
      'startingBalanceHandler',
      'v2',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items/starting-balance',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetStatsForYear',
      'getHandler',
      'v2',
      '/handlers/budgets/stats.ts',
      '/budgets/{budgetGuid}/stats',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'UpdateStatsForYear',
      'putHandler',
      'v2',
      '/handlers/budgets/stats.ts',
      '/budgets/{budgetGuid}/stats',
      [ aws_apigatewayv2.HttpMethod.PUT ]
    );

    createLambdaAndRoute(
      'CopyBudgetItemsToYear',
      'postHandler',
      'v1',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items/copy',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'CopyBudgetItemsToYear',
      'postHandler',
      'v2',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items/copy',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'DeleteBudgetItemsFromYear',
      'deleteHandler',
      'v1',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items/delete',
      [ aws_apigatewayv2.HttpMethod.DELETE ]
    );

    createLambdaAndRoute(
      'DeleteBudgetItemsFromYear',
      'deleteHandler',
      'v2',
      '/handlers/budgets/items.ts',
      '/budgets/{budgetGuid}/items/delete',
      [ aws_apigatewayv2.HttpMethod.DELETE ]
    );

    createLambdaAndRoute(
      'CreateBudgetItem',
      'postHandler',
      'v1',
      '/handlers/budgets/item.ts',
      '/budgets/{budgetGuid}/items',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'CreateBudgetItem',
      'postHandler',
      'v2',
      '/handlers/budgets/item.ts',
      '/budgets/{budgetGuid}/items',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'UpdateBudgetItem',
      'putHandler',
      'v1',
      '/handlers/budgets/item.ts',
      '/budgets/{budgetGuid}/items/{itemGuid}',
      [ aws_apigatewayv2.HttpMethod.PUT ]
    );

    createLambdaAndRoute(
      'UpdateBudgetItem',
      'putHandler',
      'v2',
      '/handlers/budgets/item.ts',
      '/budgets/{budgetGuid}/items/{itemGuid}',
      [ aws_apigatewayv2.HttpMethod.PUT ]
    );

    createLambdaAndRoute(
      'DeleteBudgetItem',
      'deleteHandler',
      'v1',
      '/handlers/budgets/item.ts',
      '/budgets/{budgetGuid}/items/{itemGuid}',
      [ aws_apigatewayv2.HttpMethod.DELETE ]
    );

    createLambdaAndRoute(
      'DeleteBudgetItem',
      'deleteHandler',
      'v2',
      '/handlers/budgets/item.ts',
      '/budgets/{budgetGuid}/items/{itemGuid}',
      [ aws_apigatewayv2.HttpMethod.DELETE ]
    );

    createLambdaAndRoute(
      'GetCategories',
      'getHandler',
      'v1',
      '/handlers/budgets/categories.ts',
      '/budgets/{budgetGuid}/categories',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetCategories',
      'getHandler',
      'v2',
      '/handlers/budgets/categories.ts',
      '/budgets/{budgetGuid}/categories',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CreateCategory',
      'postHandler',
      'v1',
      '/handlers/budgets/category.ts',
      '/budgets/{budgetGuid}/categories',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'CreateCategory',
      'postHandler',
      'v2',
      '/handlers/budgets/category.ts',
      '/budgets/{budgetGuid}/categories',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'GetSubcategories',
      'getHandler',
      'v1',
      '/handlers/budgets/subcategories.ts',
      '/budgets/{budgetGuid}/subcategories',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetSubcategories',
      'getHandler',
      'v2',
      '/handlers/budgets/subcategories.ts',
      '/budgets/{budgetGuid}/subcategories',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CreateSubcategory',
      'postHandler',
      'v1',
      '/handlers/budgets/subcategory.ts',
      '/budgets/{budgetGuid}/categories/{categoryGuid}/subcategories',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'CreateSubcategory',
      'postHandler',
      'v2',
      '/handlers/budgets/subcategory.ts',
      '/budgets/{budgetGuid}/categories/{categoryGuid}/subcategories',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`, { env: { account: '360115878429', region: 'us-east-1' }});
