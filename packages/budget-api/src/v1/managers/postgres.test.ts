import { insertSeeds } from "./postgres";
import budget from '../schema/postgres/seeds/budget.seeds.json';

describe('Postgres manager', () => {
  test('insertSeeds', async () => {
    expect(await insertSeeds(null, budget.seeds, 'budgets', true)).toBe(`Inserted ${budget.seeds.length - 1} records into budgets`);
  });
});