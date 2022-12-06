import { LedgerDataItem } from "../types";
import { dollarFormat } from "./format";
import { getLedgerItemIncome } from "./table";

describe('Table functions', () => {
  test('getLedgerItemIncome', () => {
    const amount = 10;
    const entry: LedgerDataItem = {
      dateModified: '',
      dateCreated: '',
      settledDate: '',
      paid: false,
      budget_guid: '',
      amount,
      active: true,
      type_id: 1,
      label: '',
      guid: '',
    };
    expect(getLedgerItemIncome(Object.assign(entry, { type_id: 1}))).toBe(dollarFormat(amount));
    expect(getLedgerItemIncome(Object.assign(entry, { type_id: 2}))).toBe('');
    expect(getLedgerItemIncome(Object.assign(entry, { type_id: 3}))).toBe('');
  });
});
