import { migration005 } from './005-createCategoriesTable.sql';

describe('Categories table migration', () => {
  test('Contains correct, needed SQL', () => {
    expect(migration005).toContain('CREATE TABLE IF NOT EXISTS categories');
    expect(migration005).toContain('PRIMARY KEY');
    expect(migration005).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});