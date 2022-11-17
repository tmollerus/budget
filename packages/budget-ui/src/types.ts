import { Dispatch, ReactNode, SetStateAction } from "react";

export interface LedgerDataItem {
  dateModified: string;
  dateCreated: string;
  settledDate: string;
  paid: boolean;
  budget_guid: string;
  balance?: number;
  amount: number;
  active: boolean;
  type_id: number;
  label: string;
  guid: string;
}

export interface LedgerData {
  items: Array<LedgerDataItem>;
  starting_balance: number;
}

export interface Statistics {
  today: number;
  expensesLeft: number;
  yearEnd: number;
  incomeTotal: number;
  expenseTotal: number;
  transferTotal: number;
  deficitDate: Date | null;
}

export type BudgetContextType = {
  budgetYear: number;
  setBudgetYear: Dispatch<SetStateAction<number>>;
  budgetGuid: string;
  setBudgetGuid: Dispatch<SetStateAction<string>>;
  ledgerData: LedgerData;
  setLedgerData: Dispatch<SetStateAction<LedgerData>>;
  dailyBalances: Array<number>;
  setDailyBalances: Dispatch<SetStateAction<Array<number>>>;
}

export type BudgetProviderProps = {
  children?: ReactNode;
}

export interface ChartData {
  value: number;
  now: {
    x: number;
    y: number;
  }
}

export interface ChartTooltip {
  chart: {
    hoverPoint: ChartPoint | null
  }
}

export interface ChartPoint {
  x: number;
  y: number;
}
