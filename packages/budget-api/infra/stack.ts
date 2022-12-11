import { App, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { EndpointType, LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { LOCAL_DOMAIN } from '../src/v1/constants/environment';
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from '../src/v1/utils/cdk';

console.log(process.env);
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

    const budgetApi = new RestApi(
      this,
      `${stackName}-RestApi`,
      {
        endpointTypes: [EndpointType.REGIONAL],
        restApiName: `${stackName}-RestApi`,
        defaultCorsPreflightOptions: {
          allowHeaders: getAllowedPreflightHeaders(),
          allowMethods: getAllowedPreflightMethods(),
          allowCredentials: false,
          allowOrigins: allowedOrigins,
        },
        deployOptions: {
          stageName: 'v1',
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
        entry: 'src/v1/handers/auth/login/item.ts',
        timeout: Duration.seconds(60),
        environment: {
          ALLOWED_ORIGINS: allowedOrigins.join(','),
        },
      }
    );

    const authResource =  budgetApi.root.addResource('auth/login');
    authResource.addMethod(
      'GET',
      new LambdaIntegration(getAuthLambda)
    );
  }
}

const app = new App();
new BudgetApiStack(app, `budget-api`);
