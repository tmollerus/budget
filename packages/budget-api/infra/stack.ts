import { App, Duration, Stack, StackProps, aws_lambda, aws_apigatewayv2, aws_apigatewayv2_authorizers, aws_apigatewayv2_integrations, aws_certificatemanager, aws_elasticache, aws_iam, aws_ec2, aws_rds, aws_secretsmanager } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LOCAL_DOMAIN } from '../src/v1/constants/environment';
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from '../src/v1/utils/cdk';

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
    const SUBNET_TYPE = aws_ec2.SubnetType.PRIVATE_ISOLATED;

    const createLambdaAndRoute = (
      lambdaName: string,
      lambdaHandler: string,
      lambdaEntry: string,
      route: string,
      httpMethods: Array<aws_apigatewayv2.HttpMethod>,
    ) => {
      const lambda: aws_lambda.IFunction = new aws_lambda.Function(
        this,
        `${STACK_NAME}-${lambdaName}Lambda`,
        {
          runtime: aws_lambda.Runtime.NODEJS_24_X,
          functionName: `${STACK_NAME}-${lambdaName}`,
          handler: lambdaHandler,
          // entry: lambdaEntry,
          code: aws_lambda.Code.fromAsset(lambdaEntry),
          timeout: Duration.seconds(60),
          // bundling: {
          //   externalModules: [
          //     'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          //     'pg-native',
          //   ],
          // },
          environment: {
            ALLOWED_ORIGINS: ALLOWED_ORIGINS.join(','),
            REDIS_URL: `redis://${redisCache.attrRedisEndpointAddress}:${redisCache.attrRedisEndpointPort}`,
          },
          vpc,
          vpcSubnets: vpc.selectSubnets({
            subnetType: SUBNET_TYPE,
          }),
          securityGroups: [lambdaSecurityGroup],
        }
      );
      secret.grantRead(lambda);
      const integration = new aws_apigatewayv2_integrations.HttpLambdaIntegration(
        `${STACK_NAME}-${lambdaName}Integration`,
        lambda
      );
  
      budgetApi.addRoutes({
        path: route,
        methods: httpMethods,
        integration: integration,
      });

      lambda.role?.addManagedPolicy(
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonElastiCacheFullAccess',
        ),
      );
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
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${STACK_NAME}-Vpc-Subnet-PWN`,
          subnetType: SUBNET_TYPE,
        }
        // {
        //   cidrMask: 24,
        //   name: `${STACK_NAME}-Vpc-Subnet-PUB`,
        //   subnetType: aws_ec2.SubnetType.PUBLIC,
        // },
      ],
    });

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

    const redisSecurityGroup = new aws_ec2.SecurityGroup(
      this,
      `${STACK_NAME}-redisSecurityGroup`,
      {
        vpc,
      }
    );

    lambdaSecurityGroup.connections.allowTo(
      redisSecurityGroup,
      aws_ec2.Port.tcp(6379),
      "Allow this lambda function connect to the redis cache"
    );

    const redisSubnetGroup = new aws_elasticache.CfnSubnetGroup(
      this,
      `${STACK_NAME}-redisSubnetGroup`,
      {
        description: "Subnet group for the redis cluster",
        subnetIds: vpc.publicSubnets.map((ps) => ps.subnetId),
        cacheSubnetGroupName: `${STACK_NAME}-redisSubnetGroup`,
      }
    );

    const redisCache = new aws_elasticache.CfnCacheCluster(
      this,
      `${STACK_NAME}-RedisCache`,
      {
        engine: "redis",
        cacheNodeType: "cache.t3.micro",
        numCacheNodes: 1,
        clusterName: `${STACK_NAME}-RedisCache`,
        vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
        cacheSubnetGroupName: redisSubnetGroup.ref,
        engineVersion: "6.2",
        preferredMaintenanceWindow: "fri:00:30-fri:01:30",
      }
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
    db.connections.allowFromAnyIpv4(aws_ec2.Port.tcp(5432))

    const secret = new aws_secretsmanager.Secret(
      this,
      `${STACK_NAME}-Secret`,
      {
        description: `Secret for Budget API`,
        secretName: `${STACK_NAME}-Secret`,
      }
    );

    const dbProxy = new aws_rds.DatabaseProxy(
      this,
      'Proxy',
      {
        proxyTarget: aws_rds.ProxyTarget.fromInstance(db),
        secrets: [db.secret!],
        securityGroups: [dbSecurityGroup],
        vpc,
        requireTLS: false,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SUBNET_TYPE,
        }),
      }
    );

    const authorizerLambda: aws_lambda.IFunction = new aws_lambda.Function(
      this,
      `${STACK_NAME}-AuthorizerLambda`,
      {
        runtime: aws_lambda.Runtime.NODEJS_24_X,
        functionName: `${STACK_NAME}-AuthorizerLambda`,
        handler: 'handler',
        code: aws_lambda.Code.fromAsset('src/v1/authorizer/index.ts'),
        // bundling: {
        //   externalModules: [
        //     'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        //     'pg-native',
        //   ],
        // },
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SUBNET_TYPE,
        }),
        securityGroups: [lambdaSecurityGroup],
        environment: {
          REDIS_URL: `redis://${redisCache.attrRedisEndpointAddress}:${redisCache.attrRedisEndpointPort}`,
        }
      }
    );
    secret.grantRead(authorizerLambda);
    authorizerLambda.role?.addManagedPolicy(
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonElastiCacheFullAccess',
      ),
    );
    authorizerLambda.role?.addManagedPolicy(
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaENIManagementAccess',
      ),
    );

    const authorizer = new aws_apigatewayv2_authorizers.HttpLambdaAuthorizer(
      `${STACK_NAME}-HttpLambdaAuthorizer`,
      authorizerLambda,
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
        defaultAuthorizer: authorizer,
        description: 'Rest API for the Budget application',
        defaultDomainMapping: { domainName },
      }
    );

    createLambdaAndRoute(
      'GetAuth',
      'getHandler',
      'src/v1/handlers/auth/login/item.ts',
      '/v1/auth/login',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetMigrations',
      'getHandler',
      'src/v1/handlers/db/migrations/item.ts',
      '/v1/db/migrations',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetSeeds',
      'getHandler',
      'src/v1/handlers/db/seeds/item.ts',
      '/v1/db/seeds',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetDbDescription',
      'getHandler',
      'src/v1/handlers/db/describe/item.ts',
      '/v1/db/describe',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetBudgetItemsForYear',
      'getHandler',
      'src/v1/handlers/budgets/items.ts',
      '/v1/budgets/{budgetGuid}/items',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CopyBudgetItemsToYear',
      'postHandler',
      'src/v1/handlers/budgets/items.ts',
      '/v1/budgets/{budgetGuid}/items/copy',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'CreateBudgetItem',
      'postHandler',
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}/items',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'UpdateBudgetItem',
      'putHandler',
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}/items/{itemGuid}',
      [ aws_apigatewayv2.HttpMethod.PUT ]
    );

    createLambdaAndRoute(
      'DeleteBudgetItem',
      'deleteHandler',
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}/items/{itemGuid}',
      [ aws_apigatewayv2.HttpMethod.DELETE ]
    );

    createLambdaAndRoute(
      'GetCategories',
      'getHandler',
      'src/v1/handlers/budgets/categories.ts',
      '/v1/budgets/{budgetGuid}/categories',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CreateCategory',
      'postHandler',
      'src/v1/handlers/budgets/category.ts',
      '/v1/budgets/{budgetGuid}/categories',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'GetSubcategories',
      'getHandler',
      'src/v1/handlers/budgets/subcategories.ts',
      '/v1/budgets/{budgetGuid}/subcategories',
      [ aws_apigatewayv2.HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CreateSubcategory',
      'postHandler',
      'src/v1/handlers/budgets/subcategory.ts',
      '/v1/budgets/{budgetGuid}/categories/{categoryGuid}/subcategories',
      [ aws_apigatewayv2.HttpMethod.POST ]
    );
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`, { env: { account: '360115878429', region: 'us-east-1' }});
