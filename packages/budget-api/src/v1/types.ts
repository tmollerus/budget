export enum Effect {
  ALLOW = 'Allow',
  DENY = 'Deny'
}

export interface OktaUser {
  active: boolean;
  scope?: string;
  username?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  aud?: string;
  iss?: string;
  jti?: string;
  token_type?: string;
  client_id?: string;
  uid?: string;
}