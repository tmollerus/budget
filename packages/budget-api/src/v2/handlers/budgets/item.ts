import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { createBudgetItem, getBudgetItemsByYear, softDeleteBudgetItem, updateBudgetItem } from '../../../managers/dynamodb';
import { ItemRecord } from '../../../types';

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
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const postHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const budgetItem: ItemRecord = JSON.parse(event.body || '{}');

  try {
    const createdItem = await createBudgetItem(budgetGuid, budgetItem);

    return {
      statusCode: 200,
      body: JSON.stringify(createdItem),
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const putHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const budgetItem: ItemRecord = JSON.parse(event.body || '{}');

  try {
    const item = await updateBudgetItem(budgetGuid, budgetItem);

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const deleteHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const itemGuid = event.pathParameters?.itemGuid || '';

  try {
    const item = await softDeleteBudgetItem(budgetGuid, itemGuid);

    return {
      statusCode: 200,
      body: '',
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
