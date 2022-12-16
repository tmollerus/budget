import { Context, APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { getOktaUser } from '../managers/okta';
import { getBudgetByEmail } from '../managers/postgres';
import { Effect, OktaUser } from '../types';
import { getPolicyResponse, getSimpleResponse } from '../utils/authorizer';

export const handler = async (event: APIGatewayAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    if (!event.type || event.type !== 'TOKEN') {
      throw new Error('Expected "event.type" parameter to have value "TOKEN"');
    }

    if (!event?.authorizationToken) {
      throw new Error('Missing auth token!');
    }

    const user: OktaUser = await getOktaUser(event?.authorizationToken);
    const budget = await getBudgetByEmail(user.username!);

    if (budget?.guid) {
      return getPolicyResponse('user', Effect.ALLOW, event.methodArn);
    }
  } catch (err) {
    console.log(err);
  }

  return getPolicyResponse('user', Effect.DENY, event.methodArn);
};
