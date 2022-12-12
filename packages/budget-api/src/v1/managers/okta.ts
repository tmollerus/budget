import fetch from 'node-fetch';
import { OKTA } from '../constants/okta';

export const getOktaUser = async (token: string): Promise<any> => {
  let user: any = {};
  const body = JSON.stringify({
    token,
    token_type_hint: 'id_token',
    client_id: OKTA.CLIENT_ID
  });
  console.log('Getting user info from Okta', body);
  const response = await fetch(
    `${OKTA.DOMAIN}/oauth2/default/v1/introspect`,
    {
      method: 'post',
      body,
      headers: {'Content-Type': 'application/json'}
    }
  );
  user = await response.json();
  console.log('Got user info from Okta', user);

  return user;
};