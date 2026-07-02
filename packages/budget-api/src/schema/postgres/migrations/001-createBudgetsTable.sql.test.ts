import { migration001 } from './001-createBudgetsTable.sql';

describe('Budgets table migration', () => {
  test('Contains correct, needed SQL', () => {
    expect(migration001).toContain('CREATE TABLE IF NOT EXISTS budgets');
    expect(migration001).toContain('PRIMARY KEY');
    expect(migration001).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});