import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LOCAL_DOMAIN } from "../constants/environment";
import { getAllowedOrigins, getAllowedPreflightHeaders, getAllowedPreflightMethods } from "./cdk";

describe('CDK utility', () => {
  test('getAllowedOrigins', () => {
    const origin1 = 'https://www.somedomain1.com';
    const origin2 = 'https://www.somedomain2.com';

    expect(getAllowedOrigins(undefined, LOCAL_DOMAIN)).toStrictEqual([LOCAL_DOMAIN]);
    expect(getAllowedOrigins('', LOCAL_DOMAIN)).toStrictEqual([LOCAL_DOMAIN]);
    expect(getAllowedOrigins(origin1, LOCAL_DOMAIN)).toStrictEqual([origin1, LOCAL_DOMAIN]);
    expect(getAllowedOrigins(`${origin2},${origin1}`, LOCAL_DOMAIN)).toStrictEqual([origin2, origin1, LOCAL_DOMAIN]);
  });

  test('getAllowedPreflightHeaders', () => {
    expect(getAllowedPreflightHeaders()).toBeInstanceOf(Array);
    expect(getAllowedPreflightHeaders().length).toBeGreaterThan(0);
    expect(getAllowedPreflightHeaders().includes('Authorization')).toBeTruthy();
  });

  test('getAllowedPreflightMethods', () => {
    expect(getAllowedPreflightMethods()).toBeInstanceOf(Array);
    expect(getAllowedPreflightMethods().length).toBeGreaterThan(0);
    expect(getAllowedPreflightMethods().includes(CorsHttpMethod.GET)).toBeTruthy();
    expect(getAllowedPreflightMethods().includes(CorsHttpMethod.HEAD)).toBeTruthy();
    expect(getAllowedPreflightMethods().includes(CorsHttpMethod.OPTIONS)).toBeTruthy();
    expect(getAllowedPreflightMethods().includes(CorsHttpMethod.POST)).toBeTruthy();
    expect(getAllowedPreflightMethods().includes(CorsHttpMethod.PUT)).toBeTruthy();
  });
});