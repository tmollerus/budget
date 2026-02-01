import { aws_apigatewayv2 } from 'aws-cdk-lib';

export const getAllowedOrigins = (corsDomains: string | undefined, localDomain: string): Array<string> => {
  const allowedDomains: Array<string> = [];
  corsDomains?.split(',').forEach((corsDomain) => {
    if (corsDomain) {
      allowedDomains.push(corsDomain.trim());
    }
  });
  allowedDomains.push(localDomain);

  return allowedDomains;
};

export const getAllowedPreflightHeaders = (): Array<string> => {
  return [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent',
  ];
};

export const getAllowedPreflightMethods = (): Array<aws_apigatewayv2.CorsHttpMethod> => {
  return [
    aws_apigatewayv2.CorsHttpMethod.DELETE,
    aws_apigatewayv2.CorsHttpMethod.GET,
    aws_apigatewayv2.CorsHttpMethod.HEAD,
    aws_apigatewayv2.CorsHttpMethod.OPTIONS,
    aws_apigatewayv2.CorsHttpMethod.POST,
    aws_apigatewayv2.CorsHttpMethod.PUT,
  ];
};
