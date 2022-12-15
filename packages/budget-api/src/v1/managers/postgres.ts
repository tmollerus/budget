import { Client } from 'pg';
import { migrate } from 'postgres-migrations';
import { migration001 } from '../schema/postgres/migrations/001-createBudgetsTable';
import { migration002 } from '../schema/postgres/migrations/002-createTypesTable';
import { migration003 } from '../schema/postgres/migrations/003-createUsersTable';
import { migration004 } from '../schema/postgres/migrations/004-createItemsTable';
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

 export const describeDatabase = async () => {
  const client = await getClient();

  try {
    return await client.query(`SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`);
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
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
