import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { createCategoryRecord, createSubcategoryRecord, deleteCategory, deleteSubcategory } from '../../managers/postgres';
import { CategoryRecord, SubcategoryRecord } from '../../types';

export const postHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  // const budgetGuid = event.pathParameters?.budgetGuid || '';
  const categoryGuid = event.pathParameters?.categoryGuid || '';
  const subcategory: SubcategoryRecord = JSON.parse(event.body || '{}');

  try {
    const createdItem = await createSubcategoryRecord(categoryGuid, subcategory);

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
  const subcategoryGuid = event.pathParameters?.subcategoryGuid || '';

  try {
    const item = await deleteSubcategory(budgetGuid, subcategoryGuid);

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
