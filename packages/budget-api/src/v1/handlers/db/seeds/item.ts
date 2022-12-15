import { APIGatewayProxyResult } from 'aws-lambda';
import { applySeeds } from '../../../managers/postgres';

export const getHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const seedResult = await applySeeds();
    return {
      statusCode: 200,
      body: `Success: ${String(seedResult)}`,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: `Failure: ${err}`,
    };
  }

};
