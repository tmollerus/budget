import { Category, ExtendedLedgerDataItem, LedgerData, LedgerDataItem, MessageType, PartialLedgerDataItem, Subcategory } from "../types";
import { formatDate, dollarFormat, getEntryTypeName } from "./format";
import { setToUTC } from './date';

export const addLedgerDataItem = (ledgerData: LedgerData, addedItem: ExtendedLedgerDataItem): LedgerData => {
  let updatedLedgerData = JSON.parse(JSON.stringify(ledgerData));
  updatedLedgerData.items.push(addedItem);
  updatedLedgerData.items = sortLedgerData(updatedLedgerData);
  updatedLedgerData.items = updateItemBalances(updatedLedgerData);

  return updatedLedgerData;
};

export const deleteLedgerDataItem = (ledgerData: LedgerData, deletedItem: PartialLedgerDataItem): LedgerData => {
  let updatedLedgerData = JSON.parse(JSON.stringify(ledgerData));
  const index = ledgerData.items.findIndex((item) => {
    return item.guid === deletedItem.guid;
  });

  if (index >= 0) {
    updatedLedgerData.items.splice(index, 1);
    updatedLedgerData.items = sortLedgerData(updatedLedgerData);
    updatedLedgerData.items = updateItemBalances(updatedLedgerData);
  } else {
    console.error('No match was found for the updated item in the ledger data', deletedItem);
  }

  return updatedLedgerData;
};

export const getCategoryNameByGuid = (guid: string, categories: Array<Category>): string => {
  return categories.find((category: Category) => { return category.guid === guid; })?.label || '';
};

export const getSubcategoryNameByGuid = (guid: string, subcategories: Array<Subcategory>): string => {
  return subcategories.find((subcategory: Subcategory) => { return subcategory.guid === guid; })?.label || '';
};

export const getLedgerDataItemByGuid = (ledgerData: LedgerData, itemGuid: string): LedgerDataItem | undefined => {
  const index = ledgerData.items.findIndex((item) => {
    return item.guid === itemGuid;
  });

  if (index >= 0) {
    return ledgerData.items[index];
  } else {
    console.error('No match was found for the item in the ledger data', itemGuid);
    return undefined;
  }
};

export const getMessage = (messageType: MessageType, item: PartialLedgerDataItem) => {
  const itemDate = formatDate(item.settledDate, 'MMM. D, YYYY');
  const itemType = getEntryTypeName(item.type_id).toLowerCase();

  switch(messageType) {
    case MessageType.CONFIRM_CATEGORIZATION:
      return `Please select categories for '${item.label}' for ${dollarFormat(item.amount)} on ${itemDate}.`;
    case MessageType.CONFIRM_DELETE:
      return `Are you sure you would like to delete the ${itemDate}, transaction '${item.label}' for ${dollarFormat(item.amount)}? This action cannot be undone.`;
    case MessageType.ITEM_CATEGORIZED:
      return `Successfully categorized ${itemType} '${item.label}' from ${itemDate}`;
    case MessageType.ITEM_DELETED:
      return `Successfully deleted ${itemType} '${item.label}' from ${itemDate}`;
    case MessageType.ITEM_ADDED:
      return `Successfully added ${itemType} '${item.label}' from ${itemDate}`;
    case MessageType.ITEM_EDITED:
      return `Successfully updated ${itemType} '${item.label}' from ${itemDate}`;
    default:
      return ``;
  }
};

export const netValue = (amount: number, typeId: number): number => {
  return typeId === 1 ? amount : -amount;
};

export const sortLedgerData = (ledgerData: LedgerData): Array<ExtendedLedgerDataItem> => {
  const sortedLedgerData = JSON.parse(JSON.stringify(ledgerData)) as LedgerData;
  sortedLedgerData.items.sort((a, b) => {
    if (a.settledDate < b.settledDate) {
      return -1;
    } else if (a.settledDate > b.settledDate) {
      return 1;
    } else if (a.type_id === 1 && (b.type_id === 3 || b.type_id === 2)) {
      return -1;
    } else if (a.type_id === 2 && b.type_id === 1) {
      return 1;
    } else if (a.type_id === 2 && b.type_id === 3) {
      return -1;
    } else if (a.type_id === 3 && b.type_id === 2) {
      return 1;
    } else if (a.type_id === 3 && b.type_id === 1) {
      return 1;
    } else if (a.amount > b.amount) {
      return -1;
    } else if (a.amount < b.amount) {
      return 1;
    } else {
      return 0;
    }
  });

  return sortedLedgerData.items;
};

export const updateItemBalances = (ledgerData: LedgerData): Array<ExtendedLedgerDataItem> => {
  let balance = Number(ledgerData.items[0].starting_balance);

  return ledgerData.items.map((item: ExtendedLedgerDataItem, index: number) => {
    balance += netValue(Number(ledgerData.items[index].amount), ledgerData.items[index].type_id);
    return Object.assign(item, { balance });
  });
};

export const updateItemCategories = (ledgerData: LedgerData, categories: Array<Category>, subcategories: Array<Subcategory>): Array<ExtendedLedgerDataItem> => {
  return ledgerData.items.map((item: ExtendedLedgerDataItem) => {
    const categoryName: string = getCategoryNameByGuid(item.category_guid!, categories);
    const subcategoryName: string = getSubcategoryNameByGuid(item.subcategory_guid!, subcategories);
    return Object.assign(item, { categoryName, subcategoryName });
  });
};

export const updateLedgerDataItem = (ledgerData: LedgerData, updatedItem: PartialLedgerDataItem): LedgerData => {
  let updatedLedgerData = JSON.parse(JSON.stringify(ledgerData));
  const index = ledgerData.items.findIndex((item) => {
    return item.guid === updatedItem.guid;
  });

  if (index >= 0) {
    updatedLedgerData.items[index].settledDate = setToUTC(updatedItem.settledDate);
    updatedLedgerData.items[index].type_id = updatedItem.type_id;
    updatedLedgerData.items[index].amount = updatedItem.amount;
    updatedLedgerData.items[index].paid = updatedItem.paid;
    updatedLedgerData.items[index].label = updatedItem.label;
    updatedLedgerData.items[index].category_guid = updatedItem.category_guid;
    updatedLedgerData.items[index].subcategory_guid = updatedItem.subcategory_guid;
    updatedLedgerData.items = sortLedgerData(updatedLedgerData);
    updatedLedgerData.items = updateItemBalances(updatedLedgerData);
  } else {
    console.error('No match was found for the updated item in the ledger data', updatedItem);
  }

  return updatedLedgerData;
};
