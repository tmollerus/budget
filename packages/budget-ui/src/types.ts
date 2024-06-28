import { Dispatch, ReactNode, SetStateAction } from "react";

export interface Category {
  guid: string | null;
  label: string;
}

export interface Subcategory {
  guid: string | null;
  category_guid: string | null;
  label: string;
}

export interface BreakpointRange {
  top: number;
  bottom: number;
}

export interface Breakpoints {
  [index: string]: BreakpointRange;
}

export interface BudgetAuthResponse {
  budgetGuid: string;
}

export type BudgetContextType = {
  budgetYear: number;
  setBudgetYear: Dispatch<SetStateAction<number>>;
  budgetGuid: string;
  setBudgetGuid: Dispatch<SetStateAction<string>>;
  ledgerData: LedgerData;
  setLedgerData: Dispatch<SetStateAction<LedgerData>>;
  categories: Array<Category>;
  setCategories: Dispatch<SetStateAction<Array<Category>>>;
  subcategories: Array<Subcategory>;
  setSubcategories: Dispatch<SetStateAction<Array<Subcategory>>>;
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
  category_guid?: string;
  subcategory_guid?: string;
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
  category_guid?: string;
  categoryName?: string;
  subcategory_guid?: string;
  subcategoryName?: string;
}

export interface ExtendedLedgerDataItem extends LedgerDataItem {
  starting_balance: string;
  next_year_item_count: string;
}

export interface LedgerData {
  items: Array<ExtendedLedgerDataItem>;
  updateDate?: Date;
}

export enum MessageType {
  CONFIRM_CATEGORIZATION,
  CONFIRM_DELETE,
  ITEM_CATEGORIZED,
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

export interface LedgerTotals {
  totalIncome: number;
  totalTransfers: number;
  totalExpenses: number;
}

export interface UserInfo {
  name: string;
  email: string;
}
