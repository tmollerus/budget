import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { createSubcategoryRecord, deleteSubcategory } from '../../../managers/dynamodb';
import { SubcategoryRecord } from '../../../types';

export const postHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const subcategory: SubcategoryRecord = JSON.parse(event.body || '{}');

  try {
    const createdItem = await createSubcategoryRecord(budgetGuid, subcategory);

    return {
      statusCode: 200,
      body: JSON.stringify(createdItem),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const deleteHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const subcategoryGuid = event.pathParameters?.subcategoryGuid || '';

  try {
    const item = await deleteSubcategory(budgetGuid, subcategoryGuid);

    return {
      statusCode: 200,
      body: '',
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};
