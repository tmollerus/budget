import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { ApiMapping, DomainName, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { InstanceClass, InstanceSize, InstanceType, Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { IFunction, Runtime } from '@aws-cdk/aws-lambda';
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

    const createLambdaAndRoute = (
      lambdaName: string,
      lambdaHandler: string,
      lambdaEntry: string,
      route: string,
      httpMethods: Array<HttpMethod>,
    ) => {
      const lambda = new NodejsFunction(
        this,
        `${stackName}-${lambdaName}Lambda`,
        {
          runtime: Runtime.NODEJS_16_X,
          functionName: `${stackName}-${lambdaName}`,
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
            ALLOWED_ORIGINS: allowedOrigins.join(','),
          },
          vpc,
          vpcSubnets: vpc.selectSubnets({
            subnetType: SubnetType.PRIVATE_WITH_NAT,
          }),
          securityGroups: [lambdaSecurityGroup],
        }
      );
      secret.grantRead(lambda);
      const integration = new HttpLambdaIntegration(
        `${stackName}-${lambdaName}Integration`,
        lambda
      );
  
      budgetApi.addRoutes({
        path: route,
        methods: httpMethods,
        integration: integration,
      });
    };

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
    secret.grantRead(authorizerLambda);

    const authorizer = new HttpLambdaAuthorizer(
      `${stackName}-HttpLambdaAuthorizer`,
      authorizerLambda,
      {
        responseTypes: [HttpLambdaResponseType.IAM],
        resultsCacheTtl: Duration.seconds(0),
      }
    );

    const domainName = new DomainName(
      this,
      `${stackName}-DomainName`,
      {
        domainName: process.env.DOMAIN_NAME || '',
        certificate: Certificate.fromCertificateArn(this, 'cert', 'arn:aws:acm:us-east-1:360115878429:certificate/9da4d61d-3c50-4685-a7e7-288e59b67720'),
      }
    );

    const budgetApi = new HttpApi(
      this,
      `${stackName}-HttpApi`,
      {
        apiName: `${stackName}-HttpApi`,
        corsPreflight: {
          allowHeaders: getAllowedPreflightHeaders(),
          allowMethods: getAllowedPreflightMethods(),
          allowCredentials: false,
          allowOrigins: allowedOrigins,
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
      'src/v1/handlers/budgets/item.ts',
      '/v1/budgets/{budgetGuid}',
      [ HttpMethod.GET ]
    );
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`, { env: { account: '360115878429', region: 'us-east-1' }});
