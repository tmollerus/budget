import { format as dateFormat } from 'fecha';
import md5 from 'crypto-js/md5';
import { PAID_SYMBOL } from "../constants/theme";
import { LedgerDataItem } from "../types";

// export const dollarFormat = (amount: number) => {
//   return amount === 0 ? '' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
// };

export const getMonthAsName = (index: number): string => {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][index];
}

export const formatDate = (date: Date | string | null, format?: string): string | undefined => {
  if (typeof date === "string") {
    date = new Date(date.split("T")[0] + "T00:00:00-0600");
  } else if (!date) {
    return undefined;
  }

  format = format || "MMM. D";
  return dateFormat(date, format);
}

export const dollarFormat = (amount: number, separators?: boolean, decimals?: boolean, allowNegative?: boolean): string => {
  let originalAmount = amount;
  amount = Math.abs(amount);
  if (separators === undefined) {
    separators = true;
  }
  if (decimals === undefined) {
    decimals = true;
  }
  if (allowNegative === undefined) {
    allowNegative = false;
  }

  let result = "$" + amount.toFixed(decimals ? 2 : 0);
  if (separators) {
    result = delimitNumbers(result);
  }

  if (allowNegative && originalAmount < 0) {
    result = "-" + result;
  }

  return result;
};

export const delimitNumbers = (str: string): string => {
  return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
    return (
      (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".")
        ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,")
        : b) + c
    );
  });
};

export const getEntryTypeName = (type_id: number | null): string => {
  if (type_id === 3) {
    return "Transfer";
  } else if (type_id === 2) {
    return "Expense";
  } else {
    return "Income";
  }
};

export const getIncomeClass = (amount: number): string => {
  return amount > 0 ? "income" : "expense";
};

export const getIncomeOrExpense = (entry: LedgerDataItem): number => {
  if (entry.type_id === 1) {
    return entry.amount;
  } else {
    return -entry.amount;
  }
};

export const getEntryIncome = (entry: LedgerDataItem): string | void => {
  if (entry.type_id === 1) return dollarFormat(entry.amount);
};

export const getEntryTransfer = (entry: LedgerDataItem): string | void => {
  if (entry.type_id === 3) return dollarFormat(entry.amount);
};

export const getEntryBalance = (entryBalance: number | string): string => {
  return dollarFormat(Number(entryBalance), true, true, true);
};

export const getEntryExpense = (entry: LedgerDataItem): string | void => {
  if (entry.type_id === 2) return dollarFormat(entry.amount);
};

export const getEntryPaid = (paid: boolean | string): { __html: string } => {
  if ((paid || paid === "true") && paid !== "false") {
    return { __html: PAID_SYMBOL };
  } else {
    return { __html: '' };
  }
};

export const getGravatarHash = (email: string): string | null => {
  return email ? md5(email).toString() : null;
};
