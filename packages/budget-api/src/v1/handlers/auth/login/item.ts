import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getOktaUser } from '../../../managers/okta';
import { describeDatabase, getBudgetByEmail } from '../../../managers/postgres';
import { BudgetRecord, OktaUser } from '../../../types';
import { getAuthToken } from '../../../utils/event';

export const getHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const authToken = getAuthToken(event.headers);
  const user: OktaUser = await getOktaUser(authToken);
  let budget: BudgetRecord | void;
  let budgetGuid: string | undefined;

  try {
    budget = await getBudgetByEmail(user.username!);
    budgetGuid = budget?.guid;
  } catch (err) {
    console.log(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({user: user, budgetGuid}),
  };
};
