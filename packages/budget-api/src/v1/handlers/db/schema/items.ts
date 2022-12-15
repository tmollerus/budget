import { APIGatewayProxyResult } from 'aws-lambda';
import { createSchema } from '../../../managers/postgres';

export const getHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const migrationResult = await createSchema();
    return {
      statusCode: 200,
      body: `Success: ${String(migrationResult)}`,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: `Failure: ${err}`,
    };
  }

};
