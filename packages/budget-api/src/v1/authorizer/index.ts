import { Context, APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { Effect } from '../types';
import { getPolicy } from '../utils/authorizer';

export const handler = async (event: APIGatewayAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  if (!event.type || event.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const accessToken: string = event?.authorizationToken;
  if (!accessToken) throw new Error('Missing access token!');

  return getPolicy('user', Effect.ALLOW, event.methodArn);

  // // Get the auth token
  // const auth_token = event?.headers?['Authorization']?[0].split(' ')[1];

  // // Get the corresponding email address via Okta
  // email = OktaConnection(auth_token).get_user()

  // // Get the corresponding budget
  // budget = BudgetDao(self.db, session=session).get_budget_by_email(email)

  // if 'guid' in budget:
  //   self.set_secure_cookie(config.COOKIE_NAME, budget['guid'], 1)
  //   return {"budgetGUID": budget['guid']}
  //   return {
  //       statusCode: 200,
  //       body: JSON.stringify({
  //           message: 'hello world',
  //       }),
  //   };
};
