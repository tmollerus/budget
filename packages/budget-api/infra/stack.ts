import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { ApiMapping, DomainName, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { InstanceClass, InstanceSize, InstanceType, Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { Code, Function, IFunction, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from '@aws-cdk/aws-rds';
import { LOCAL_DOMAIN } from '../src/v1/constants/environment';
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from '../src/v1/utils/cdk';

// Heavily inspired by https://www.freecodecamp.org/news/aws-lambda-rds/

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
    const stackName = `${process.env.ENV_NAME}-${id}`;
    const allowedOrigins = getAllowedOrigins(process.env.CORS_DOMAINS, LOCAL_DOMAIN);

    const vpc = new Vpc(this, `${stackName}-Vpc`, {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${stackName}-Vpc-Subnet-PWN`,
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: `${stackName}-Vpc-Subnet-PUB`,
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    const dbSecurityGroup = new SecurityGroup(
      this,
      `${stackName}-dbSecurityGroup`,
      {
        vpc,
      }
    );

    const lambdaSecurityGroup = new SecurityGroup(
      this,
      `${stackName}-lambdaSecurityGroup`,
      {
        vpc,
      }
    );

    dbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      Port.tcp(5432),
      'Allow lambdas to access budget postgres database'
    );
    
    const databaseName = (`${process.env.ENV_NAME}${id.replace('-', '')}db`);
    const db = new DatabaseInstance(
      this,
      `${stackName}-Database`,
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
          subnetType: SubnetType.PRIVATE_WITH_NAT,
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
      `${stackName}-Secret`,
      {
        description: `Secret for Budget API`,
        secretName: `${stackName}-Secret`,
      }
    );

    const authorizerLambda: IFunction = new NodejsFunction(
      this,
      `${stackName}-AuthorizerLambda`,
      {
        runtime: Runtime.NODEJS_16_X,
        functionName: `${stackName}-AuthorizerLambda`,
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
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [lambdaSecurityGroup],
      }
    );

    const authorizer = new HttpLambdaAuthorizer(
      `${stackName}-HttpLambdaAuthorizer`,
      authorizerLambda,
      {
        responseTypes: [HttpLambdaResponseType.IAM],
        resultsCacheTtl: Duration.minutes(2),
      }
    );

    const budgetApi = new HttpApi(
      this,
      `${stackName}-HttpApi`,
      {
        apiName: `${stackName}-HttpApi`,
        createDefaultStage: false,
        corsPreflight: {
          allowHeaders: getAllowedPreflightHeaders(),
          allowMethods: getAllowedPreflightMethods(),
          allowCredentials: false,
          allowOrigins: allowedOrigins,
        },
        defaultAuthorizer: authorizer,
        description: 'Rest API for the Budget application',
      }
    );

    const getAuthLambda = new NodejsFunction(
      this,
      `${stackName}-GetAuthLambda`,
      {
        runtime: Runtime.NODEJS_16_X,
        functionName: `${stackName}-GetAuthLambda`,
        handler: 'getHandler',
        entry: 'src/v1/handlers/auth/login/item.ts',
        timeout: Duration.seconds(60),
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
            'pg-native',
          ],
        },
        environment: {
          ALLOWED_ORIGINS: allowedOrigins.join(','),
        },
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [lambdaSecurityGroup],
      }
    );
    secret.grantRead(getAuthLambda);
    const getAuthIntegration = new HttpLambdaIntegration(
      `${stackName}-GetAuthIntegration`,
      getAuthLambda
    );

    budgetApi.addRoutes({
      path: '/v1/auth/login',
      methods: [ HttpMethod.GET ],
      integration: getAuthIntegration,
    });

    // const domainName = DomainName.fromDomainNameAttributes(
    //   this,
    //   `${stackName}-domainName`,
    //   // @ts-ignore
    //   {
    //     domainName: process.env.DOMAIN_NAME || '',
    //   }
    // );

    // const apiMapping = new ApiMapping(this, 'MyApiMapping', {
    //   api: budgetApi,
    //   domainName: domainName,
    
    //   // the properties below are optional
    //   apiMappingKey: 'apiMappingKey',
    //   stage: stage,
    // });

    // new BasePathMapping(this, `${stackName}-BasePathMapping`, {
    //   domainName: domainName,
    //   restApi: budgetApi,
    //   basePath: 'auth',
    // });

    const getMigrationsLambda = new NodejsFunction(
      this,
      `${stackName}-GetMigrationsLambda`,
      {
        runtime: Runtime.NODEJS_16_X,
        functionName: `${stackName}-GetMigrationsLambda`,
        handler: 'getHandler',
        entry: 'src/v1/handlers/db/migrations/item.ts',
        timeout: Duration.seconds(60),
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
            'pg-native',
          ],
        },
        environment: {
          ALLOWED_ORIGINS: allowedOrigins.join(','),
        },
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [lambdaSecurityGroup],
      }
    );
    secret.grantRead(getMigrationsLambda);
    const getMigrationsIntegration = new HttpLambdaIntegration(
      `${stackName}-GetMigrationsIntegration`,
      getMigrationsLambda
    );

    budgetApi.addRoutes({
      path: '/v1/db/migrations',
      methods: [ HttpMethod.GET ],
      integration: getMigrationsIntegration,
    });

    const getSeedsLambda = new NodejsFunction(
      this,
      `${stackName}-GetSeedsLambda`,
      {
        runtime: Runtime.NODEJS_16_X,
        functionName: `${stackName}-GetSeedsLambda`,
        handler: 'getHandler',
        entry: 'src/v1/handlers/db/seeds/item.ts',
        timeout: Duration.seconds(60),
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
            'pg-native',
          ],
        },
        environment: {
          ALLOWED_ORIGINS: allowedOrigins.join(','),
        },
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [lambdaSecurityGroup],
      }
    );
    secret.grantRead(getSeedsLambda);
    const getSeedsIntegration = new HttpLambdaIntegration(
      `${stackName}-GetSeedsIntegration`,
      getSeedsLambda
    );

    budgetApi.addRoutes({
      path: '/v1/db/seeds',
      methods: [ HttpMethod.GET ],
      integration: getSeedsIntegration,
    });

    const getDbDescriptionLambda = new NodejsFunction(
      this,
      `${stackName}-GetDbDescriptionLambda`,
      {
        runtime: Runtime.NODEJS_16_X,
        functionName: `${stackName}-GetDbDescriptionLambda`,
        handler: 'getHandler',
        entry: 'src/v1/handlers/db/describe/item.ts',
        timeout: Duration.seconds(60),
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
            'pg-native',
          ],
        },
        environment: {
          ALLOWED_ORIGINS: allowedOrigins.join(','),
        },
        vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [lambdaSecurityGroup],
      }
    );
    secret.grantRead(getDbDescriptionLambda);
    const getDbDescriptionIntegration = new HttpLambdaIntegration(
      `${stackName}-GetDbDescriptionIntegration`,
      getDbDescriptionLambda
    );

    budgetApi.addRoutes({
      path: '/v1/db/describe',
      methods: [ HttpMethod.GET ],
      integration: getDbDescriptionIntegration,
    });
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`, { env: { account: '360115878429', region: 'us-east-1' }});
