import { parse } from 'fecha';

export const parseDate = (date: string): Date => {
  return parse(date, 'isoDateTime') || new Date();
};

export const getDateFromDayOfYear = (year: number, day: number): Date => {
  var date = new Date(year, 0); // initialize a date in `year-01-01`
  return new Date(date.setDate(day - 1)); // add the number of days
};

export const isLeapYear = (year: number): boolean => {
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
};

export const getDaysInYear = (year: number): number => {
  return isLeapYear(year) ? 366 : 365;
};

export const getDayOfYear = (date: Date): number => {
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();

  let dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let mn = m;
  let dn = d;
  let dayOfYear = +dayCount[mn] + +dn;
  if (mn > 1 && isLeapYear(y)) {
    dayOfYear++;
  }

  return dayOfYear;
};

export const getFirstOfMonth = (month: number | string, year?: number | string): string => {
  if (!year && typeof month === 'string') {
    year = month.split("-")[0];
    month = month.split("-")[1];
  }

  month = Number(month) < 10 && String(month)[0] !== '0' ? "0" + month : month;

  return year + "-" + month + "-01";
};

export const setToLocalTimezone = (date: string): string => {
  let localDate = parseDate(date.includes('T') ? date : date + 'T00:00:00');
  const localTzOffset = localDate.getTimezoneOffset();
  localDate.setTime(localDate.getTime() + localTzOffset * 60000);

  return localDate.toISOString().replace('Z', '');
};

export const setToUTC = (date: string): string => {
  let utcDate = parseDate(date.split('T')[0] + 'T00:00:00');
  const localTzOffset = utcDate.getTimezoneOffset();
  utcDate.setTime(utcDate.getTime() + localTzOffset * 60000);

  return utcDate.toISOString();
};
