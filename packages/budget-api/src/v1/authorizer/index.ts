import { Context, APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { getOktaUser } from '../managers/okta';
import { getBudgetByEmail } from '../managers/postgres';
import { Effect, OktaUser } from '../types';
import { getPolicyResponse } from '../utils/authorizer';
import { logElapsedTime } from '../utils/event';

export const handler = async (event: APIGatewayRequestAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  const startTime = new Date();
  let elapsedTime = new Date();

  try {
    if (!event?.headers?.authorization) {
      throw new Error('Missing auth token!');
    }

    elapsedTime = logElapsedTime('About to get Okta user', startTime);
    const user: OktaUser = await getOktaUser(event?.headers?.authorization.split(' ')[1]);
    elapsedTime = logElapsedTime('Got Okta user', elapsedTime);
    elapsedTime = logElapsedTime('About to retrieve budget', elapsedTime);
    const budget = await getBudgetByEmail(user.username!);
    elapsedTime = logElapsedTime('Retrieved budget', elapsedTime);

    if (budget?.guid) {
      return getPolicyResponse('user', Effect.ALLOW, event.methodArn);
    }
  } catch (err) {
    console.log(err);
  }

  logElapsedTime('About to return response', elapsedTime);
  return getPolicyResponse('user', Effect.DENY, event.methodArn);
};
