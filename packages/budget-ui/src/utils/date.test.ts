import { getDateFromDayOfYear, getDayOfYear, getFirstOfMonth, isLeapYear, parseDate } from "./date";

describe('Date functions', () => {
  test('parseDate', () => {
    expect(parseDate('2012-11-23T00:00:00Z').toISOString()).toBe('2012-11-23T00:00:00.000Z');
    expect(parseDate('2012-12-23T00:00:00Z').toISOString()).toBe('2012-12-23T00:00:00.000Z');
    expect(parseDate('2012-09-02T00:00:00Z').toISOString()).toBe('2012-09-02T00:00:00.000Z');
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

  test('getFirstOfMonth', () => {
    expect(getFirstOfMonth(1, 2012)).toBe('2012-01-01');
    expect(getFirstOfMonth(10, 2014)).toBe('2014-10-01');
    expect(getFirstOfMonth('2018-1-22')).toBe('2018-01-01');
  });
});
