import { ExtendedLedgerDataItem, Statistics } from "../types";
import { parseDate } from "./date";

export const getStatistics = (entries: Array<ExtendedLedgerDataItem>) => {
  let today = new Date();
  let date;
  let statistics: Statistics = {
    today: 0,
    expensesLeft: 0,
    yearEnd: Number(entries[0]?.starting_balance) || 0,
    incomeTotal: 0,
    expenseTotal: 0,
    transferTotal: 0,
    deficitDate: null,
  };

  entries.forEach(function(entry) {
    date = parseDate(entry.settledDate);
    // If the entry is in the current month and is an expense
    if (
      date.getMonth() === today.getMonth() &&
      date.getDate() > today.getDate() &&
      entry.type_id === 2 &&
      !entry.paid
    ) {
      // Add the amount to expenses left this month
      statistics.expensesLeft += +entry.amount;
    }

    // Get the year-end balance
    statistics.yearEnd = getEntryBalance(
      statistics.yearEnd,
      entry
    );

    // If the deficitDate is still null and the current balance is below zero
    if (!statistics.deficitDate && statistics.yearEnd < 0) {
      // Set the deficitDate
      statistics.deficitDate = date;
    }

    // If the entry is for the current date
    if (date < today) {
      // Set today's balance to the current balance
      statistics.today = statistics.yearEnd;
    }

    if (entry.type_id === 1) {
      statistics.incomeTotal += +entry.amount;
    } else if (entry.type_id === 3) {
      statistics.transferTotal += +entry.amount;
    } else {
      statistics.expenseTotal += +entry.amount;
    }
  });

  return statistics;
};

export const getEntryBalance = (previousEntryBalance: number, entry: ExtendedLedgerDataItem): number => {
  previousEntryBalance = Number(previousEntryBalance) || 0;

  if (entry.type_id === 1) {
    return previousEntryBalance + entry.amount;
  } else {
    return previousEntryBalance - entry.amount;
  }
};
