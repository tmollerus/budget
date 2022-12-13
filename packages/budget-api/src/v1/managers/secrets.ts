const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html


export const getSecrets = async (secretId: string): Promise<any> => {
  const secretsManager = new SecretsManagerClient({ region: "us-east-1" });

  return JSON.parse(secretsManager.getSecretValue({ secretId }));
};
