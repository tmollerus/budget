import { useEffect, useState } from 'react';
import { useBudgetContext } from '../context';
import { LedgerData, LedgerDataItem, PartialLedgerDataItem } from '../types';
import { getRowClassName, getLedgerItemBalance, getLedgerItemDate, getLedgerItemExpense, getLedgerItemIncome, getLedgerItemPaid, getLedgerItemTransfer, getFirstOfDateClass, getCellClassName, ColumnType, getRowId } from '../utils/table';
import { useStyles } from './Table.styles';
// From https://codepen.io/kijanmaharjan/pen/aOQVXv

interface Props {
  ledgerData: LedgerData;
  confirmDeletion: (index: number) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  addItem: (newEntry: PartialLedgerDataItem) => void;
}
export const Table = (props: Props) => {
  const classes = useStyles();
  const { budgetYear } = useBudgetContext();
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);
  const [itemToEdit, setItemToEdit] = useState<number>();

  const [isAdding, setIsAdding] = useState(false);
  const [newSettledDate, setNewSettledDate] = useState<string>(defaultDate.toISOString().split('T')[0]);
  const [newTypeId, setNewTypeId] = useState<number>(2);
  const [newAmount, setNewAmount] = useState<number>();
  const [newPaid, setNewPaid] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');

  useEffect(() => {
    defaultDate.setFullYear(budgetYear);
    setNewSettledDate(defaultDate.toISOString().split('T')[0]);
  }, [budgetYear, defaultDate, isAdding]);

  const clearItemToEdit = () => { setItemToEdit(undefined); };

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
        <div id={getRowId(item.settledDate, previousSettledDate)} className={rowClassName} key={item.guid}>
          <div className={getCellClassName(item, ColumnType.DATE, [dateClassName, classes.tableRowItem])} data-header="Date">{ getLedgerItemDate(item.settledDate) }</div>
          <div className={getCellClassName(item, ColumnType.INCOME, [dateClassName, classes.income, classes.tableRowItem])} data-header="Income">{ getLedgerItemIncome(item) }</div>
          <div className={getCellClassName(item, ColumnType.TRANSFER, [dateClassName, classes.income, classes.tableRowItem])} data-header="Transfer">{ getLedgerItemTransfer(item) }</div>
          <div className={getCellClassName(item, ColumnType.BALANCE, [dateClassName, classes.income, classes.tableRowItem])} data-header="Balance">{ getLedgerItemBalance(item.balance) }</div>
          <div className={getCellClassName(item, ColumnType.EXPENSE, [dateClassName, classes.expense, classes.tableRowItem])} data-header="Expense">{ getLedgerItemExpense(item) }</div>
          <div className={getCellClassName(item, ColumnType.PAID, [dateClassName, classes.tableRowItem])} data-header="Paid">{ getLedgerItemPaid(item.paid) }</div>
          <div className={getCellClassName(item, ColumnType.BALANCE, [dateClassName, classes.tableRowItem])} data-header="Label">{ item.label }</div>
          <div className={getCellClassName(item, ColumnType.ADD_OR_REMOVE, [dateClassName, classes.tableRowItem])} data-header="Delete">
            <span className={classes.deleteIcon}>
              <span className="material-icons md-18" title="Delete this item" onClick={() => props.confirmDeletion(index)}>
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
          <div>
            <div className={classes.searchInputGroup}>
              <input
                className={classes.searchInput}
                name="searchTerm"
                value={props.searchTerm}
                placeholder="Search..."
                onChange={(e) => props.setSearchTerm(e.target.value)}
              />
              <span className={props.searchTerm.length ? classes.clearIconVisible : classes.clearIconHidden}>
                <span className="material-icons md-18" onClick={() => props.setSearchTerm('')}>
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
        { getRows(props.ledgerData.items) }
      </div>
      <div className={[classes.tableRow, classes.tableFooter].join(' ')}>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}>Total:</div>
        <div className={classes.tableRowItem}>Total:</div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}>Total:</div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
        <div className={classes.tableRowItem}></div>
      </div>
    </div>
  );
};
