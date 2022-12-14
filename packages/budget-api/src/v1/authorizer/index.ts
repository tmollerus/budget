import { Context, APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { getOktaUser } from '../managers/okta';
import { getBudgetByEmail } from '../managers/postgres';
import { Effect, OktaUser } from '../types';
import { getPolicy } from '../utils/authorizer';

export const handler = async (event: APIGatewayAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  if (!event.type || event.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const authToken: string = event?.authorizationToken;
  if (!authToken) throw new Error('Missing auth token!');

  const user: OktaUser = await getOktaUser(authToken);

  console.log('User email from Okta', user.username);
  
  try {
    const budget = await getBudgetByEmail(user.username!);
    console.log('Budget', budget);
    if (budget.guid) {
      return getPolicy('user', Effect.ALLOW, event.methodArn);
    }
  } catch (err) {
    console.log(err);
  }

  return getPolicy('user', Effect.DENY, event.methodArn);
};
