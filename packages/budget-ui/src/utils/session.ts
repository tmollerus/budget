import { OKTA } from "../constants/okta";

export const getAuthorization = () => {
  const oktaTokenStorage = JSON.parse(localStorage.getItem(OKTA.TOKEN_STORAGE_KEY) || '{}');

  if (oktaTokenStorage.accessToken) {
    return oktaTokenStorage.accessToken.accessToken;
  } else {
    throw new Error('No auth token exists in localStorage');
  }
};

export const getIdentification = () => {
  const oktaTokenStorage = JSON.parse(sessionStorage.getItem(OKTA.TOKEN_STORAGE_KEY) || '{}');

  if (oktaTokenStorage.idToken) {
    return oktaTokenStorage.idToken.claims;
  } else {
    throw new Error('No ID token exists in sessionStorage');
  }
};

export const clearSession = (): void => {
  sessionStorage.removeItem(OKTA.TOKEN_STORAGE_KEY);
};
