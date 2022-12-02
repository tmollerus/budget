import { PAID_SYMBOL } from "../constants/theme";
import { LedgerData, LedgerDataItem } from "../types";
import { delimitNumbers, dollarFormat, getDayOfYear, getEntryBalance, getEntryExpense, getEntryIncome, getEntryPaid, getEntryTransfer, getEntryTypeName, getFirstOfMonth, getIncomeClass, formatDate, getMonthAsName, getDateFromDayOfYear, getIncomeOrExpense, getGravatarHash, isLeapYear } from "./format";

describe('Formatting functions', () => {
  test('getMonthAsName', () => {
    expect(getMonthAsName(0)).toBe('Jan');
    expect(getMonthAsName(5)).toBe('Jun');
    expect(getMonthAsName(11)).toBe('Dec');
  });

  test('formatDate', () => {
    expect(formatDate(null)).toBe(undefined);
    expect(formatDate(new Date())).not.toBe(undefined);
    expect(formatDate('2012-11-23T00:00:00-0000')).toBe('Nov. 23');
    expect(formatDate('2012-12-23T00:00:00-0600')).toBe('Dec. 23');
    expect(formatDate('2012-09-02T00:00:00-0600')).toBe('Sep. 2');
    expect(formatDate('2012-09-02T00:00:00-0600', 'MMMM DD, YYYY')).toBe('September 02, 2012');
    expect(formatDate('2012-09-02T00:00:00-0600', 'MMM. DD, YYYY')).toBe('Sep. 02, 2012');
  });

  test('dollarFormat', () => {
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

  it('getDateFromDayOfYear', () => {
    let resultDate = getDateFromDayOfYear(2012, 15);
    expect(resultDate.getDate()).toBe(14);
    expect(resultDate.getFullYear()).toBe(2012);

    resultDate = getDateFromDayOfYear(2017, 92);
    expect(resultDate.getDate()).toBe(1);
    expect(resultDate.getFullYear()).toBe(2017);

    resultDate = getDateFromDayOfYear(2021, 214);
    expect(resultDate.getDate()).toBe(1);
    expect(resultDate.getFullYear()).toBe(2021);
  });

  it('isLeapYear', () => {
    expect(isLeapYear(2011)).toBe(false);
    expect(isLeapYear(2012)).toBe(true);
    expect(isLeapYear(2013)).toBe(false);
    expect(isLeapYear(2019)).toBe(false);
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2021)).toBe(false);
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
    expect(getDayOfYear('2014-12-31')).toBe(365);
  });

  test('getIncomeClass', () => {
    expect(getIncomeClass(-1)).toBe('expense');
    expect(getIncomeClass(0)).toBe('expense');
    expect(getIncomeClass(1)).toBe('income');
  });

  test('getIncomeOrExpense', () => {
    const ledgerData: LedgerData = {
      "items": [
        {
            "dateModified": "2021-12-11T14:00:22.933329+00:00Z",
            "dateCreated": "2021-12-11T14:00:22.933322+00:00Z",
            "settledDate": "2022-01-01T00:00:00+00:00Z",
            "paid": true,
            "budget_guid": "2e02e112-78e4-11e1-8645-4e6ec7412f43",
            "amount": 700,
            "active": true,
            "type_id": 3,
            "label": "To Discretionary",
            "guid": "492f1733-1a32-4b14-a596-c5076cacf4a1"
        },
        {
            "dateModified": "2021-12-11T14:00:22.864954+00:00Z",
            "dateCreated": "2021-12-11T14:00:22.864944+00:00Z",
            "settledDate": "2022-01-03T00:00:00+00:00Z",
            "paid": true,
            "budget_guid": "2e02e112-78e4-11e1-8645-4e6ec7412f43",
            "amount": 25.12,
            "active": true,
            "type_id": 2,
            "label": "Web hosting",
            "guid": "246922c7-7279-4a35-a3cd-03b8fa606a0e"
        },
        {
            "dateModified": "2021-12-11T14:00:22.888684+00:00Z",
            "dateCreated": "2021-12-11T14:00:22.888676+00:00Z",
            "settledDate": "2022-01-03T00:00:00+00:00Z",
            "paid": true,
            "budget_guid": "2e02e112-78e4-11e1-8645-4e6ec7412f43",
            "amount": 65.82,
            "active": true,
            "type_id": 1,
            "label": "Email hosting",
            "guid": "8e85cd7f-1bb9-431c-aa7f-45552b025e80"
        },
      ],
      "starting_balance": 16202.41
    };
    expect(getIncomeOrExpense(ledgerData.items[0])).toBe(-ledgerData.items[0].amount);
    expect(getIncomeOrExpense(ledgerData.items[1])).toBe(-ledgerData.items[1].amount);
    expect(getIncomeOrExpense(ledgerData.items[2])).toBe(ledgerData.items[2].amount);
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

  test('getGravatarHash', () => {
    expect(getGravatarHash('')).toBe(null);
    expect(getGravatarHash('foo@bar.com')).toBe('f3ada405ce890b6f8204094deb12d8a8');
  });
});
