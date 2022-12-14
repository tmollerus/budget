import { Client } from 'pg';
import { migrate } from 'postgres-migrations';
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

 export const getBudgetByEmail = async (email: string) => {
  const client = await getClient();

  try {
    const res = await client.query('SELECT NOW()');
    return res;
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };

 export const runMigrations = async (): Promise<any> => {
  const client = await getClient();

  try {
    return await migrate({client}, '../schema/postgres/migrations');
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
 };
