import { Client } from 'pg';
import { migration001 } from '../schema/postgres/migrations/001-createBudgetsTable.sql';
import { migration002 } from '../schema/postgres/migrations/002-createTypesTable.sql';
import { migration003 } from '../schema/postgres/migrations/003-createUsersTable.sql';
import { migration004 } from '../schema/postgres/migrations/004-createItemsTable.sql';
import budget from '../schema/postgres/seeds/budget.seeds.json';
import item from '../schema/postgres/seeds/item.seeds.json';
import type from '../schema/postgres/seeds/type.seeds.json';
import user from '../schema/postgres/seeds/user.seeds.json';
import { getInsertFieldnames, getInsertValues } from '../utils/db';
import { getSecret } from './secrets';

export const foo = () => { return 'bar' };

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
    results.push(await insertSeeds(client, type.seeds, 'types'));
    results.push(await insertSeeds(client, budget.seeds, 'budgets'));
    results.push(await insertSeeds(client, user.seeds, 'users'));
    // results.push(await insertSeeds(client, item.seeds, 'items'));
    return results;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const insertSeeds = async (client: any, seeds: Array<Array<any>>, seedName: string, dryRun = false): Promise<string> => {
  let result = '';
  const rowCount = dryRun
    ? { rows: [{ count: '0' }] }
    : await client.query(`SELECT COUNT(*) FROM ${seedName};`);

  if (rowCount?.rows[0]?.count === '0') {
    for (let i = 1; i < seeds.length; i++) {
      const sql = `INSERT INTO ${seedName} (${getInsertFieldnames(seeds[0])}) VALUES (${getInsertValues(seeds[i])});`;
      dryRun || await client.query(sql);
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
  } catch (err) {
    console.log(err);
    result += err;
  } finally {
    client.end();
  }

  return result;
 };

 export const getBudgetByEmail = async (email: string) => {
  const client = await getClient();

  try {
    return await client.query(`SELECT * FROM budgets WHERE email = '${email}';`);
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const createSchema = async (): Promise<any> => {
  const client = await getClient();

  try {
    Promise.all([
      await client.query(migration001),
      await client.query(migration002),
      await client.query(migration003),
      await client.query(migration004)
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
