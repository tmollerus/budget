import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getOktaUser } from '../../../managers/okta';
import { describeDatabase, getBudgetByEmail } from '../../../managers/postgres';
import { BudgetRecord, OktaUser } from '../../../types';
import { getAuthToken } from '../../../utils/event';

export const getHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    const budgetGuid = event.requestContext.authorizer?.lambda.budgetGuid;
    const user = JSON.parse(event.requestContext.authorizer?.lambda.user);

    return {
      statusCode: 200,
      body: JSON.stringify({user: user, budgetGuid}),
    };
  } catch (err) {
    console.log(err);
  }
  
  return {
    statusCode: 403,
    body: '',
  };
};
