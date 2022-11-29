import { Region, Regions } from "@blueprintjs/table";
import { LedgerData, LedgerDataItem, MessageType } from "../types";
import { formatDate, dollarFormat, getEntryTypeName } from "./format";

export const getMessage = (messageType: MessageType, item: LedgerDataItem) => {
  const itemDate = formatDate(item.settledDate, 'mmm. dd, yyyy');
  const itemType = getEntryTypeName(item.type_id).toLowerCase();

  switch(messageType) {
    case MessageType.CONFIRM_DELETE:
      return `Are you sure you would like to delete the ${itemDate}, transaction '${item.label}' for ${dollarFormat(item.amount)}? This action cannot be undone.`;
    case MessageType.ITEM_DELETED:
      return `Successfully deleted ${itemType} '${item.label}' from ${itemDate}`;
    case MessageType.ITEM_ADDED:
      return `Successfully added ${itemType} '${item.label}' from ${itemDate}`;
    case MessageType.ITEM_EDITED:
      return `Successfully update ${itemType} '${item.label}' from ${itemDate}`;
    default:
      return ``;
  }
};

export const getRegions = (ledgerData: Array<LedgerDataItem>): Array<Region> => {
  const regions: Array<Region> = [];
  let lowerBoundary: number | undefined;
  let upperBoundary: number | undefined;
  let currentMonth = 0;

  ledgerData.forEach((item: LedgerDataItem, index: number) => {
    const month = Number(item.settledDate.split('T')[0].split('-')[1]);

    if (month >= currentMonth) {
      if (index > 0) {
        upperBoundary = index - 1;
      }

      if (lowerBoundary && upperBoundary) {
        regions.push(Regions.row(lowerBoundary === 1 ? 0 : lowerBoundary, upperBoundary));
        lowerBoundary = undefined;
        upperBoundary = undefined;
      }

      lowerBoundary = index;
      currentMonth++;
    }

    return regions;
  });

  if (regions.length) {
    regions.push(Regions.row(regions[regions.length - 1].rows?.[1]! + 1, ledgerData.length - 1));
  }
  return regions;
}

export const netValue = (amount: number, typeId: number): number => {
  return typeId === 1 ? amount : -amount;
};

export const updateItemBalances = (ledgerData: LedgerData): Array<LedgerDataItem> => {
  let balance = ledgerData.starting_balance;

  return ledgerData.items.map((item: LedgerDataItem, index: number) => {
    balance += netValue(ledgerData.items[index].amount, ledgerData.items[index].type_id);
    return Object.assign(item, { balance });
  });
};