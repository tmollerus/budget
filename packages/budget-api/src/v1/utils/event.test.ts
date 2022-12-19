import { headers } from "../test/fixtures/events";
import { getAuthToken, logElapsedTime } from "./event";

describe('Event utility', () => {
  test('getAuthToken', () => {
    const token = 'some_token';
    const headersWithAuth = Object.assign({ authorization: `Bearer ${token}`}, headers);

    expect(getAuthToken(headers)).toBe('');
    expect(getAuthToken(headersWithAuth)).toBe(token);
  });

  test('logElapsedTime', () => {
    const startDate = new Date();
    expect(typeof logElapsedTime('Testing', startDate)).toBe('object');
  });
});