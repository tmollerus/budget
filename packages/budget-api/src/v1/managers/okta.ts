import * as https from 'https';
import { OKTA } from '../constants/okta';

export const getOktaUser = (token: string): any => {
  let user: any = {};
  const body = JSON.stringify({
    token,
    token_type_hint: 'id_token',
    client_id: OKTA.CLIENT_ID
  });

  const options = {
    hostname: OKTA.DOMAIN,
    port: 443,
    path: '/oauth2/default/v1/introspect',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length
      }
  };

  https.request(options, (res) => {
    let data: any = [];
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', chunk => {
      data.push(chunk);
    });

    res.on('end', () => {
      user = JSON.parse(Buffer.concat(data).toString());
    });

  }).on('error', (e) => {
    console.error(e);
  });

  return user;
};