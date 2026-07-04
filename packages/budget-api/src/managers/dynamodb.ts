import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { BudgetRecord, CategoryRecord, ItemRecord, QueryResult, SubcategoryRecord, UserRecord } from '../types';
import { logElapsedTime } from '../utils/event';

export const getClient = async (): Promise<any> => {
  return new DynamoDBClient({});
 };

 export const getBudgetByEmail = async (email: string): Promise<BudgetRecord | void> => {
  const client = await getClient();

  try {
    const getUserCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      IndexName: process.env.DYNAMODB_INDEX_NAME,
      KeyConditionExpression: "pk = :userId",
      ExpressionAttributeValues: {
        ":userId": `user#${email}`,
      }
    });

    const getUserResponse = await client.send(getUserCommand);
    console.log(getUserResponse);

    const getBudgetCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid",
      ExpressionAttributeValues: {
        ":budgetGuid": getUserResponse.Items?.[0]?.pk?.replace('user#', 'budget#'),
      }
    });
    const response = await client.send(getBudgetCommand);
    return response.Items?.[0] as BudgetRecord | undefined;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const getBudgetItemsByYear = async (budgetGuid: string, year: string): Promise<Array<ItemRecord> | void> => {
  const client = await getClient();
  const startTime = new Date();

  try {
    return;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const getCategoriesByBudget = async (budgetGuid: string): Promise<Array<CategoryRecord> | void> => {
  const client = await getClient();

  try {
    return;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const getSubcategoriesByBudget = async (budgetGuid: string): Promise<Array<SubcategoryRecord> | void> => {
  const client = await getClient();

  try {
    return;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const createBudgetItem = async (budgetGuid: string, budgetItem: ItemRecord): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Inserting item', budgetItem);
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `item#${uuidv4()}`,
        ...budgetItem,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      },
    });

    const response = await client.send(command);
    console.log(response);
    return response.Items?.[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const createCategoryRecord = async (budgetGuid: string, category: CategoryRecord): Promise<any> => {
  const client = await getClient();

  try {
    return;
  } catch (err) {
    console.log(err);
  }
 };

 export const createSubcategoryRecord = async (subcategory: SubcategoryRecord): Promise<any> => {
  const client = await getClient();

  try {
    return;
  } catch (err) {
    console.log(err);
  }
 };

 export const createUserRecord = async (budgetGuid: string, email: string, fullName: string): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Inserting user', { email, fullName });
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `user#${email}`,
        fullName,
        active: true,
        dateLastLogin: new Date().toISOString(),
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      },
    });

    const response = await client.send(command);
    console.log(response);
    return response.Items?.[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const copyFromYear = async (budgetGuid: string, fromYear: string, toYear: string): Promise<boolean> => {
  const client = await getClient();

  try {
    return false
  } catch (err) {
    console.log(err);
  }

  return false;
 };

 export const deleteFromYear = async (budgetGuid: string, fromYear: string): Promise<boolean> => {
  const client = await getClient();

  try {
    return false;
  } catch (err) {
    console.log(err);
  }

  return false;
 };

 export const deleteCategory = async (budgetGuid: string, categoryGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    return;
  } catch (err) {
    console.log(err);
  }
 };

 export const deleteSubcategory = async (budgetGuid: string, subcategoryGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    return;
  } catch (err) {
    console.log(err);
  }
 };

 export const softDeleteBudgetItem = async (budgetGuid: string, itemGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Soft deleting item', itemGuid);
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `item#${itemGuid}`,
        active: false,
        dateModified: new Date().toISOString(),
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
      },
    });

    const response = await client.send(command);
    console.log(response);
    return response.Items?.[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const updateBudgetItem = async (budgetGuid: string, budgetItem: ItemRecord): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Updating item', budgetItem);
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `item#${budgetItem.guid}`,
        ...budgetItem,
        dateModified: new Date().toISOString(),
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
      },
    });

    const response = await client.send(command);
    console.log(response);
    return response.Items?.[0];
  } catch (err) {
    console.log(err);
  }
 };
