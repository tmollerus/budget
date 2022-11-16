import { PAID_SYMBOL } from "../constants/theme";
import { LedgerDataItem } from "../types";
import { delimitNumbers, dollarFormat, getDayOfYear, getEntryBalance, getEntryExpense, getEntryIncome, getEntryPaid, getEntryTransfer, getEntryTypeName, getFirstOfMonth, getIncomeClass, getRowIdForMonth } from "./format";

// test('dateFormat', () => {
//   expect(dateFormat(null)).toBe(undefined);
//   expect(dateFormat(new Date())).not.toBe(undefined);
//   expect(dateFormat('2012-11-23T00:00:00-0000')).toBe('Nov. 23');
//   expect(dateFormat('2012-12-23T00:00:00-0600')).toBe('Dec. 23');
//   expect(dateFormat('2012-09-02T00:00:00-0600')).toBe('Sep. 2');
//   expect(dateFormat('2012-09-02T00:00:00-0600', 'mmmm dd, yyyy')).toBe('September 02, 2012');
// });

test('dollarFormat', () => {
  expect(dollarFormat(null)).toBe('$0.00');
  expect(dollarFormat(10.35)).toBe('$10.35');
  expect(dollarFormat(1800.35, false)).toBe('$1800.35');
  expect(dollarFormat(1800.35, true)).toBe('$1,800.35');
  expect(dollarFormat(1800.35)).toBe('$1,800.35');
  expect(dollarFormat(1800.35, false, true)).toBe('$1800.35');
  expect(dollarFormat(1800.35, false, false)).toBe('$1800');
  expect(dollarFormat(-1800.35, false, true, true)).toBe('-$1800.35');
  expect(dollarFormat(-1800.35, false, true, false)).toBe('$1800.35');
});

test('delimitNumbers', () => {
  expect(delimitNumbers('0')).toBe('0');
  expect(delimitNumbers('1')).toBe('1');
  expect(delimitNumbers('10')).toBe('10');
  expect(delimitNumbers('789')).toBe('789');
  expect(delimitNumbers('1789')).toBe('1,789');
  expect(delimitNumbers('9789')).toBe('9,789');
  expect(delimitNumbers('13789')).toBe('13,789');
});

it('getDayOfYear', () => {
  expect(getDayOfYear('2012-01-01')).toBe(1);
  expect(getDayOfYear('2012-02-01')).toBe(32);
  expect(getDayOfYear('2012-03-01')).toBe(61);
  expect(getDayOfYear('2012-04-01')).toBe(92);
  expect(getDayOfYear('2012-05-01')).toBe(122);
  expect(getDayOfYear('2012-06-01')).toBe(153);
  expect(getDayOfYear('2012-07-01')).toBe(183);
  expect(getDayOfYear('2012-08-01')).toBe(214);
  expect(getDayOfYear('2012-09-01')).toBe(245);
  expect(getDayOfYear('2012-10-01')).toBe(275);
  expect(getDayOfYear('2012-11-01')).toBe(306);
  expect(getDayOfYear('2012-12-01')).toBe(336);
  expect(getDayOfYear('2012-12-31')).toBe(366);
});

test('getIncomeClass', () => {
  expect(getIncomeClass(-1)).toBe('expense');
  expect(getIncomeClass(0)).toBe('expense');
  expect(getIncomeClass(1)).toBe('income');
});

test('getEntryTypeName', () => {
  expect(getEntryTypeName(3)).toBe('Transfer');
  expect(getEntryTypeName(2)).toBe('Expense');
  expect(getEntryTypeName(1)).toBe('Income');
  expect(getEntryTypeName(0)).toBe('Income');
  expect(getEntryTypeName(null)).toBe('Income');
});

test('getEntryIncome', () => {
  const amount = 10;
  const entry: LedgerDataItem = {
    dateModified: '',
    dateCreated: '',
    settledDate: '',
    paid: false,
    budget_guid: '',
    amount,
    active: true,
    type_id: 1,
    label: '',
    guid: '',
  };
  expect(getEntryIncome(Object.assign(entry, { type_id: 1}))).toBe(dollarFormat(amount));
  expect(getEntryIncome(Object.assign(entry, { type_id: 2}))).toBe(undefined);
  expect(getEntryIncome(Object.assign(entry, { type_id: 3}))).toBe(undefined);
});

test('getEntryTransfer', () => {
  const amount = 10;
  const entry: LedgerDataItem = {
    dateModified: '',
    dateCreated: '',
    settledDate: '',
    paid: false,
    budget_guid: '',
    amount,
    active: true,
    type_id: 1,
    label: '',
    guid: '',
  };
  expect(getEntryTransfer(Object.assign(entry, { type_id: 3}))).toBe(dollarFormat(amount));
  expect(getEntryTransfer(Object.assign(entry, { type_id: 1}))).toBe(undefined);
  expect(getEntryTransfer(Object.assign(entry, { type_id: 2}))).toBe(undefined);
});

test('getEntryExpense', () => {
  const amount = 10;
  const entry: LedgerDataItem = {
    dateModified: '',
    dateCreated: '',
    settledDate: '',
    paid: false,
    budget_guid: '',
    amount,
    active: true,
    type_id: 1,
    label: '',
    guid: '',
  }
  expect(getEntryExpense(Object.assign(entry, { type_id: 2}))).toBe(dollarFormat(amount));
  expect(getEntryExpense(Object.assign(entry, { type_id: 1}))).toBe(undefined);
  expect(getEntryExpense(Object.assign(entry, { type_id: 3}))).toBe(undefined);
});

test('getEntryBalance', () => {
  expect(getEntryBalance(10)).toBe(dollarFormat(10, true, true, true));
});

test('getEntryPaid', () => {
  expect(getEntryPaid(true).__html).toBe(PAID_SYMBOL);
  expect(getEntryPaid(false).__html).not.toBe(PAID_SYMBOL);
});

test('getFirstOfMonth', () => {
  expect(getFirstOfMonth(1, 2012)).toBe('2012-01-01');
  expect(getFirstOfMonth(10, 2014)).toBe('2014-10-01');
  expect(getFirstOfMonth('2018-1-22')).toBe('2018-01-01');
});

test('getRowIdForMonth', () => {
  expect(getRowIdForMonth(1, 2012)).toBe('2012-01');
  expect(getRowIdForMonth(10, 2014)).toBe('2014-10');
  expect(getRowIdForMonth('2018-1-22')).toBe('2018-01');
});
