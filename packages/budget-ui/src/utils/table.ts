import { PAID_SYMBOL } from "../constants/theme";
import { LedgerDataItem, LedgerTotals } from "../types";
import { parseDate } from "./date";
import { dollarFormat, formatDate } from "./format";

export enum ColumnType {
  DATE,
  INCOME,
  TRANSFER,
  BALANCE,
  EXPENSE,
  PAID,
  LABEL,
  ADD_OR_REMOVE
};

export const getRowClassName = (index: number, evenClass: string, existingClasses?: Array<string>) => {
  const className = index % 2 ? evenClass : undefined;
  const allClasses = existingClasses || [];
  if (className) {
    allClasses.push(className);
  }

  return allClasses.join(' ');
};
export const getCellClassName = (item: LedgerDataItem, columnType: ColumnType, existingClasses?: Array<string>) => {
  const allClasses = existingClasses || [];

  // switch (columnType) {
  //   case ColumnType.DATE:
  //     allClasses.push(getFirstOfDateClass(item.settledDate.split('T')[0], previousItem.settledDate.split('T')[0], ));
  // }

  return allClasses.join(' ');
};

export const getRowId = (currentDate: string, previousDate: string): string => {
  if (!previousDate || currentDate.split('-')[1] !== previousDate.split('-')[1]) {
    return `month-${Number(currentDate.split('-')[1]) - 1}`;
  } else if (currentDate === new Date().toISOString().split('T')[0]) {
    return 'today';
  } else {
    return '';
  }
};

export const isFirstOfDate = (currentDate: string, previousDate: string): boolean => {
  return !previousDate || currentDate !== previousDate;
};

export const getFirstOfDateClass = (currentDate: string, previousDate: string, firstOfDateClass: string, notFirstOfDateClass: string): string => {
  return isFirstOfDate(currentDate, previousDate) ? firstOfDateClass : notFirstOfDateClass;
};

export const getLedgerItemDate = (settledDate: string) => {
  return formatDate(parseDate(settledDate), 'MMM. D');
};

export const getLedgerItemIncome = (item: LedgerDataItem): string => {
  return item.type_id === 1 ? dollarFormat(item.amount) : '';
};

export const getLedgerItemTransfer = (item: LedgerDataItem): string => {
  return item.type_id === 3 ? dollarFormat(item.amount) : '';
};

export const getLedgerItemBalance = (balance?: number | string): string => {
  return balance !== undefined ? dollarFormat(Number(balance), true, true, true) : '';
};

export const getLedgerItemExpense = (item: LedgerDataItem): string => {
  return item.type_id === 2 ? dollarFormat(item.amount) : '';
};

export const getLedgerItemPaid = (paid: boolean | string): string => {
  return paid ? String.fromCharCode(PAID_SYMBOL) : '';
};

export const getLedgerTotals = (items: Array<LedgerDataItem>): LedgerTotals => {
  let totalIncome = 0;
  let totalTransfers = 0;
  let totalExpenses = 0;

  items.forEach((item: LedgerDataItem) => {
    switch(item.type_id) {
      case 1:
        totalIncome += Number(item.amount);
        break;
      case 3:
        totalTransfers += Number(item.amount);
        break;
      case 2:
        totalExpenses += Number(item.amount);
        break;
    }
  });

  return {
    totalIncome,
    totalTransfers,
    totalExpenses,
  };
};
