import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { migration001 } from '../schema/postgres/migrations/001-createBudgetsTable.sql';
import { migration002 } from '../schema/postgres/migrations/002-createTypesTable.sql';
import { migration003 } from '../schema/postgres/migrations/003-createUsersTable.sql';
import { migration004 } from '../schema/postgres/migrations/004-createItemsTable.sql';
import { migration005 } from '../schema/postgres/migrations/005-createCategoriesTable.sql';
import { migration006 } from '../schema/postgres/migrations/006-createSubcategoriesTable.sql';
import budget from '../schema/postgres/seeds/budget.seeds.json';
import item from '../schema/postgres/seeds/item.seeds.json';
import itemType from '../schema/postgres/seeds/type.seeds.json';
import user from '../schema/postgres/seeds/user.seeds.json';
import { BudgetRecord, CategoryRecord, ItemRecord, QueryResult, SubcategoryRecord } from '../types';
import { getInsertColumnNames, getInsertValues, getSetStatementAndParams } from '../utils/db';
import { logElapsedTime } from '../utils/event';
import { getSecret } from './secrets';

export const getClient = async (): Promise<any> => {
  const { username, password, port, dbname, host } = await getSecret("production-budget-api-Secret");
  const client = new Client({
    user: username,
    host,
    database: dbname,
    password,
    port
  });
  await client.connect();

  return client;
 };

 export const applySeeds = async () => {
  const client = await getClient();
  const results: Array<string> = [];

  try {
    results.push(await insertSeeds(client, itemType.seeds, 'types'));
    results.push(await insertSeeds(client, budget.seeds, 'budgets'));
    results.push(await insertSeeds(client, user.seeds, 'users'));
    results.push(await insertSeeds(client, item.seeds, 'items'));

    return results;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }

  return results.join('; ');
 };

 export const insertSeeds = async (client: any, seeds: Array<Array<any>>, seedName: string, dryRun = false, deleteFirst = false): Promise<string> => {
  let result = '';
  if (deleteFirst) {
    await client.query(`DELETE FROM ${seedName};`);
  }
  const rowCount = dryRun
    ? { rows: [{ count: '0' }] }
    : await client.query(`SELECT COUNT(*) FROM ${seedName};`);

  if (rowCount?.rows[0]?.count === '0') {
    for (let i = 1; i < seeds.length; i++) {
      const sql = `INSERT INTO ${seedName} (${getInsertColumnNames(seeds[0])}) VALUES (${getInsertValues(seeds[i])});`;
      try {
        dryRun || await client.query(sql, seeds[i]);
      } catch (err: any) {
        console.log('Error while tring to execute SQL', sql);
        console.log(err);
        throw new Error(err);
      }
    }

    result = `Inserted ${seeds.length - 1} records into ${seedName}`;
    console.log(result);
  } else {
    result = `Not inserting seed records into ${seedName} since row count is already ${rowCount?.rows[0]?.count}`;
    console.log(result);
  }

  return result;
 }

 export const describeDatabase = async (): Promise<string> => {
  const client = await getClient();
  let result = '';

  try {
    const budgets = await client.query(`SELECT COUNT(*) FROM budgets;`);
    result += `Table budgets contains ${budgets.rows[0].count} rows;`;
    const types = await client.query(`SELECT COUNT(*) FROM types;`);
    result += `Table types contains ${types.rows[0].count} rows;`;
    const users = await client.query(`SELECT COUNT(*) FROM users;`);
    result += `Table users contains ${users.rows[0].count} rows;`;
    const items = await client.query(`SELECT COUNT(*) FROM items;`);
    result += `Table items contains ${items.rows[0].count} rows;`;
  } catch (err) {
    console.log(err);
    result += err;
  } finally {
    client.end();
  }

  return result;
 };

 export const getBudgetByEmail = async (email: string): Promise<BudgetRecord | void> => {
  const client = await getClient();
  const startTime = new Date();

  try {
    const sql = `
      SELECT guid
      FROM budgets
      WHERE email = $1;
    `;
    const params = [email];
    console.log('Executing sql', sql, params);
    let elapsedTime = logElapsedTime(`About to query for budget for email '${email}'`, startTime);
    const result: QueryResult<BudgetRecord> = await client.query(sql, params);
    elapsedTime = logElapsedTime(`Queried for budget for email '${email}'`, elapsedTime);
    console.log('Result returned', result);
    return result.rows[0];
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
    const sql = `
      SELECT items.*,
      (SELECT SUM(budgets.starting_balance + (SELECT SUM(CASE WHEN type_id=1 THEN amount ELSE -amount END)
          FROM items
          WHERE EXTRACT(YEAR FROM "settledDate") < $2
            AND items.active = true
            AND items.budget_guid = $1)) AS balance         
          FROM budgets
          WHERE guid = $1
          GROUP BY guid
      ) AS starting_balance,
      (SELECT COUNT(*)
        FROM items
        WHERE budget_guid = $1
          AND items.active = true
          AND EXTRACT(YEAR FROM "settledDate") = $3
      ) AS next_year_item_count
      FROM items
      WHERE budget_guid = $1
        AND active = true
        AND EXTRACT(YEAR FROM "settledDate") = $2
        ORDER BY "settledDate" ASC, paid DESC, type_id ASC, amount ASC;
    `;
    const params = [budgetGuid, year, String(Number(year) + 1)];
    console.log('Executing sql', sql, params);
    let elapsedTime = logElapsedTime(`About to query for records from ${year}`, startTime);
    const result: QueryResult<ItemRecord> = await client.query(sql, params);
    elapsedTime = logElapsedTime(`Queried for records from ${year}`, elapsedTime);
    console.log('Result returned', result);
    result.rows.forEach((row, index) => {
      result.rows[index].amount = Number(row.amount);
    });
    logElapsedTime(`Transformed amounts in records from ${year}`, elapsedTime);
    return result.rows;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const getCategoriesByBudget = async (budgetGuid: string): Promise<Array<CategoryRecord> | void> => {
  const client = await getClient();

  try {
    const sql = `
      SELECT *
      FROM categories
      WHERE budget_guid = $1
      ORDER BY label ASC;
    `;
    const params = [budgetGuid];
    console.log('Executing sql', sql, params);
    const result: QueryResult<CategoryRecord> = await client.query(sql, params);
    console.log('Result returned', result);
    return result.rows;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const getSubcategoriesByBudget = async (budgetGuid: string): Promise<Array<SubcategoryRecord> | void> => {
  const client = await getClient();

  try {
    const sql = `
      SELECT subcategories.*
      FROM subcategories INNER JOIN categories ON subcategories.category_guid = categories.guid
      WHERE categories.budget_guid = $1
      ORDER BY subcategories.label ASC;
    `;
    const params = [budgetGuid];
    console.log('Executing sql', sql, params);
    const result: QueryResult<SubcategoryRecord> = await client.query(sql, params);
    console.log('Result returned', result);
    return result.rows;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const createBudgetItem = async (budgetGuid: string, budgetItem: ItemRecord): Promise<any> => {
  const client = await getClient();

  try {
    const sql = `
      INSERT INTO items (budget_guid, guid, "settledDate", type_id, amount, paid, label, category_guid, subcategory_guid, "dateCreated", "dateModified")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [budgetGuid, uuidv4(), budgetItem.settledDate, budgetItem.type_id, budgetItem.amount, budgetItem.paid, budgetItem.label, budgetItem.category_guid, budgetItem.subcategory_guid, new Date(), new Date()];
    console.log('Executing sql', sql, params);
    const result = await client.query(sql, params);
    console.log(result);
    return result.rows[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const createCategoryRecord = async (budgetGuid: string, category: CategoryRecord): Promise<any> => {
  const client = await getClient();

  try {
    const sql = `
      INSERT INTO categories (budget_guid, guid, label, "dateCreated", "dateModified")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [budgetGuid, uuidv4(), category.label, new Date(), new Date()];
    console.log('Executing sql', sql, params);
    const result = await client.query(sql, params);
    console.log(result);
    return result.rows[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const createSubcategoryRecord = async (subcategory: SubcategoryRecord): Promise<any> => {
  const client = await getClient();

  try {
    const sql = `
      INSERT INTO subcategories (category_guid, guid, label, "dateCreated", "dateModified")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [subcategory.category_guid, uuidv4(), subcategory.label, new Date(), new Date()];
    console.log('Executing sql', sql, params);
    const result = await client.query(sql, params);
    console.log(result);
    return result.rows[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const copyFromYear = async (budgetGuid: string, fromYear: string, toYear: string): Promise<boolean> => {
  const client = await getClient();

  try {
    // Get all items from the source year
    const existingItems = await getBudgetItemsByYear(budgetGuid, fromYear);
    if (existingItems) {
      let sql = `
        INSERT INTO items (budget_guid, guid, "settledDate", type_id, amount, paid, label, category_guid, subcategory_guid, "dateCreated", "dateModified")
        VALUES
      `;
      const params: Array<any> = [];
      let paramCounter = 1;
      // For each item in the source year
      existingItems.forEach((item, index) => {
        // Append to the SQL statment
        if (index > 0) {
          sql += ', ';
        }
        sql += ` ($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`;
        // Append to the params array
        let newSettledDate = new Date(item.settledDate);
        newSettledDate.setFullYear(Number(fromYear) + 1);
        params.push(budgetGuid);
        params.push(uuidv4());
        params.push(newSettledDate.toISOString().replace('Z', ''));
        params.push(item.type_id);
        params.push(item.amount);
        params.push(false);
        params.push(item.label);
        params.push(item.category_guid);
        params.push(item.subcategory_guid);
        params.push(new Date());
        params.push(new Date());
      });
      console.log('Executing sql', sql, params);
      const result = await client.query(sql, params);
      console.log(result);
      return true;
    }
  } catch (err) {
    console.log(err);
  }

  return false;
 };

 export const deleteCategory = async (budgetGuid: string, categoryGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    const sql = `
      DELETE
      FROM categories
      WHERE budget_guid = $1
        AND guid = $2
    `;
    const params = [budgetGuid, categoryGuid];
    console.log('Executing sql', sql, params);
    const result = await client.query(sql, params);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
 };

 export const deleteSubcategory = async (budgetGuid: string, subcategoryGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    const sql = `
      DELETE subcategories
      FROM subcategories JOIN categories ON subcategories.category_guid = categories.guid AND categories.budget_guid = $1
      WHERE subcategories.guid = $2
    `;
    const params = [budgetGuid, subcategoryGuid];
    console.log('Executing sql', sql, params);
    const result = await client.query(sql, params);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
 };

 export const softDeleteBudgetItem = async (budgetGuid: string, itemGuid: string): Promise<any> => {
  const client = await getClient();

  try {
    const sql = `
      UPDATE items
      SET active = false
      WHERE budget_guid = $1
        AND guid = $2
    `;
    const params = [budgetGuid, itemGuid];
    console.log('Executing sql', sql, params);
    const result = await client.query(sql, params);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
 };

 export const updateBudgetItem = async (budgetGuid: string, budgetItem: ItemRecord): Promise<any> => {
  const client = await getClient();

  try {
    const { setStatement, setParameters } = getSetStatementAndParams(budgetGuid, budgetItem);
    const sql = `
      UPDATE items
      ${setStatement}
      WHERE budget_guid = $1 
        AND guid = $2
      RETURNING *
    `;
    console.log('Executing sql', sql, setParameters);
    const result = await client.query(sql, setParameters);
    console.log(result);
    return result.rows[0];
  } catch (err) {
    console.log(err);
  }
 };

 export const createSchema = async (): Promise<any> => {
  const client = await getClient();

  try {
    Promise.all([
      await client.query(migration001),
      await client.query(migration002),
      await client.query(migration003),
      await client.query(migration004),
      await client.query(migration005),
      await client.query(migration006)
    ])
    .then((results) => {
      return results;
    });
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };
