const { Client } = require('pg');
import { getSecrets } from './secrets';

export const foo = () => { return 'bar' };

export const getClient = async (): Promise<any> => {
  const { budget_rds_username, budget_rds_password } = await getSecrets('production-budget-api-Secret');
  const client = new Client({
    user: budget_rds_username,
    host: 'db.cemrvg9zsjzo.us-east-1.rds.amazonaws.com',
    database: 'budget',
    password: budget_rds_password,
    port: 5432,
  });
  // postgresql://budget_user:[password]@db.cemrvg9zsjzo.us-east-1.rds.amazonaws.com/budget
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