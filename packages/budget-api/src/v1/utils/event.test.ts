import { headers } from "../test/fixtures/events";
import { getAuthToken } from "./event";

describe('Event utility', () => {
  test('getAuthToken', () => {
    const token = 'some_token';
    const headersWithAuth = Object.assign({ authorization: `Bearer ${token}`}, headers);

    expect(getAuthToken(headers)).toBe('');
    expect(getAuthToken(headersWithAuth)).toBe(token);
  });
});