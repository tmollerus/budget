import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export const getHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
        message: 'hello world',
    }),
  };

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
