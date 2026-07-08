import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { copyFromYear, deleteFromYear, getBudgetItemsByYear } from '../../../managers/dynamodb';

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
  let startingBalance = 0;

  try {
    // For each year from 2012 onwards
    for (let year = 2012; year > Number(forYear); year++) {
      // Get the items for that year
      const items = await getBudgetItemsByYear(budgetGuid, year.toString());
      // Sum the amounts for that year
      const yearBalance = items!.reduce((acc, item) => {
        if (item.type_id === 1) {
          return acc + item.amount;
        } else {
          return acc - item.amount;
        }
      }, 0);
      startingBalance += yearBalance;
    }
    
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


      // (SELECT SUM(budgets.starting_balance + (SELECT SUM(CASE WHEN type_id=1 THEN amount ELSE -amount END)
      //     FROM items
      //     WHERE EXTRACT(YEAR FROM "settledDate") < $2
      //       AND items.active = true
      //       AND items.budget_guid = $1)) AS balance         
      //     FROM budgets
      //     WHERE guid = $1
      //     GROUP BY guid
      // ) AS starting_balance,

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
