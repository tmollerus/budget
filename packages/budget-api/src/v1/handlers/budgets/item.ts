import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { createBudgetItem, softDeleteBudgetItem } from '../../managers/postgres';
import { ItemRecord } from '../../types';

export const postHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const budgetItem: ItemRecord = JSON.parse(event.body || '{}');

  try {
    const item = await createBudgetItem(budgetGuid, budgetItem);

    return {
      statusCode: 200,
      body: JSON.stringify({item}),
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
