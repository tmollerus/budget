import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { OAuth2Client } from 'google-auth-library';

export const postHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    const code: string = JSON.parse(event.body || '{}').code;
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage',
    );
    const tokens = await oAuth2Client.getToken(code);

    return {
      statusCode: 200,
      body: JSON.stringify(tokens),
    };
  } catch (err) {
    console.error(err);
  }
  
  return {
    statusCode: 403,
    body: '',
  };
};
