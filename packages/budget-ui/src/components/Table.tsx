import { ReactNode, useEffect, useState } from 'react';
import { useBudgetContext } from '../context';
import {
  LedgerData,
  ExtendedLedgerDataItem,
  LedgerTotals,
  PartialLedgerDataItem,
  LedgerDataItem,
} from '../types';
import { parseDate, setToLocalTimezone } from '../utils/date';
import { dollarFormat, formatDate } from '../utils/format';
import {
  getRowClassName,
  getLedgerItemBalance,
  getLedgerItemDate,
  getLedgerItemExpense,
  getLedgerItemIncome,
  getLedgerItemPaid,
  getLedgerItemTransfer,
  getFirstOfDateClass,
  getCellClassName,
  ColumnType,
  getRowId,
  getLedgerTotals,
} from '../utils/table';
import { Loader } from './Loader';
import { useStyles } from './Table.styles';
import { getLedgerDataItemByGuid } from '../utils/ledger';
// From https://codepen.io/kijanmaharjan/pen/aOQVXv

interface Props {
  confirmDeletion: (event: React.MouseEvent<HTMLElement, MouseEvent>, item: LedgerDataItem) => void;
  addItem: (newEntry: PartialLedgerDataItem) => Promise<boolean>;
  editItem: (editedEntry: PartialLedgerDataItem, originalEntry?: LedgerDataItem) => void;
  copyItems: (fromYear: number, toYear: number) => void;
  scrollToMonth: (month: string, event?: React.MouseEvent<HTMLElement, MouseEvent>) => boolean;
  isLoading: boolean;
}

export const Table = (props: Props) => {
  const classes = useStyles();
  const { budgetYear, ledgerData } = useBudgetContext();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredLedgerData, setFilteredLedgerData] = useState<LedgerData>(
    JSON.parse(JSON.stringify(ledgerData)),
  );

  const currentDate = new Date();
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);
  const [ledgerTotals, setLedgerTotals] = useState<LedgerTotals>();
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [isAddItemInProgress, setIsAddItemInProgress] = useState(false);
  const [newSettledDate, setNewSettledDate] = useState<string>(
    defaultDate.toISOString().split('T')[0],
  );
  const [newTypeId, setNewTypeId] = useState<number>(2);
  const [newAmount, setNewAmount] = useState<number>();
  const [newPaid, setNewPaid] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');

  const [itemToEdit, setItemToEdit] = useState<LedgerDataItem>();
  const [editedItemGuid, setEditedItemGuid] = useState<string>();
  const [editedSettledDate, setEditedSettledDate] = useState<string>();
  const [editedTypeId, setEditedTypeId] = useState<number>();
  const [editedAmount, setEditedAmount] = useState<number>();
  const [editedPaid, setEditedPaid] = useState<boolean>();
  const [editedLabel, setEditedLabel] = useState<string>();

  useEffect(() => {
    defaultDate.setFullYear(budgetYear);
    setNewSettledDate(defaultDate.toISOString().split('T')[0]);
  }, [budgetYear]);

  useEffect(() => {
    try {
      if (budgetYear !== currentDate.getFullYear()) {
        setHasScrolled(false);
      }
      if (
        !hasScrolled &&
        budgetYear === currentDate.getFullYear() &&
        filteredLedgerData.items.length
      ) {
        if (!props.scrollToMonth('today')) {
          props.scrollToMonth(`month-${currentDate.getMonth()}`);
        }
        setHasScrolled(true);
      }
    } catch (err) {
      console.log(err);
    }
  }, [budgetYear, filteredLedgerData.items]);

  useEffect(() => {
    const newFilteredLedgerData: LedgerData = {
      items: [],
    };
    newFilteredLedgerData.items = ledgerData.items.filter((item) => {
      return (
        searchTerm.trim() === '' || item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredLedgerData(newFilteredLedgerData);
    setLedgerTotals(getLedgerTotals(ledgerData.items));
  }, [ledgerData.items, searchTerm]);

  const saveEditedItem = () => {
    setShowAddItemForm(false);
    const editedEntry: PartialLedgerDataItem = {
      guid: editedItemGuid,
      settledDate: setToLocalTimezone(editedSettledDate!),
      type_id: editedTypeId!,
      amount: editedAmount!,
      paid: !!editedPaid,
      label: editedLabel!,
    };
    props.editItem(editedEntry, getLedgerDataItemByGuid(ledgerData, editedItemGuid!));
    clearItemToEdit();
  };

  const handleRowClick = (e: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
    if (!String(e.target).includes('HTMLSpanElement')) {
      // Don't start the edit action if the delete icon was clicked
      if (!itemToEdit || itemToEdit !== filteredLedgerData.items[index]) {
        setEditedItemGuid(filteredLedgerData.items[index].guid);
        setEditedSettledDate(filteredLedgerData.items[index].settledDate);
        setEditedTypeId(filteredLedgerData.items[index].type_id);
        setEditedPaid(filteredLedgerData.items[index].paid);
        setEditedAmount(filteredLedgerData.items[index].amount);
        setEditedLabel(filteredLedgerData.items[index].label);
        setItemToEdit(filteredLedgerData.items[index]);
      }
    }
  };

  const clearItemToEdit = () => {
    setEditedItemGuid(undefined);
    setItemToEdit(undefined);
  };

  const addItem = async () => {
    setIsAddItemInProgress(true);
    const newEntry: PartialLedgerDataItem = {
      settledDate: setToLocalTimezone(newSettledDate),
      type_id: newTypeId,
      amount: Number(newAmount),
      paid: !!newPaid,
      label: newLabel,
    };
    const isAddSuccessful = await props.addItem(newEntry);
    if (isAddSuccessful) {
      clearAddItem();
    }
    setIsAddItemInProgress(false);
  };

  const clearAddItem = () => {
    clearItemToEdit();
    setShowAddItemForm(!showAddItemForm);
    setNewTypeId(2);
    setNewAmount(undefined);
    setNewPaid(false);
    setNewLabel('');
  };

  const getLabelsDataList = (items: Array<LedgerDataItem>): Array<ReactNode> => {
    const result: Array<ReactNode> = [];
    const entryLabels: Array<string> = [];

    items.forEach((item) => {
      if (!entryLabels.includes(item.label)) {
        entryLabels.push(item.label);
        result.push(<option key={item.guid} value={item.label} />);
      }
    });

    return result;
  };

  const getRows = (items: Array<ExtendedLedgerDataItem>, year: number) => {
    const rows = items.map((item: ExtendedLedgerDataItem, index: number) => {
      const rowClassName = getRowClassName(index, classes.evenRow, [classes.tableRow]);
      const previousSettledDate = index > 0 ? items[index - 1].settledDate : '';
      const dateClassName = getFirstOfDateClass(
        item.settledDate,
        previousSettledDate,
        classes.firstOfDate,
        classes.notFirstOfDate,
      );

      return (
        <div
          id={getRowId(item.settledDate, previousSettledDate)}
          className={rowClassName}
          key={item.guid}
          onClick={(e) => handleRowClick(e, index)}
        >
          <div
            className={getCellClassName(item, ColumnType.DATE, [
              dateClassName,
              classes.tableRowItem,
            ])}
            data-header="Date"
          >
            {itemToEdit === item ? (
              <input
                className={classes.dateInput}
                type="date"
                name="settledDate"
                defaultValue={formatDate(parseDate(item.settledDate), 'YYYY-MM-DD')}
                onChange={(e) => setEditedSettledDate(e.target.value)}
              />
            ) : (
              getLedgerItemDate(item.settledDate)
            )}
          </div>
          <div
            className={getCellClassName(item, ColumnType.INCOME, [
              dateClassName,
              classes.income,
              classes.tableRowItem,
            ])}
            data-header="Income"
          >
            {itemToEdit !== item ? getLedgerItemIncome(item) : null}
          </div>
          <div
            className={getCellClassName(item, ColumnType.TRANSFER, [
              dateClassName,
              classes.income,
              classes.tableRowItem,
            ])}
            data-header="Transfer"
          >
            {itemToEdit !== item ? getLedgerItemTransfer(item) : null}
          </div>
          <div
            className={getCellClassName(item, ColumnType.BALANCE, [
              dateClassName,
              classes.income,
              classes.tableRowItem,
            ])}
            data-header="Balance"
          >
            {itemToEdit === item ? (
              <select
                className={classes.typeSelect}
                name="type_id"
                defaultValue={editedTypeId}
                onChange={(e) =>
                  setEditedTypeId(Number(e.target.options[e.target.selectedIndex].value))
                }
              >
                <option value="1">Income</option>
                <option value="2">Expense</option>
                <option value="3">Transfer</option>
              </select>
            ) : (
              getLedgerItemBalance(item.balance)
            )}
          </div>
          <div
            className={getCellClassName(item, ColumnType.EXPENSE, [
              dateClassName,
              classes.expense,
              classes.tableRowItem,
            ])}
            data-header="Expense"
          >
            {itemToEdit === item ? (
              <input
                type="number"
                step=".01"
                min="0"
                className={classes.expenseInput}
                name="amount"
                value={editedAmount}
                placeholder="0.00"
                onChange={(e) => setEditedAmount(Number(e.target.value))}
              />
            ) : (
              getLedgerItemExpense(item)
            )}
          </div>
          <div
            className={getCellClassName(item, ColumnType.PAID, [
              dateClassName,
              classes.tableRowItem,
            ])}
            data-header="Paid"
          >
            {itemToEdit === item ? (
              <input
                type="checkbox"
                className={classes.paidInput}
                name="paid"
                checked={!!editedPaid}
                onChange={(e) => setEditedPaid(!!e.target.checked)}
              />
            ) : (
              getLedgerItemPaid(item.paid)
            )}
          </div>
          <div
            className={getCellClassName(item, ColumnType.LABEL, [
              dateClassName,
              classes.tableRowItem,
            ])}
            data-header="Label"
          >
            {' '}
            {itemToEdit === item ? (
              <span className={classes.addInputGroup}>
                <input
                  className={classes.labelInput}
                  name="label"
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  placeholder="Description"
                  list="labels"
                />
                <button className={classes.button} onClick={() => saveEditedItem()}>
                  Save
                </button>
                <button className={classes.button} onClick={clearItemToEdit}>
                  Cancel
                </button>
              </span>
            ) : (
              item.label
            )}
          </div>
          <div
            className={getCellClassName(item, ColumnType.ADD_OR_REMOVE, [
              dateClassName,
              classes.tableRowItem,
            ])}
            data-header="Delete"
          >
            <span className={classes.deleteIcon}>
              <span
                className="material-icons md-18"
                title="Delete this item"
                onClick={(e) => props.confirmDeletion(e, item)}
              >
                cancel
              </span>
            </span>
          </div>
        </div>
      );
    });

    if (
      items.length &&
      Number(items[0]?.next_year_item_count) === 0 &&
      new Date().getFullYear() === parseDate(items[items.length - 1]?.settledDate).getFullYear()
    ) {
      rows.push(
        <div className={[classes.tableRow, classes.tableRowCreate].join(' ')}>
          <div className={classes.tableRowItem}>
            <button
              className={classes.createItems}
              onClick={() => {
                clearItemToEdit();
                setShowAddItemForm(false);
                props.copyItems(year, year + 1);
              }}
            >
              Create budget items for {year + 1}
              <span className="material-icons md-18">add_circle</span>
            </button>
          </div>
        </div>,
      );
    }

    return rows;
  };

  return (
    <div className={classes.table}>
      <div className={[classes.tableRow, classes.tableHeader].join(' ')}>
        <div className={classes.tableRowItem}>Date</div>
        <div className={classes.tableRowItem}>Income</div>
        <div className={classes.tableRowItem}>Transfer</div>
        <div className={classes.tableRowItem}>Balance</div>
        <div className={classes.tableRowItem}>Expense</div>
        <div className={classes.tableRowItem}>Paid</div>
        <div className={classes.tableRowItem}>
          <div className={classes.searchLabel}>Label</div>
          <div className={classes.searchInputGroupContainer}>
            <div className={classes.searchInputGroup}>
              <input
                className={classes.searchInput}
                name="searchTerm"
                value={searchTerm}
                placeholder="Search..."
                list="labels"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span
                className={searchTerm.length ? classes.clearIconVisible : classes.clearIconHidden}
              >
                <span className="material-icons md-18" onClick={() => setSearchTerm('')}>
                  cancel
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className={classes.tableRowItem}>
          {!props.isLoading && (
            <span className={classes.addIcon}>
              <span
                className="material-icons md-18"
                title="Add a new item"
                onClick={() => {
                  clearItemToEdit();
                  setShowAddItemForm(!showAddItemForm);
                }}
              >
                add_circle
              </span>
            </span>
          )}
        </div>
      </div>
      {showAddItemForm && (
        <div className={[classes.tableRow, classes.tableHeader].join(' ')}>
          <div className={classes.tableRowItem}>
            <input
              className={classes.dateInput}
              type="date"
              name="settledDate"
              defaultValue={newSettledDate}
              onChange={(e) => setNewSettledDate(e.target.value)}
              disabled={isAddItemInProgress}
            />
          </div>
          <div className={classes.tableRowItem}></div>
          <div className={classes.tableRowItem}></div>
          <div className={classes.tableRowItem}>
            <select
              className={classes.typeSelect}
              name="type_id"
              defaultValue={newTypeId}
              onChange={(e) => setNewTypeId(Number(e.target.options[e.target.selectedIndex].value))}
              disabled={isAddItemInProgress}
            >
              <option value="1">Income</option>
              <option value="2">Expense</option>
              <option value="3">Transfer</option>
            </select>
          </div>
          <div className={classes.tableRowItem}>
            <input
              type="number"
              step=".01"
              min="0"
              className={classes.expenseInput}
              name="amount"
              value={newAmount}
              placeholder="0.00"
              onChange={(e) => setNewAmount(Number(e.target.value))}
              disabled={isAddItemInProgress}
            />
          </div>
          <div className={classes.tableRowItem}>
            <input
              type="checkbox"
              className={classes.paidInput}
              name="paid"
              value="true"
              checked={newPaid}
              onChange={(e) => setNewPaid(!!e.target.checked)}
              disabled={isAddItemInProgress}
            />
          </div>
          <div className={classes.tableRowItem}>
            <div className={classes.addInputGroup}>
              <input
                className={classes.labelInput}
                name="label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Description"
                list="labels"
                disabled={isAddItemInProgress}
              />
              <button className={classes.button} onClick={addItem} disabled={isAddItemInProgress}>
                Save <Loader size={12} hide={!isAddItemInProgress} />
              </button>
              <button
                className={classes.button}
                onClick={clearAddItem}
                disabled={isAddItemInProgress}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className={classes.tableRowItem}></div>
        </div>
      )}
      <div className={classes.rowCollection}>
        {props.isLoading ? (
          <Loader message={`Loading ${budgetYear} budget`} />
        ) : (
          getRows(filteredLedgerData.items, budgetYear)
        )}
      </div>
      <div className={[classes.tableRow, classes.tableFooter].join(' ')}>
        <div className={classes.tableRowItem}>Totals:</div>
        <div className={classes.tableRowItem}>
          {!props.isLoading && ledgerTotals ? dollarFormat(ledgerTotals.totalIncome) : null}
        </div>
        <div className={classes.tableRowItem}>
          {!props.isLoading && ledgerTotals ? dollarFormat(ledgerTotals.totalTransfers) : null}
        </div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}>
          {!props.isLoading && ledgerTotals ? dollarFormat(ledgerTotals.totalExpenses) : null}
        </div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
      </div>
      <datalist id="labels">{getLabelsDataList(ledgerData.items)}</datalist>
    </div>
  );
};
