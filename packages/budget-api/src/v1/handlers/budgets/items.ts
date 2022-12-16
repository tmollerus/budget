import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getBudgetItemsByYear, getStartingBalanceForYear } from '../../managers/postgres';

export const getHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';

  try {
    const items = await getBudgetItemsByYear(budgetGuid, year);
    const starting_balance = await getStartingBalanceForYear(budgetGuid, year);

    return {
      statusCode: 200,
      body: JSON.stringify({items, starting_balance}),
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
