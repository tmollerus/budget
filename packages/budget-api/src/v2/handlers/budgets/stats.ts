import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getStatsByYear } from '../../../managers/dynamodb';

export const getHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';

  try {
    const items = await getStatsByYear(budgetGuid, year);
    
    return {
      statusCode: 200,
      body: JSON.stringify({items}),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
