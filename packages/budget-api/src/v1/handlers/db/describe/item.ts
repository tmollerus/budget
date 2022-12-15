import { APIGatewayProxyResult } from 'aws-lambda';
import { describeDatabase } from '../../../managers/postgres';

export const getHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const dbInfo = await describeDatabase();
    return {
      statusCode: 200,
      body: `Success: ${String(dbInfo)}`,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: `Failure: ${err}`,
    };
  }

};
