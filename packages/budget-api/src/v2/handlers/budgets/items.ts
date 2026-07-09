import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { copyFromYear, deleteFromYear, getBudget, getBudgetItemsByYear } from '../../../managers/dynamodb';

const memoryCache: Record<string, { startingBalance: number; }> = {};

export const getHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';

  try {
    const items = await getBudgetItemsByYear(budgetGuid, year);
    
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

export const countHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';

  try {
    const items = await getBudgetItemsByYear(budgetGuid, year);
    
    return {
      statusCode: 200,
      body: JSON.stringify({count: items?.length || 0}),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const startingBalanceHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const forYear = event.queryStringParameters?.year || '';
  const cacheKey = `${budgetGuid}-${forYear}`;

  try {
    // FIX: how do we invalidate cache keys when items are added/updated/deleted?
    // By sending a clear cache parameter in the request.
    if (Number(forYear) < new Date().getFullYear() && memoryCache[cacheKey]) {
      return {
        statusCode: 200,
        body: JSON.stringify({ startingBalance: memoryCache[cacheKey].startingBalance }),
      };
    }

    const budget = await getBudget(budgetGuid);
    let startingBalance = Number(budget?.starting_balance) || 0;
  
    const items = await getBudgetItemsByYear(budgetGuid, forYear.toString(), true);
    const totalBalance = items!.reduce((acc, item) => {
      if (!item.active) {
        return acc;
      } else if (item.type_id === 1) {
        return acc + item.amount;
      } else {
        return acc - item.amount;
      }
    }, 0);
    startingBalance += totalBalance;

    memoryCache[cacheKey] = {
      startingBalance,
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify({ startingBalance }),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const postHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const fromYear = event.queryStringParameters?.from || '';
  const toYear = event.queryStringParameters?.to || '';

  try {
    const isCopySuccessful = await copyFromYear(budgetGuid, fromYear, toYear);
    
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
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const deleteHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const fromYear = event.queryStringParameters?.from || '';

  try {
    const isDeleteSuccessful = await deleteFromYear(budgetGuid, fromYear);
    
    if (isDeleteSuccessful) {
      return {
        statusCode: 200,
        body: '{}',
      };
    } else {
      return {
        statusCode: 500,
        body: '{"error": "Delete failed"}',
      };
    }
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
