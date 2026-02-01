import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export const getSecret = async (secretId: string) => {
  const secretsManagerClient = new SecretsManagerClient({});
  const secretParams = {
    SecretId: secretId,
  };

  const secretValue = await secretsManagerClient.send(
    new GetSecretValueCommand({
      ...secretParams,
    }),
  )

  return JSON.parse(secretValue.SecretString || '{}');
};
