import { LedgerData, MessageType, PartialLedgerDataItem } from "../types";
import { parseDate } from "./date";
import { dollarFormat, formatDate, getEntryTypeName } from "./format";
import { getLedgerDataItemByGuid, getMessage, netValue, updateItemBalances, updateLedgerDataItem } from "./ledger";

const ledgerData: LedgerData = {
  "items": [
    {
        "dateModified": "2021-12-11T14:00:22.933329+00:00Z",
        "dateCreated": "2021-12-11T14:00:22.933322+00:00Z",
        "settledDate": "2022-01-01T00:00:00+00:00Z",
        "paid": true,
        "budget_guid": "2e02e112-78e4-11e1-8645-4e6ec7412f43",
        "amount": 700,
        "active": true,
        "type_id": 3,
        "label": "To Discretionary",
        "guid": "492f1733-1a32-4b14-a596-c5076cacf4a1",
        "starting_balance": "16202.41",
        "next_year_item_count": "200"
    },
    {
        "dateModified": "2021-12-11T14:00:22.864954+00:00Z",
        "dateCreated": "2021-12-11T14:00:22.864944+00:00Z",
        "settledDate": "2022-02-03T00:00:00+00:00Z",
        "paid": true,
        "budget_guid": "2e02e112-78e4-11e1-8645-4e6ec7412f43",
        "amount": 25.12,
        "active": true,
        "type_id": 2,
        "label": "Web hosting",
        "guid": "246922c7-7279-4a35-a3cd-03b8fa606a0e",
        "starting_balance": "16202.41",
        "next_year_item_count": "200"
    },
    {
        "dateModified": "2021-12-11T14:00:22.888684+00:00Z",
        "dateCreated": "2021-12-11T14:00:22.888676+00:00Z",
        "settledDate": "2022-02-04T00:00:00+00:00Z",
        "paid": true,
        "budget_guid": "2e02e112-78e4-11e1-8645-4e6ec7412f43",
        "amount": 65.82,
        "active": true,
        "type_id": 1,
        "label": "Email hosting",
        "guid": "8e85cd7f-1bb9-431c-aa7f-45552b025e80",
        "starting_balance": "16202.41",
        "next_year_item_count": "200"
    },
  ]
};

describe('Ledger functions', () => {
  test('getLedgerDataItemByGuid', () => {
    ledgerData.items.forEach((item) => {
      expect(getLedgerDataItemByGuid(ledgerData, item.guid)).toStrictEqual(item);
    });

    expect(getLedgerDataItemByGuid(ledgerData, 'foo')).toBeUndefined();
  });

  test('getMessage', () => {
    expect(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[0])).toContain('delete');
    expect(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[0])).toContain(dollarFormat(ledgerData.items[0].amount));
    expect(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[0])).toContain(ledgerData.items[0].label);
    expect(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[0])).toContain(formatDate(ledgerData.items[0].settledDate, 'MMM. D, YYYY'));

    expect(getMessage(MessageType.ITEM_DELETED, ledgerData.items[0])).toContain('deleted');
    expect(getMessage(MessageType.ITEM_DELETED, ledgerData.items[0])).toContain(getEntryTypeName(ledgerData.items[0].type_id).toLowerCase());
    expect(getMessage(MessageType.ITEM_DELETED, ledgerData.items[0])).toContain(ledgerData.items[0].label);
    expect(getMessage(MessageType.ITEM_DELETED, ledgerData.items[0])).toContain(formatDate(ledgerData.items[0].settledDate, 'MMM. D, YYYY'));

    expect(getMessage(MessageType.ITEM_ADDED, ledgerData.items[1])).toContain('added');
    expect(getMessage(MessageType.ITEM_ADDED, ledgerData.items[1])).toContain(getEntryTypeName(ledgerData.items[1].type_id).toLowerCase());
    expect(getMessage(MessageType.ITEM_ADDED, ledgerData.items[1])).toContain(ledgerData.items[1].label);
    expect(getMessage(MessageType.ITEM_ADDED, ledgerData.items[1])).toContain(formatDate(ledgerData.items[1].settledDate, 'MMM. D, YYYY'));

    expect(getMessage(MessageType.ITEM_EDITED, ledgerData.items[2])).toContain('updated');
    expect(getMessage(MessageType.ITEM_EDITED, ledgerData.items[2])).toContain(getEntryTypeName(ledgerData.items[2].type_id).toLowerCase());
    expect(getMessage(MessageType.ITEM_EDITED, ledgerData.items[2])).toContain(ledgerData.items[2].label);
    expect(getMessage(MessageType.ITEM_EDITED, ledgerData.items[2])).toContain(formatDate(ledgerData.items[2].settledDate, 'MMM. D, YYYY'));

    expect(getMessage(MessageType.DEFAULT, ledgerData.items[2])).toBe('');
  });

  test('netValue', () => {
    expect(netValue(ledgerData.items[0].amount, ledgerData.items[0].type_id)).toBe(-ledgerData.items[0].amount);
    expect(netValue(ledgerData.items[1].amount, ledgerData.items[1].type_id)).toBe(-ledgerData.items[1].amount);
    expect(netValue(ledgerData.items[2].amount, ledgerData.items[2].type_id)).toBe(ledgerData.items[2].amount);
  });

  test('updateItemBalances', () => {
    let withUpdatedBalances = Object.assign({}, ledgerData);
    let expectedBalance = Number(withUpdatedBalances.items[0].starting_balance);
    expect(withUpdatedBalances.items[0].balance).not.toBeDefined();
    expect(withUpdatedBalances.items[1].balance).not.toBeDefined();
    expect(withUpdatedBalances.items[2].balance).not.toBeDefined();

    withUpdatedBalances.items = updateItemBalances(ledgerData);
    expect(withUpdatedBalances.items[0].balance).toBeDefined();
    expect(withUpdatedBalances.items[1].balance).toBeDefined();
    expect(withUpdatedBalances.items[2].balance).toBeDefined();

    withUpdatedBalances.items.forEach((item) => {
      expectedBalance = expectedBalance + netValue(item.amount, item.type_id);
      expect(item.balance).toBe(expectedBalance);
    });
  });

  test('updateLedgerDataItem', () => {
    const previousLedgerData = JSON.parse(JSON.stringify(ledgerData));
    const newSettledDate = parseDate(previousLedgerData.items[0].settledDate);
    newSettledDate.setHours(newSettledDate.getHours() + 1);
    const updatedItem: PartialLedgerDataItem = {
      guid: previousLedgerData.items[0].guid + ' unknown guid',
      type_id: previousLedgerData.items[0].type_id + 1,
      amount: previousLedgerData.items[0].amount + 1.99,
      label: previousLedgerData.items[0].label + ' new',
      settledDate: newSettledDate.toISOString(),
      paid: !!previousLedgerData.items[0].paid,
    }
    let updatedLedgerData = updateLedgerDataItem(previousLedgerData, updatedItem);
    expect(updatedLedgerData.items[0].guid).toBe(previousLedgerData.items[0].guid);
    expect(updatedLedgerData.items[0].type_id).toBe(previousLedgerData.items[0].type_id);
    expect(updatedLedgerData.items[0].amount).toBe(previousLedgerData.items[0].amount);
    expect(updatedLedgerData.items[0].label).toBe(previousLedgerData.items[0].label);
    expect(updatedLedgerData.items[0].settledDate).toBe(previousLedgerData.items[0].settledDate);
    expect(updatedLedgerData.items[0].paid).toBe(previousLedgerData.items[0].paid);
    
    updatedItem.guid = previousLedgerData.items[0].guid;
    updatedLedgerData = updateLedgerDataItem(previousLedgerData, updatedItem);
    expect(updatedLedgerData.items[0].guid).toBe(previousLedgerData.items[0].guid);
    expect(updatedLedgerData.items[0].type_id).toBe(previousLedgerData.items[0].type_id + 1);
    expect(updatedLedgerData.items[0].amount).toBe(previousLedgerData.items[0].amount + 1.99);
    expect(updatedLedgerData.items[0].label).toBe(previousLedgerData.items[0].label + ' new');
    expect(updatedLedgerData.items[0].settledDate).toBe(newSettledDate.toISOString());
    expect(updatedLedgerData.items[0].paid).toBe(!!previousLedgerData.items[0].paid);
  });
});
