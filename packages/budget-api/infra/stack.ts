import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { ApiMapping, DomainName, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { LOCAL_DOMAIN } from '../src/v1/constants/environment';
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from '../src/v1/utils/cdk';

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

    const vpc = Vpc.fromLookup(
      this,
      `${process.env.ENV_NAME}-Vpc`,
      {
        vpcId: 'vpc-b7a5cdcf',
      },
    );

    const securityGroup = SecurityGroup.fromLookupById(
      this,
      `${process.env.ENV_NAME}-SecurityGroup`,
      'sg-2a96cb5e',
    );

    const secret = new Secret(this,
      `${stackName}-Secret`,
      {
        description: `Secret for Budget API`,
        secretName: `${stackName}-Secret`,
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
          subnetType: SubnetType.PRIVATE_ISOLATED,
        }),
        securityGroups: [securityGroup],
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
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`, { env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' }});
