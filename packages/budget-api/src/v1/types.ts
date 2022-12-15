export interface BudgetRecord {
  guid: string;
  active: boolean;
  fullname: string;
  username: string;
  password: string;
  dateLastLogin: string;
  dateCreated: string;
  dateModified: string;
  starting_balance: string;
  email: string;
}

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

export interface QueryResult<RecordType> {
  command: string;
  rowCount: number;
  oid?: any;
  rows: Array<RecordType>;
  fields: [
    Field: {
      name: string;
      tableID: number;
      columnID: number;
      dataTypeID: number;
      dataTypeSize: number;
      dataTypeModifier: number;
      format: string;
    },
  ]
}

export interface Seeds {
  seeds: Array<Array<string | boolean | number>>;
}
