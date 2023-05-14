import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { DomainName, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { CfnCacheCluster, CfnSubnetGroup } from '@aws-cdk/aws-elasticache';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { InstanceClass, InstanceSize, InstanceType, Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { IFunction, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, DatabaseProxy, PostgresEngineVersion, ProxyTarget } from '@aws-cdk/aws-rds';
import { LOCAL_DOMAIN } from '../src/v1/constants/environment';
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from '../src/v1/utils/cdk';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

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

    const createLambdaAndRoute = (
      lambdaName: string,
      lambdaHandler: string,
      lambdaEntry: string,
      route: string,
      httpMethods: Array<HttpMethod>,
    ) => {
      const lambda = new NodejsFunction(
        this,
        `${STACK_NAME}-${lambdaName}Lambda`,
        {
          runtime: Runtime.NODEJS_16_X,
          functionName: `${STACK_NAME}-${lambdaName}`,
          handler: lambdaHandler,
          entry: lambdaEntry,
          timeout: Duration.seconds(60),
          bundling: {
            externalModules: [
              'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
              'pg-native',
            ],
          },
          environment: {
            ALLOWED_ORIGINS: ALLOWED_ORIGINS.join(','),
            REDIS_URL: `redis://${redisCache.attrRedisEndpointAddress}:${redisCache.attrRedisEndpointPort}`,
          },
          vpc,
          vpcSubnets: vpc.selectSubnets({
            subnetType: SubnetType.PUBLIC,
          }),
          allowPublicSubnet: true,
          securityGroups: [lambdaSecurityGroup],
        }
      );
      secret.grantRead(lambda);
      const integration = new HttpLambdaIntegration(
        `${STACK_NAME}-${lambdaName}Integration`,
        lambda
      );
  
      budgetApi.addRoutes({
        path: route,
        methods: httpMethods,
        integration: integration,
      });

      lambda.role?.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonElastiCacheFullAccess',
        ),
      );
      lambda.role?.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaENIManagementAccess',
        ),
      );
    };

    const vpc = new Vpc(this, `${STACK_NAME}-Vpc`, {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${STACK_NAME}-Vpc-Subnet-PWN`,
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: `${STACK_NAME}-Vpc-Subnet-PUB`,
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    const dbSecurityGroup = new SecurityGroup(
      this,
      `${STACK_NAME}-dbSecurityGroup`,
      {
        vpc,
      }
    );

    const lambdaSecurityGroup = new SecurityGroup(
      this,
      `${STACK_NAME}-lambdaSecurityGroup`,
      {
        vpc,
      }
    );

    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      Port.tcp(5432),
      'Allow lambdas to access budget postgres database'
    );

    const redisSecurityGroup = new SecurityGroup(
      this,
      `${STACK_NAME}-redisSecurityGroup`,
      {
        vpc,
      }
    );

    lambdaSecurityGroup.connections.allowTo(
      redisSecurityGroup,
      Port.tcp(6379),
      "Allow this lambda function connect to the redis cache"
    );

    const redisSubnetGroup = new CfnSubnetGroup(
      this,
      `${STACK_NAME}-redisSubnetGroup`,
      {
        description: "Subnet group for the redis cluster",
        subnetIds: vpc.publicSubnets.map((ps) => ps.subnetId),
        cacheSubnetGroupName: `${STACK_NAME}-redisSubnetGroup`,
      }
    );

    const redisCache = new CfnCacheCluster(
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
    const db = new DatabaseInstance(
      this,
      `${STACK_NAME}-Database`,
      {
        engine: DatabaseInstanceEngine.postgres({
          version: PostgresEngineVersion.VER_14_2,
        }),
        instanceType: InstanceType.of(
          InstanceClass.BURSTABLE3,
          InstanceSize.MICRO
        ),
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PUBLIC,
        }),
        databaseName,
        securityGroups: [dbSecurityGroup],
        credentials: Credentials.fromGeneratedSecret('postgres'),
        allocatedStorage: 10,
        maxAllocatedStorage: 200,
        allowMajorVersionUpgrade: true,
      }
    );
    db.connections.allowFromAnyIpv4(Port.tcp(5432))

    const secret = new Secret(this,
      `${STACK_NAME}-Secret`,
      {
        description: `Secret for Budget API`,
        secretName: `${STACK_NAME}-Secret`,
      }
    );

    const dbProxy = new DatabaseProxy(this, 'Proxy', {
      proxyTarget: ProxyTarget.fromInstance(db),
      secrets: [db.secret!],
      securityGroups: [dbSecurityGroup],
      vpc,
      requireTLS: false,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SubnetType.PUBLIC,
      }),
    });

    const authorizerLambda: IFunction = new NodejsFunction(
      this,
      `${STACK_NAME}-AuthorizerLambda`,
      {
        runtime: Runtime.NODEJS_16_X,
        functionName: `${STACK_NAME}-AuthorizerLambda`,
        handler: 'handler',
        entry: 'src/v1/authorizer/index.ts',
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
            'pg-native',
          ],
        },
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PUBLIC,
        }),
        allowPublicSubnet: true,
        securityGroups: [lambdaSecurityGroup],
        environment: {
          REDIS_URL: `redis://${redisCache.attrRedisEndpointAddress}:${redisCache.attrRedisEndpointPort}`,
        }
      }
    );
    secret.grantRead(authorizerLambda);
    authorizerLambda.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonElastiCacheFullAccess',
      ),
    );
    authorizerLambda.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaENIManagementAccess',
      ),
    );

    const authorizer = new HttpLambdaAuthorizer(
      `${STACK_NAME}-HttpLambdaAuthorizer`,
      authorizerLambda,
      {
        responseTypes: [HttpLambdaResponseType.IAM],
        resultsCacheTtl: Duration.seconds(0),
      }
    );

    const domainName = new DomainName(
      this,
      `${STACK_NAME}-DomainName`,
      {
        domainName: process.env.DOMAIN_NAME || '',
        certificate: Certificate.fromCertificateArn(this, 'cert', CERT_ARN),
      }
    );

    const budgetApi = new HttpApi(
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
      [ HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetMigrations',
      'getHandler',
      'src/v1/handlers/db/migrations/item.ts',
      '/v1/db/migrations',
      [ HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetSeeds',
      'getHandler',
      'src/v1/handlers/db/seeds/item.ts',
      '/v1/db/seeds',
      [ HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetDbDescription',
      'getHandler',
      'src/v1/handlers/db/describe/item.ts',
      '/v1/db/describe',
      [ HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'GetBudgetItemsForYear',
      'getHandler',
      'src/v1/handlers/budgets/items.ts',
      '/v1/budgets/{budgetGuid}/items',
      [ HttpMethod.GET ]
    );

    createLambdaAndRoute(
      'CopyBudgetItemsToYear',
      'postHandler',
      'src/v1/handlers/budgets/items.ts',
      '/v1/budgets/{budgetGuid}/items/copy',
      [ HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'CreateBudgetItem',
      'postHandler',
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}/items',
      [ HttpMethod.POST ]
    );

    createLambdaAndRoute(
      'UpdateBudgetItem',
      'putHandler',
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}/items/{itemGuid}',
      [ HttpMethod.PUT ]
    );

    createLambdaAndRoute(
      'DeleteBudgetItem',
      'deleteHandler',
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}/items/{itemGuid}',
      [ HttpMethod.DELETE ]
    );
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`, { env: { account: '360115878429', region: 'us-east-1' }});
