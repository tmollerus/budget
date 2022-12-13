import { Client } from 'pg';

export const foo = () => { return 'bar' };

export const getClient = async (): Promise<any> => { 
  const client = new Client()
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