import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';

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

export const getAllowedPreflightMethods = (): Array<CorsHttpMethod> => {
  return [
    CorsHttpMethod.GET,
    CorsHttpMethod.HEAD,
    CorsHttpMethod.OPTIONS,
    CorsHttpMethod.POST,
    CorsHttpMethod.PUT,
  ];
};
