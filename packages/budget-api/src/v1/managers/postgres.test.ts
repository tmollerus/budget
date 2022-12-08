import { foo } from "./postgres";

describe('Postgres manager', () => {
  test('getFirstOfMonth', () => {
    expect(foo()).toBe('bar');
  });
});