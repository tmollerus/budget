import { Dispatch, ReactNode, SetStateAction } from "react";

export interface BudgetAuthResponse {
  budgetGUID: string;
}

export type BudgetContextType = {
  budgetYear: number;
  setBudgetYear: Dispatch<SetStateAction<number>>;
  budgetGuid: string;
  setBudgetGuid: Dispatch<SetStateAction<string>>;
  ledgerData: LedgerData;
  setLedgerData: Dispatch<SetStateAction<LedgerData>>;
}

export type BudgetProviderProps = {
  children?: ReactNode;
}

export interface BudgetUrlParams {
  year: string;
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

export interface PartialLedgerDataItem {
  guid?: string;
  settledDate: string;
  type_id: number;
  amount: number;
  paid: boolean;
  label: string;
};

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
  updateDate?: Date;
}

export enum MessageType {
  CONFIRM_DELETE,
  ITEM_DELETED,
  ITEM_ADDED,
  ITEM_EDITED,
  DEFAULT,
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

export interface UserInfo {
  name: string;
  email: string;
}
