import fetch from 'node-fetch';
import { OAuth2Client } from 'google-auth-library';
import { GoogleUser } from '../types';

//const client_secret = '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';

export const getGoogleUser = async (accessToken: string): Promise<GoogleUser> => {
  let user: GoogleUser = { authuser: false, code: accessToken, gis_params: '', hd: 0, iss: '', oauth_metadata: '', prompt: '', scope: '' };
  console.log('Getting user info from Google');

  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        method: 'get',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );
    user = await response.json() as unknown as GoogleUser;
    console.log('Got user info from Google', user);
  } catch (err: any) {
    console.log(err.message);
  }

  return user;
};

export async function getGoogleTokens(code: string): Promise<{ access_token: string; expires_in: number; refresh_token: string; scope: string; token_type: string; id_token: string }> {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage');
  const { tokens } = await client.getToken(code);
  console.log('Got tokens:', tokens);
  return {
    access_token: tokens.access_token || '',
    expires_in: tokens.expiry_date || 0,
    refresh_token: tokens.refresh_token || '',
    scope: tokens.scope || '',
    token_type: tokens.token_type || '',
    id_token: tokens.id_token || '',
  };
};

export async function verifyGoogleToken(idToken: string): Promise<{ googleId: string; username: string; name: string; picture: string; active: boolean }> {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const userProfile: { googleId: string; username: string; name: string; picture: string; active: boolean } = {} as { googleId: string; username: string; name: string; picture: string; active: boolean };
    
    if (!payload || !payload['sub'] || !payload['email'] || !payload['name'] || !payload['picture']) {
      throw new Error('Invalid Google Token');
    }
    
    userProfile.googleId = payload['sub'] || '';
    userProfile.username = payload['email'] || '';
    userProfile.name = payload['name'] || '';
    userProfile.picture = payload['picture'] || '';
    userProfile.active = true;

    return userProfile;
  } catch (error) {
    throw new Error('Invalid Google Token');
  }
};