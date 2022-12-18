import { Context, APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { getOktaUser } from '../managers/okta';
import { getBudgetByEmail } from '../managers/postgres';
import { getRedisClient } from '../managers/redis';
import { BudgetRecord, Effect, OktaUser } from '../types';
import { getPolicyResponse } from '../utils/authorizer';
import { logElapsedTime } from '../utils/event';

export const handler = async (event: APIGatewayRequestAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  const startTime = new Date();
  let elapsedTime = new Date();
  let user: OktaUser;
  let budget: BudgetRecord | void;

  const authorizationToken = event?.headers?.authorization?.split(' ')[1];
  if (!authorizationToken) {
    console.log('No authorization token specified');
    return getPolicyResponse('user', Effect.DENY, event.methodArn);
  }

  const redisClient = await getRedisClient(process.env.REDIS_URL || '');

  try {
    if (!event?.headers?.authorization) {
      throw new Error('Missing auth token!');
    }

    const userKey = `budget-api-OktaUser-${authorizationToken}`;
    console.log('Checking for Okta user in cache');
    const cachedUser = redisClient && await redisClient.get(userKey);
    if (cachedUser) {
      user = JSON.parse(cachedUser);
      console.log('Found Okta user in cache', user.username);
    } else {
      elapsedTime = logElapsedTime('About to get Okta user', startTime);
      user = await getOktaUser(authorizationToken);
      elapsedTime = logElapsedTime('Got Okta user', elapsedTime);
      redisClient && await redisClient.set(userKey, JSON.stringify(user), { EX: 60 * 55, NX: true });
    }

    const budgetKey = `budget-api-Budget-${user.username}`;
    console.log('Checking for budget in cache');
    const cachedBudget = redisClient && await redisClient.get(budgetKey);
    if (cachedBudget) {
      budget = JSON.parse(cachedBudget);
      console.log('Found budget in cache', budget?.guid);
    } else {
      elapsedTime = logElapsedTime('About to retrieve budget', elapsedTime);
      budget = await getBudgetByEmail(user.username!);
      elapsedTime = logElapsedTime('Retrieved budget', elapsedTime);
      redisClient && await redisClient.set(budgetKey, JSON.stringify(user), { EX: 60 * 60 });
    }

    if (budget?.guid) {
      return getPolicyResponse('user', Effect.ALLOW, event.methodArn);
    }
  } catch (err) {
    console.log(err);
  } finally {
    redisClient && await redisClient.disconnect();
  }

  logElapsedTime('About to return response', elapsedTime);
  return getPolicyResponse('user', Effect.DENY, event.methodArn);
};
