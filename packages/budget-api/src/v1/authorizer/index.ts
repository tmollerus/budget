import { Context, APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { getOktaUser } from '../managers/okta';
import { getBudgetByEmail } from '../managers/postgres';
import { getRedisClient } from '../managers/redis';
import { BudgetRecord, Effect, OktaUser } from '../types';
import { getPolicyResponse } from '../utils/authorizer';
import { logElapsedTime } from '../utils/event';

const memoryCache: Record<string, { user: OktaUser; budgetGuid: string }> = {};

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

  try {
    if (!event?.headers?.authorization) {
      throw new Error('Missing auth token!');
    }

    if (memoryCache[authorizationToken]) {
      return getPolicyResponse('user', Effect.ALLOW, event.methodArn, {
        user: JSON.stringify(memoryCache[authorizationToken].user) || '',
        budgetGuid: memoryCache[authorizationToken].budgetGuid || '',
      });
    }

    elapsedTime = logElapsedTime('About to get Okta user', startTime);
    user = await getOktaUser(authorizationToken);
    elapsedTime = logElapsedTime('Got Okta user', elapsedTime);

    elapsedTime = logElapsedTime('About to retrieve budget', elapsedTime);
    budget = await getBudgetByEmail(user.username!);
    elapsedTime = logElapsedTime('Retrieved budget', elapsedTime);

    if (budget?.guid) {
      memoryCache[authorizationToken] = {
        user,
        budgetGuid: budget.guid,
      };
      return getPolicyResponse('user', Effect.ALLOW, event.methodArn, {
        user: JSON.stringify(user) || '',
        budgetGuid: budget.guid || '',
      });
    }
  } catch (err) {
    console.log(err);
  }

  logElapsedTime('About to return response', elapsedTime);
  return getPolicyResponse('user', Effect.DENY, event.methodArn);
};
