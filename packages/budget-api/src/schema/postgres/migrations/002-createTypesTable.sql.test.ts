import { migration002 } from './002-createTypesTable.sql';

describe('Types table migration', () => {
  test('Contains correct, needed SQL', () => {
    expect(migration002).toContain('CREATE TABLE IF NOT EXISTS types');
    expect(migration002).toContain('PRIMARY KEY');
    expect(migration002).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});