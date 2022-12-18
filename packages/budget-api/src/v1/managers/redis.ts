import { createClient } from 'redis';

export const getRedisClient = async (url: string) => {
  if (!url) {
    console.log('No Redis host URL provided');
    return;
  }
  const redisClient = createClient({
    url
  });
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  return redisClient;
}

// await client.set('key', 'value');
// const value = await client.get('key');
// await client.disconnect();