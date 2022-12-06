import { PAID_SYMBOL } from "../constants/theme";
import { dollarFormat } from "./format";
import { ColumnType, getCellClassName, getFirstOfDateClass, getLedgerItemBalance, getLedgerItemDate, getLedgerItemExpense, getLedgerItemIncome, getLedgerItemPaid, getLedgerItemTransfer, getLedgerTotals, getRowClassName, getRowId, isFirstOfDate } from "./table";
import { ledgerData } from "./test/ledgerData";

describe('Table functions', () => {
  test('getRowClassName', () => {
    const evenClass = 'even';
    expect(getRowClassName(0, evenClass)).toBe('');
    expect(getRowClassName(1, evenClass, [])).toBe(evenClass);
    expect(getRowClassName(2, evenClass, ['foo'])).toBe('foo');
    expect(getRowClassName(3, evenClass, ['foo'])).toBe(`foo ${evenClass}`);
    expect(getRowClassName(3, evenClass, ['foo', 'bar'])).toBe(`foo bar ${evenClass}`);
  });

  test('getCellClassName', () => {
    expect(getCellClassName(ledgerData.items[0], ColumnType.BALANCE)).toBe('');
    expect(getCellClassName(ledgerData.items[0], ColumnType.BALANCE, [])).toBe('');
    expect(getCellClassName(ledgerData.items[0], ColumnType.BALANCE, ['foo'])).toBe('foo');
    expect(getCellClassName(ledgerData.items[0], ColumnType.BALANCE, ['foo', 'bar'])).toBe('foo bar');
  });

  test('getRowId', () => {
    expect(getRowId('2017-01-13T00:00:00-05:00Z', '')).toBe('month-0');
    expect(getRowId('2017-02-13T00:00:00-05:00Z', '2017-02-13T00:00:00-05:00Z')).toBe('');
    expect(getRowId('2017-02-13T00:00:00-05:00Z', '2017-03-13T00:00:00-05:00Z')).toBe('month-1');
    expect(getRowId(new Date().toISOString().split('T')[0], new Date().toISOString())).toBe('today');
  });

  test('isFirstOfDate', () => {
    expect(isFirstOfDate('2017-01-13T00:00:00-05:00Z', '2017-01-13T00:00:00-05:00Z')).toBe(false);
    expect(isFirstOfDate('2017-01-13T00:00:00-05:00Z', '2017-01-12T00:00:00-05:00Z')).toBe(true);
  });

  test('getFirstOfDateClass', () => {
    const firstOfDateClass = 'first';
    const notFirstOfDateClass = 'not-first';
    expect(getFirstOfDateClass('2017-01-13T00:00:00-05:00Z', '2017-01-13T00:00:00-05:00Z', firstOfDateClass, notFirstOfDateClass)).toBe(notFirstOfDateClass);
    expect(getFirstOfDateClass('2017-01-13T00:00:00-05:00Z', '2017-01-14T00:00:00-05:00Z', firstOfDateClass, notFirstOfDateClass)).toBe(firstOfDateClass);
  });

  test('getLedgerItemDate', () => {
    expect(getLedgerItemDate('2017-01-13T00:00:00-05:00Z')).toBe('Jan. 12');
    expect(getLedgerItemDate('2020-09-23T00:00:00-08:00Z')).toBe('Sep. 22');
    expect(getLedgerItemDate('2019-06-02T00:00:00-00:00Z')).toBe('Jun. 1');
  });

  test('getLedgerItemIncome', () => {
    expect(getLedgerItemIncome(ledgerData.items[0])).toBe(dollarFormat(ledgerData.items[0].amount));
    expect(getLedgerItemIncome(ledgerData.items[1])).toBe('');
    expect(getLedgerItemIncome(ledgerData.items[2])).toBe('');
  });

  test('getLedgerItemTransfer', () => {
    expect(getLedgerItemTransfer(ledgerData.items[0])).toBe('');
    expect(getLedgerItemTransfer(ledgerData.items[1])).toBe('');
    expect(getLedgerItemTransfer(ledgerData.items[2])).toBe(dollarFormat(ledgerData.items[2].amount));
  });

  test('getLedgerItemBalance', () => {
    expect(getLedgerItemBalance(123)).toBe('$123.00');
    expect(getLedgerItemBalance('321.45')).toBe('$321.45');
    expect(getLedgerItemBalance(undefined)).toBe('');
  });

  test('getLedgerItemExpense', () => {
    expect(getLedgerItemExpense(ledgerData.items[0])).toBe('');
    expect(getLedgerItemExpense(ledgerData.items[1])).toBe(dollarFormat(ledgerData.items[1].amount));
    expect(getLedgerItemExpense(ledgerData.items[2])).toBe('');
  });

  test('getLedgerItemPaid', () => {
    const expected = String.fromCharCode(PAID_SYMBOL);
    expect(getLedgerItemPaid(true)).toBe(expected);
    expect(getLedgerItemPaid(false)).toBe('');
  });

  test('getLedgerTotals', () => {
    expect(getLedgerTotals([ledgerData.items[0]])).toStrictEqual({ totalIncome: ledgerData.items[0].amount, totalTransfers: 0, totalExpenses: 0});
    expect(getLedgerTotals([ledgerData.items[0], ledgerData.items[1], ledgerData.items[2]])).toStrictEqual({ totalIncome: ledgerData.items[0].amount, totalTransfers: ledgerData.items[2].amount, totalExpenses: ledgerData.items[1].amount});
    expect(getLedgerTotals(ledgerData.items)).toStrictEqual({ totalIncome: 196774.19999999984, totalTransfers: 50000, totalExpenses: 147025.2});
  });
});
