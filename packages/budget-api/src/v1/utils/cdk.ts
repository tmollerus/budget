export const getAllowedOrigins = (corsDomains: string | undefined, localDomain: string): Array<string> => {
  const allowedDomains: Array<string> = [];
  corsDomains?.split(',').forEach((corsDomain) => {
    allowedDomains.push(corsDomain.trim());
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

export const getAllowedPreflightMethods = (): Array<string> => {
  return ['OPTIONS', 'GET', 'POST', 'PUT'];
};
