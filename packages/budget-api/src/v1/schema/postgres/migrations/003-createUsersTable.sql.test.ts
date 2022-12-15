import { migration003 } from './003-createUsersTable.sql';

describe('Users table migration', () => {
  test('Contains correct, needed SQL', () => {
    expect(migration003).toContain('CREATE TABLE IF NOT EXISTS users');
    expect(migration003).toContain('PRIMARY KEY');
    expect(migration003).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});