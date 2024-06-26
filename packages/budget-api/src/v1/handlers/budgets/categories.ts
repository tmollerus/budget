import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getCategoriesByBudget } from '../../managers/postgres';

export const getHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';

  try {
    const categories = await getCategoriesByBudget(budgetGuid);
    
    return {
      statusCode: 200,
      body: JSON.stringify({categories}),
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
