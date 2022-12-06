import { useEffect, useState } from 'react';
import { useBudgetContext } from '../context';
import { LedgerData, LedgerDataItem, LedgerTotals, PartialLedgerDataItem } from '../types';
import { dollarFormat } from '../utils/format';
import { getRowClassName, getLedgerItemBalance, getLedgerItemDate, getLedgerItemExpense, getLedgerItemIncome, getLedgerItemPaid, getLedgerItemTransfer, getFirstOfDateClass, getCellClassName, ColumnType, getRowId, getLedgerTotals } from '../utils/table';
import { useStyles } from './Table.styles';
// From https://codepen.io/kijanmaharjan/pen/aOQVXv

interface Props {
  confirmDeletion: (event: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => void;
  addItem: (newEntry: PartialLedgerDataItem) => void;
  editItem: (editedEntry: PartialLedgerDataItem) => void;
}
export const Table = (props: Props) => {
  const classes = useStyles();
  const { budgetYear, ledgerData } = useBudgetContext();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredLedgerData, setFilteredLedgerData] = useState<LedgerData>(Object.assign({}, ledgerData));
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);
  const [ledgerTotals, setLedgerTotals] = useState<LedgerTotals>();

  const [isFirstRenderedYear, setIsFirstRenderedYear] = useState<boolean>(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newSettledDate, setNewSettledDate] = useState<string>(defaultDate.toISOString().split('T')[0]);
  const [newTypeId, setNewTypeId] = useState<number>(2);
  const [newAmount, setNewAmount] = useState<number>();
  const [newPaid, setNewPaid] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');

  const [itemToEdit, setItemToEdit] = useState<number>();
  const [editedItemGuid, setEditedItemGuid] = useState<string>();
  const [editedSettledDate, setEditedSettledDate] = useState<string>();
  const [editedTypeId, setEditedTypeId] = useState<number>();
  const [editedAmount, setEditedAmount] = useState<number>();
  const [editedPaid, setEditedPaid] = useState<boolean>();
  const [editedLabel, setEditedLabel] = useState<string>();

  useEffect(() => {
    defaultDate.setFullYear(budgetYear);
    setNewSettledDate(defaultDate.toISOString().split('T')[0]);
  }, [budgetYear, defaultDate]);

  useEffect(() => {
    const newFilteredLedgerData: LedgerData = { items: [], starting_balance: ledgerData.starting_balance };
    newFilteredLedgerData.items = ledgerData.items.filter((item) => {
      return (
        searchTerm.trim() === '' || item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredLedgerData(newFilteredLedgerData);
    setLedgerTotals(getLedgerTotals(ledgerData.items));
  }, [filteredLedgerData, ledgerData.items, ledgerData.starting_balance, searchTerm]);

  const saveEditedItem = () => {
    setIsAdding(false);
    const editedEntry: PartialLedgerDataItem = {
      guid: editedItemGuid,
      settledDate: editedSettledDate!.replace('Z', ''),
      type_id: editedTypeId!,
      amount: editedAmount!, 
      paid: !!editedPaid,
      label: editedLabel!,
    };
    props.editItem(editedEntry);
    clearItemToEdit();
  };

  const handleRowClick = (index: number) => {
    // if (6 !== 7) { // Don't start the edit action if the delete icon was clicked
      if (!itemToEdit || itemToEdit !== index ) {
        setEditedItemGuid(filteredLedgerData.items[index].guid);
        setEditedSettledDate(filteredLedgerData.items[index].settledDate);
        setEditedTypeId(filteredLedgerData.items[index].type_id);
        setEditedPaid(filteredLedgerData.items[index].paid);
        setEditedAmount(filteredLedgerData.items[index].amount);
        setEditedLabel(filteredLedgerData.items[index].label);
        setItemToEdit(index);
      }
    // }
  };

  const clearItemToEdit = () => {
    setEditedItemGuid(undefined);
    setItemToEdit(undefined);
  };

  const addItem = () => {
    const newEntry: PartialLedgerDataItem = {
      settledDate: newSettledDate,
      type_id: newTypeId,
      amount: Number(newAmount), 
      paid: !!newPaid,
      label: newLabel,
    };
    props.addItem(newEntry);
    clearAddItem();
  };

  const clearAddItem = () => {
    clearItemToEdit();
    setIsAdding(!isAdding);
    setNewTypeId(2);
    setNewAmount(undefined);
    setNewPaid(false);
    setNewLabel('');
  };

  const getRows = (items: Array<LedgerDataItem>) => {
    return items.map((item: LedgerDataItem, index: number) => {
      const rowClassName = getRowClassName(index, classes.evenRow, [classes.tableRow]);
      const previousSettledDate = index > 0 ? items[index - 1].settledDate : '';
      const dateClassName = getFirstOfDateClass(item.settledDate, previousSettledDate, classes.firstOfDate, classes.notFirstOfDate);

      return (
        <div id={getRowId(item.settledDate, previousSettledDate)} className={rowClassName} key={item.guid} onClick={() => handleRowClick(index)}>
          <div className={getCellClassName(item, ColumnType.DATE, [dateClassName, classes.tableRowItem])} data-header="Date">{itemToEdit === index
            ? <input className={classes.dateInput} type="date" name="settledDate" defaultValue={editedSettledDate!.split('T')[0]} onChange={(e) => setEditedSettledDate(e.target.value)} />
            : getLedgerItemDate(item.settledDate)
          }</div>
          <div className={getCellClassName(item, ColumnType.INCOME, [dateClassName, classes.income, classes.tableRowItem])} data-header="Income">{ itemToEdit !== index ? getLedgerItemIncome(item) : null }</div>
          <div className={getCellClassName(item, ColumnType.TRANSFER, [dateClassName, classes.income, classes.tableRowItem])} data-header="Transfer">{ itemToEdit !== index ? getLedgerItemTransfer(item) : null }</div>
          <div className={getCellClassName(item, ColumnType.BALANCE, [dateClassName, classes.income, classes.tableRowItem])} data-header="Balance">{itemToEdit === index
            ? <select
              className={classes.typeSelect}
              name="type_id"
              defaultValue={editedTypeId}
              onChange={(e) => setEditedTypeId(Number(e.target.options[e.target.selectedIndex].value))}
            >
              <option value="1">Income</option>
              <option value="2">Expense</option>
              <option value="3">Transfer</option>
            </select>
            : getLedgerItemBalance(item.balance) 
          }</div>
          <div className={getCellClassName(item, ColumnType.EXPENSE, [dateClassName, classes.expense, classes.tableRowItem])} data-header="Expense">{itemToEdit === index
            ? <input
              type="number"
              step=".01"
              min="0"
              className={classes.expenseInput}
              name="amount"
              value={editedAmount}
              placeholder="0.00"
              onChange={(e) => setEditedAmount(Number(e.target.value))}
            />
            : getLedgerItemExpense(item)
          }</div>
          <div className={getCellClassName(item, ColumnType.PAID, [dateClassName, classes.tableRowItem])} data-header="Paid">{itemToEdit === index
            ? <input
              type="checkbox"
              className={classes.paidInput}
              name="paid"
              checked={!!editedPaid}
              onChange={(e) => setEditedPaid(!!e.target.checked)}
            />
            : getLedgerItemPaid(item.paid) 
          }</div>
          <div className={getCellClassName(item, ColumnType.LABEL, [dateClassName, classes.tableRowItem])} data-header="Label"> {itemToEdit === index
            ? <span className={classes.addInputGroup}>
                <input
                  className={classes.labelInput}
                  name="label"
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  placeholder="Description"
                />
                <button className={classes.button} onClick={() => saveEditedItem()}>Save</button>
                <button className={classes.button} onClick={clearItemToEdit}>Cancel</button>
              </span>
            : item.label
          }</div>
          <div className={getCellClassName(item, ColumnType.ADD_OR_REMOVE, [dateClassName, classes.tableRowItem])} data-header="Delete">
            <span className={classes.deleteIcon}>
              <span className="material-icons md-18" title="Delete this item" onClick={(e) => props.confirmDeletion(e, index)}>
                cancel
              </span>
            </span>
          </div>
        </div>
      );
    });
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className={searchTerm.length ? classes.clearIconVisible : classes.clearIconHidden}>
                <span className="material-icons md-18" onClick={() => setSearchTerm('')}>
                  cancel
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className={classes.tableRowItem}>
          <span className={classes.addIcon}>
            <span className="material-icons md-18" title="Add a new item" onClick={() => { clearItemToEdit(); setIsAdding(!isAdding)}}>
              add_circle
            </span>
          </span>
        </div>
      </div>
      { isAdding && <div className={[classes.tableRow, classes.tableHeader].join(' ')}>
        <div className={classes.tableRowItem}>
          <input className={classes.dateInput} type="date" name="settledDate" defaultValue={newSettledDate} onChange={(e) => setNewSettledDate(e.target.value)} />
        </div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}>
          <select
            className={classes.typeSelect}
            name="type_id"
            defaultValue={newTypeId}
            onChange={(e) => setNewTypeId(Number(e.target.options[e.target.selectedIndex].value))}
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
            />
            <button className={classes.button} onClick={addItem}>Save</button>
            <button className={classes.button} onClick={clearAddItem}>Cancel</button>
          </div>
        </div>
        <div className={classes.tableRowItem}></div>
      </div> }
      <div className={classes.rowCollection}>
        { getRows(filteredLedgerData.items) }
      </div>
      <div className={[classes.tableRow, classes.tableFooter].join(' ')}>
        <div className={classes.tableRowItem}>Totals:</div>
        <div className={classes.tableRowItem}>{ledgerTotals ? dollarFormat(ledgerTotals.totalIncome) : null}</div>
        <div className={classes.tableRowItem}>{ledgerTotals ? dollarFormat(ledgerTotals.totalTransfers) : null}</div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}>{ledgerTotals ? dollarFormat(ledgerTotals.totalExpenses) : null}</div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
      </div>
    </div>
  );
};
