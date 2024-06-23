import { migration006 } from './006-createSubcategoriesTable.sql';

describe('Categories table migration', () => {
  test('Contains correct, needed SQL', () => {
    expect(migration006).toContain('CREATE TABLE IF NOT EXISTS subcategories');
    expect(migration006).toContain('PRIMARY KEY');
    expect(migration006).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});