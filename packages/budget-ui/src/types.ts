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
