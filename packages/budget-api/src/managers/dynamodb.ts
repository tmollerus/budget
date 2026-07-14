import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DeleteCommand, DynamoDBDocumentClient, paginateQuery, PutCommand, QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { BudgetRecord, CategoryRecord, ItemRecord, SubcategoryRecord, StatsRecord } from '../types';
import { logQueryEfficiency } from "../utils/db";

export const getClient = async (): Promise<any> => {
  return new DynamoDBClient({});
};

export const getDocClient = async (client: DynamoDBClient): Promise<any> => {
  return DynamoDBDocumentClient.from(client);
};

export const getBudget = async (guid: string): Promise<BudgetRecord | void> => {
  const client = await getClient();

  try {
    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :guid AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":guid": `budget#${guid}`,
        ":skPrefix": "budget#"
      },
      ReturnConsumedCapacity: "INDEXES"
    });

    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items?.[0] as BudgetRecord | undefined;
  } catch (err) {
    console.error(err);
  }
};

export const getBudgets = async (): Promise<Array<BudgetRecord> | void> => {
  const client = await getClient();

  try {
    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":skPrefix": "budget#"
      },
      ReturnConsumedCapacity: "INDEXES"
    });

    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items;
  } catch (err) {
    console.error(err);
  }
};

export const getBudgetByEmail = async (email: string): Promise<BudgetRecord | void> => {
  const client = await getClient();

  try {
    const getUserCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      IndexName: process.env.DYNAMODB_INDEX_NAME,
      KeyConditionExpression: "sk = :userId",
      ExpressionAttributeValues: {
        ":userId": `user#${email}`,
      },
      ReturnConsumedCapacity: "INDEXES"
    });

    const getUserResponse: QueryCommandOutput = await client.send(getUserCommand);
    console.log(logQueryEfficiency(getUserResponse));

    const getBudgetCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":budgetGuid": getUserResponse.Items?.[0]?.pk?.replace('user#', 'budget#'),
        ":skPrefix": "budget#",
      },
      ReturnConsumedCapacity: "INDEXES"
    });
    const response = await client.send(getBudgetCommand);
    console.log(logQueryEfficiency(response));

    return response.Items?.[0] as BudgetRecord | undefined;
  } catch (err) {
    console.error(err);
  }
};

export const getBudgetItemsByYear = async (budgetGuid: string, year: string, upToYear: boolean = false): Promise<Array<ItemRecord> | void> => {
  const client = await getClient();
  const docClient = await getDocClient(client);
  let items = [];
  const stats = {
    Count: 0,
    ScannedCount: 0,
    ConsumedCapacity: {
      CapacityUnits: 0
    },
    $metadata: {},
  };

  const paginatorConfig = {
    client: docClient,
    pageSize: 100
  };

  const queryParams = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :budgetGuid AND begins_with(sk, :skPrefix)",
    FilterExpression: upToYear ? "#settledDate < :year" : "begins_with(#settledDate, :year)",
    ExpressionAttributeNames: {
      "#settledDate": "settledDate"
    },
    ExpressionAttributeValues: {
      ":budgetGuid": `budget#${budgetGuid}`,
      ":skPrefix": "item#",
      ":year": year
    },
  };

  try {
    const paginator = paginateQuery(paginatorConfig, queryParams);
    for await (const page of paginator) {
      if (page.Items) {
        items.push(...page.Items);
        stats.Count += page.Count || 0;
        stats.ScannedCount += page.ScannedCount || 0;
        stats.ConsumedCapacity.CapacityUnits += page.ConsumedCapacity?.CapacityUnits || 0;
      }
    }
    console.log(logQueryEfficiency(stats));

    return items as Array<ItemRecord>;
  } catch (err) {
    console.error(err);
  }
};

export const getCategoriesByBudget = async (budgetGuid: string): Promise<Array<CategoryRecord> | void> => {
  const client = await getClient();

  try {
    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":budgetGuid": `budget#${budgetGuid}`,
        ":skPrefix": "category#"
      },
      ReturnConsumedCapacity: "INDEXES"
    });
    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items;
  } catch (err) {
    console.error(err);
  }
};

export const getSubcategoriesByBudget = async (budgetGuid: string): Promise<Array<SubcategoryRecord> | void> => {
  const client = await getClient();

  try {
    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":budgetGuid": `budget#${budgetGuid}`,
        ":skPrefix": "subcategory#"
      },
      ReturnConsumedCapacity: "INDEXES"
    });
    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items;
  } catch (err) {
    console.error(err);
  }
};

export const createBudgetItem = async (budgetGuid: string, budgetItem: ItemRecord): Promise<any> => {
  const client = await getClient();
  const itemGuid = budgetItem.guid || uuidv4();

  try {
    console.log('Inserting item', budgetItem);

    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `item#${itemGuid}`,
        ...budgetItem,
        guid: itemGuid,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      },
    });

    const putResponse = await client.send(putCommand);

    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid AND sk = :sk",
      ExpressionAttributeValues: {
        ":budgetGuid": `budget#${budgetGuid}`,
        ":sk": `item#${itemGuid}`
      },
      ReturnConsumedCapacity: "INDEXES"
    });
    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items?.[0];
  } catch (err) {
    console.error(err);
  }
};

export const createCategoryRecord = async (budgetGuid: string, category: CategoryRecord): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Inserting category', category);
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `category#${category.guid || uuidv4()}`,
        ...category,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      },
    });

    const response = await client.send(command);
    return response.Items?.[0];
  } catch (err) {
    console.error(err);
  }
};

export const createSubcategoryRecord = async (budgetGuid: string, subcategory: SubcategoryRecord): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Inserting subcategory', subcategory);
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `subcategory#${subcategory.guid || uuidv4()}`,
        ...subcategory,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      },
    });

    const response = await client.send(command);
    return response.Items?.[0];
  } catch (err) {
    console.error(err);
  }
};

export const getStatsByYear = async (guid: string, year: string): Promise<StatsRecord | void> => {
  const client = await getClient();

  try {
    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :guid AND sk = :sk",
      ExpressionAttributeValues: {
        ":guid": `budget#${guid}`,
        ":sk": `stats#${year}`
      },
      ReturnConsumedCapacity: "INDEXES"
    });

    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items?.[0] as StatsRecord | undefined;
  } catch (err) {
    console.error(err);
  }
};

export const createStatsrecord = async (budgetGuid: string, year: string, stats: StatsRecord): Promise<any> => {
  const client = await getClient();

  try {
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `stats#${year}`,
        ...stats,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      },
    });

    const response = await client.send(command);

    return response.Items?.[0];
  } catch (err) {
    console.error(err);
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
    return response.Items?.[0];
  } catch (err) {
    console.error(err);
  }
};

export const copyFromYear = async (budgetGuid: string, fromYear: string, toYear: string): Promise<boolean> => {
  const client = await getClient();

  try {
    // Get all items from the source year
    const itemsToCopy = await getBudgetItemsByYear(budgetGuid, fromYear);

    // If there are items
    if (itemsToCopy) {
      
      do {
        const itemsToWrite = [];
        const limit = Math.min(25, itemsToCopy.length);
        for (let i = 0; i < limit; i++) {
          let newSettledDate = new Date(itemsToCopy[i].settledDate);
          newSettledDate.setFullYear(Number(toYear));
          let newGuid = uuidv4();
          let newItem = { ...itemsToCopy[i] };
          newItem.settledDate = newSettledDate.toISOString();
          newItem.paid = false;
          newItem.guid = newGuid;
          newItem.dateCreated = new Date().toISOString();
          newItem.dateModified = new Date().toISOString();
          itemsToWrite.push({
            ...newItem,
            sk: `item#${newGuid}`,
          });
        }
        const writeRequests = itemsToWrite.map(item => ({
          PutRequest: {
            Item: item
          }
        }));
        const command = new BatchWriteCommand({
          RequestItems: {
            [process.env.DYNAMODB_TABLE_NAME!]: writeRequests
          }
        });

        try {
          const response = await client.send(command);
          console.log("Response from copying items", response);
          itemsToCopy.splice(0, 25);
        } catch (err) {
          console.error(err);
          break;
        }
      } while (itemsToCopy!.length);
    } else {
      console.log(`No items found to copy for year: ${fromYear}`);
    }

    return true;
  } catch (err) {
    console.error(err);
  }

  return false;
};

export const deleteFromYear = async (budgetGuid: string, fromYear: string): Promise<boolean> => {
  const client = await getClient();

  try {
    const itemsToDelete = await getBudgetItemsByYear(budgetGuid, fromYear);

    if (itemsToDelete) {
      do {
        const keysToDelete = [];
        const limit = Math.min(25, itemsToDelete.length);
        for (let i = 0; i < limit; i++) {
          keysToDelete.push({
            pk: `budget#${budgetGuid}`,
            sk: `item#${itemsToDelete[i].guid}`
          });
        }
        const deleteRequests = keysToDelete.map(key => ({
          DeleteRequest: {
            Key: key
          }
        }));
        const command = new BatchWriteCommand({
          RequestItems: {
            [process.env.DYNAMODB_TABLE_NAME!]: deleteRequests
          }
        });

        try {
          const response = await client.send(command);
          itemsToDelete.splice(0, 25);
        } catch (err) {
          console.error(err);
          break;
        }
      } while (itemsToDelete!.length);
    } else {
      console.log(`No items found to delete for year: ${fromYear}`);
    }
  } catch (err) {
    console.error(err);
  }

  return true;
};

export const deleteCategory = async (budgetGuid: string, categoryGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Deleting category', categoryGuid);
    const command = new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `budget#${budgetGuid}`,
        sk: `category#${categoryGuid}`,
      },
    });

    const response = await client.send(command);
    return response;
  } catch (err) {
    console.error(err);
  }
};

export const deleteSubcategory = async (budgetGuid: string, subcategoryGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Deleting subcategory', subcategoryGuid);
    const command = new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        pk: `budget#${budgetGuid}`,
        sk: `subcategory#${subcategoryGuid}`,
      },
    });

    const response = await client.send(command);
    return response;
  } catch (err) {
    console.error(err);
  }
};

export const softDeleteBudgetItem = async (budgetGuid: string, itemGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Soft deleting item', itemGuid);
    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `item#${itemGuid}`,
        active: false,
        dateModified: new Date().toISOString(),
      },
    });

    const putResponse = await client.send(putCommand);

    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid AND sk = :sk",
      ExpressionAttributeValues: {
        ":budgetGuid": `budget#${budgetGuid}`,
        ":sk": `item#${itemGuid}`
      },
      ReturnConsumedCapacity: "INDEXES"
    });
    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items?.[0];
  } catch (err) {
    console.error(err);
  }
};

export const updateBudgetItem = async (budgetGuid: string, budgetItem: ItemRecord): Promise<any> => {
  const client = await getClient();

  try {
    console.log('Updating item', budgetItem);
    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || '',
      Item: {
        pk: `budget#${budgetGuid}`,
        sk: `item#${budgetItem.guid}`,
        ...budgetItem,
        dateModified: new Date().toISOString(),
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
      },
    });

    const putResponse = await client.send(putCommand);
    console.log(putResponse);

    const getCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :budgetGuid AND sk = :sk",
      ExpressionAttributeValues: {
        ":budgetGuid": `budget#${budgetGuid}`,
        ":sk": `item#${budgetItem.guid}`
      },
      ReturnConsumedCapacity: "INDEXES"
    });
    const response = await client.send(getCommand);
    console.log(logQueryEfficiency(response));

    return response.Items?.[0];
  } catch (err) {
    console.error(err);
  }
};
