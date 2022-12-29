import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { copyFromYear, getBudgetItemsByYear, getStartingBalanceForYear } from '../../managers/postgres';

export const getHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
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
export const postHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';
  const toYear = event.queryStringParameters?.to || '';

  try {
    const isCopySuccessful = await copyFromYear(budgetGuid, year, toYear);
    
    if (isCopySuccessful) {
      return {
        statusCode: 200,
        body: '{}',
      };
    } else {
      return {
        statusCode: 500,
        body: '{"error": "Copy failed"}',
      };
    }
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
