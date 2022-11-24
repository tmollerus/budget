import { LedgerDataItem, Statistics } from "../types";

export const getStatistics = (entries: Array<LedgerDataItem>, startingBalance: number) => {
  let today = new Date();
  let date;
  let statistics: Statistics = {
    today: 0,
    expensesLeft: 0,
    yearEnd: startingBalance,
    incomeTotal: 0,
    expenseTotal: 0,
    transferTotal: 0,
    deficitDate: null,
  };

  entries.forEach(function(entry) {
    date = new Date(Date.parse(entry.settledDate.split('T')[0]));
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

const getEntryBalance = (previousEntryBalance: number, entry: LedgerDataItem): number => {
  previousEntryBalance = Number(previousEntryBalance) || 0;

  if (entry.type_id === 1) {
    return previousEntryBalance + entry.amount;
  } else {
    return previousEntryBalance - entry.amount;
  }
};

// const addIncome = (previousTotal: number, entry: LedgerDataItem): number => {
//   previousTotal = Number(previousTotal) || 0;

//   if (entry.type_id === 1) {
//     return previousTotal + entry.amount;
//   } else {
//     return previousTotal;
//   }
// };

// const addTransfer = (previousTotal: number, entry: LedgerDataItem): number => {
//   previousTotal = Number(previousTotal) || 0;

//   if (entry.type_id === 3) {
//     return previousTotal + entry.amount;
//   } else {
//     return previousTotal;
//   }
// };

// const addExpense = (previousTotal: number, entry: LedgerDataItem): number => {
//   previousTotal = Number(previousTotal) || 0;

//   if (entry.type_id === 2) {
//     return previousTotal + entry.amount;
//   } else {
//     return previousTotal;
//   }
// };
