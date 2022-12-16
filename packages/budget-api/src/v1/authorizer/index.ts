import { Context, APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { getOktaUser } from '../managers/okta';
import { getBudgetByEmail } from '../managers/postgres';
import { Effect, OktaUser } from '../types';
import { getPolicyResponse } from '../utils/authorizer';

export const handler = async (event: APIGatewayRequestAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    if (!event?.headers?.authorization) {
      throw new Error('Missing auth token!');
    }

    const user: OktaUser = await getOktaUser(event?.headers?.authorization.split(' ')[1]);
    const budget = await getBudgetByEmail(user.username!);

    if (budget?.guid) {
      return getPolicyResponse('user', Effect.ALLOW, event.methodArn);
    }
  } catch (err) {
    console.log(err);
  }

  return getPolicyResponse('user', Effect.DENY, event.methodArn);
};
