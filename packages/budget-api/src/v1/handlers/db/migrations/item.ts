import { APIGatewayProxyResult } from 'aws-lambda';
import { runMigrations } from '../../../managers/postgres';

export const getHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const migrationResult = await runMigrations();
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
