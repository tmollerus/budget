import { Statistics } from "../types";
import { getEntryBalance, getStatistics } from "./statistics";
import ledgerData from "./test/ledgerData.json";

describe('Statistics functions', () => {
  test('getStatistics', () => {
    const expectedStatistics: Statistics = {
      today: 15846.269999999979,
      expensesLeft: 0,
      yearEnd: 15846.269999999979,
      incomeTotal: 196774.19999999984,
      expenseTotal: 147025.2,
      transferTotal: 50000,
      deficitDate: null,
    };
    expect(getStatistics(ledgerData.items)).toStrictEqual(expectedStatistics);
  });

  test('getEntryBalance', () => {
    expect(getEntryBalance(1, ledgerData.items[0])).toBe(1.06);
    expect(getEntryBalance(1, ledgerData.items[1])).toBe(-18.99);
    expect(getEntryBalance(1, ledgerData.items[2])).toBe(-799);
  });
});
