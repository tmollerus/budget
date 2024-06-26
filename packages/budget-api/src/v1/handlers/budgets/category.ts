import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { createCategoryRecord, deleteCategory } from '../../managers/postgres';
import { CategoryRecord } from '../../types';

export const postHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const category: CategoryRecord = JSON.parse(event.body || '{}');

  try {
    const createdItem = await createCategoryRecord(budgetGuid, category);

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

export const deleteHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const categoryGuid = event.pathParameters?.categoryGuid || '';

  try {
    const item = await deleteCategory(budgetGuid, categoryGuid);

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
