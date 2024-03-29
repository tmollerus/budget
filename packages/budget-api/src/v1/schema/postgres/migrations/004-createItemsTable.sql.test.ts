import { migration004 } from './004-createItemsTable.sql';

describe('Items table migration', () => {
  test('Contains correct, needed SQL', () => {
    expect(migration004).toContain('CREATE TABLE IF NOT EXISTS items');
    expect(migration004).toContain('PRIMARY KEY');
    expect(migration004).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});