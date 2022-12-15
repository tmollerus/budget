import { SecretsManager } from 'aws-sdk';

export const getSecret = async (secretId: string) => {
  const secretsManager = new SecretsManager();
  const secretParams = {
    SecretId: secretId,
  };

  const secretValue = await secretsManager.getSecretValue(secretParams).promise();

  return JSON.parse(secretValue.SecretString || '{}');
};
