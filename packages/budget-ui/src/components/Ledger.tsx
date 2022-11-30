import { createRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HotkeysProvider, Intent } from '@blueprintjs/core';
import {
  Cell,
  Column,
  ColumnHeaderCell2,
  Region,
  RenderMode,
  SelectionModes,
  Table2,
  TableLoadingOption,
} from '@blueprintjs/table';
import { useStyles } from './Ledger.styles';
import { parseDate } from '../utils/date';
import { dollarFormat, getMonthAsName } from '../utils/format';
import { useBudgetContext } from '../context';
import { BudgetAuthResponse, LedgerData, LedgerDataItem, MessageType } from '../types';
import { LedgerNav } from './LedgerNav';
import { getMessage, getRegions, updateItemBalances } from '../utils/ledger';
import { createEntry, deleteEntry, getBudgetGuid, getBudgetItems, updateEntry } from '../utils/api';
import { Dialog } from './Dialog';
import { Toaster } from './Toaster';
import { IFocusedCellCoordinates } from '@blueprintjs/table/lib/esm/common/cellTypes';

export const Ledger = (props: any) => {
  const classes = useStyles();
  const { budgetGuid, setBudgetGuid, budgetYear, ledgerData, setLedgerData } = useBudgetContext();
  let filteredLedgerData: LedgerData = Object.assign({}, ledgerData);
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);
  const [newSettledDate, setNewSettledDate] = useState<string>(defaultDate.toISOString().split('T')[0]);
  const [newTypeId, setNewTypeId] = useState<number>(2);
  const [newAmount, setNewAmount] = useState<number>();
  const [newPaid, setNewPaid] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');

  const [editedSettledDate, setEditedSettledDate] = useState<string>();
  const [editedTypeId, setEditedTypeId] = useState<number>();
  const [editedAmount, setEditedAmount] = useState<number>();
  const [editedPaid, setEditedPaid] = useState<boolean>();
  const [editedLabel, setEditedLabel] = useState<string>();

  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<number>();
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [isBudgetLoading, setIsBudgetLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<number>();
  const [ledgerRightWidth, setLedgerRightWidth] = useState(0);
  let ledgerRightInstance = createRef<HTMLDivElement>();
  let tableInstance: Table2;
  let regions: React.MutableRefObject<Array<Region>> = useRef<Array<Region>>([]);

  useEffect(() => {
    async function checkBudgetGuid() {
      if (!budgetGuid) {
        const budgetAuthResponse: BudgetAuthResponse = await getBudgetGuid();
        setBudgetGuid(budgetAuthResponse.budgetGUID);
      }
    }
    checkBudgetGuid();
  });

  const reloadLedgerData = useCallback(async () => {
    setItemToEdit(undefined);
    const newLedgerData = await getBudgetItems(budgetGuid, String(budgetYear));
    newLedgerData.items = updateItemBalances(newLedgerData);
    setLedgerData(newLedgerData);
  }, [budgetGuid, budgetYear, setLedgerData]);

  useEffect(() => {
    setIsBudgetLoading(true);
    reloadLedgerData();
    setIsBudgetLoading(false);
    window.document.title = `${budgetYear} Budget`;
  }, [budgetGuid, budgetYear, reloadLedgerData, setLedgerData]);

  useEffect(() => {
    filteredLedgerData.items = ledgerData.items.filter((item) => {
      return (
        searchTerm.trim() === '' || item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    regions.current = getRegions(filteredLedgerData.items);
  }, [ledgerData.items, searchTerm]);

  const getCellClassName = (index: number, existingClasses?: Array<string>) => {
    const className = index % 2 ? classes.even : undefined;
    const allClasses = existingClasses || [];
    if (className) {
      allClasses.push(className);
    }
    allClasses.push(getFirstOfDateClass(index));

    return allClasses.join(' ');
  };
  const getFirstOfDateClass = (index: number) => {
    const currentDate = filteredLedgerData.items[index]?.settledDate.split('T')[0];
    const previousDate =
      index > 0 ? filteredLedgerData.items[index - 1].settledDate.split('T')[0] : '';

    if (index === 0 || currentDate !== previousDate) {
      return classes.firstOfDate;
    } else {
      return classes.notFirstOfDate;
    }
  };
  const dateRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const settledDate = parseDate(
        filteredLedgerData.items[index]?.settledDate.split('T')[0],
      );
      return (
        <Cell className={getCellClassName(index, [classes.date])} interactive={itemToEdit === index}>
          {itemToEdit === index
            ? <input className={classes.dateInput} type="date" name="settledDate" defaultValue={editedSettledDate!.split('T')[0]} onChange={(e) => setEditedSettledDate(e.target.value)} />
            : `${getMonthAsName(settledDate.getMonth(),)}. ${settledDate.getDate()}`}
        </Cell>
      );
    }
  };
  const dateHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2 className={classes.dateHeader}>
        <div>Date</div>
        {!!isAdding && <input className={classes.dateInput} type="date" name="settledDate" defaultValue={newSettledDate} onChange={(e) => setNewSettledDate(e.target.value)} />}
      </ColumnHeaderCell2>
    );
  };
  const incomeRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const amount =
        filteredLedgerData.items[index].type_id === 1
          ? dollarFormat(filteredLedgerData.items[index].amount)
          : '';
      return (
        <Cell className={getCellClassName(index, [classes.income])} interactive={itemToEdit === index}>
          {amount}
        </Cell>
      );
    }
  };
  const incomeHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2 className={classes.incomeHeader}>
        <div>Income</div>
      </ColumnHeaderCell2>
    );
  };
  const transferRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const amount =
        filteredLedgerData.items[index].type_id === 3
          ? dollarFormat(filteredLedgerData.items[index].amount)
          : '';
      return <Cell className={getCellClassName(index, [classes.income])}>{amount}</Cell>;
    }
  };
  const expenseRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const amount =
        filteredLedgerData.items[index].type_id === 2
          ? dollarFormat(filteredLedgerData.items[index].amount)
          : '';
      return <Cell className={getCellClassName(index, [classes.expense])} interactive={itemToEdit === index}>
        {itemToEdit === index
        ? 
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
        : amount}
      </Cell>;
    }
  };
  const expenseHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2>
        <div className={classes.paidHeader}>
          <div>Expense</div>
        </div>
        {!!isAdding && (
          <span>
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
          </span>
        )}
      </ColumnHeaderCell2>
    );
  };
  const balanceRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const balance = filteredLedgerData.items[index].balance || 0;
      return (
        <Cell className={getCellClassName(index, [classes.income])} interactive={itemToEdit === index}>
          {itemToEdit === index
          ? 
          <select
            className={classes.typeSelect}
            name="type_id"
            defaultValue={editedTypeId}
            onChange={(e) => setEditedTypeId(Number(e.target.options[e.target.selectedIndex].value))}
          >
            <option value="1">Income</option>
            <option value="2">Expense</option>
            <option value="3">Transfer</option>
          </select>
          : dollarFormat(balance)
          }
          </Cell>
      );
    }
  };
  const balanceHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2>
        <div className={classes.paidHeader}>
          <div>Balance</div>
        </div>
        {!!isAdding && (
          <span>
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
          </span>
        )}
      </ColumnHeaderCell2>
    );
  };
  const paidRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const paid = (filteredLedgerData.items[index].paid && <span>✓</span>) || '';
      return <Cell className={getCellClassName(index, [classes.paid])} interactive={itemToEdit === index}>
        {itemToEdit === index
          ? 
          <input
            type="checkbox"
            className={classes.paidInput}
            name="paid"
            checked={!!editedPaid}
            onChange={(e) => setEditedPaid(!!e.target.checked)}
          />
          : paid}
        </Cell>;
    }
  };
  const paidHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2>
        <div className={classes.paidHeader}>
          <div>Paid</div>
        </div>
        {!!isAdding && (
          <span>
            <input
              type="checkbox"
              className={classes.paidInput}
              name="paid"
              value="true"
              checked={newPaid}
              onChange={(e) => setNewPaid(!!e.target.checked)}
            />
          </span>
        )}
      </ColumnHeaderCell2>
    );
  };
  const labelRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      return (
        <Cell className={getCellClassName(index, [classes.label])} interactive={itemToEdit === index}>
          {itemToEdit === index
            ? <span className="labelInputItems">
                <input
                  className={classes.labelInput}
                  name="label"
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  placeholder="Description"
                />
                <button className={classes.button} onClick={() => saveEditedItem(filteredLedgerData.items[index].guid)}>Save</button>
                <button className={classes.button} onClick={clearItemToEdit}>Cancel</button>
              </span>
            : <span>{filteredLedgerData.items[index].label}</span>
          }
        </Cell>
      );
    }
  };
  const labelHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2>
        <div className={classes.labelHeader}>
          <div>Label</div>
          <div>
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
        {!!isAdding && (
          <span>
            <input
              className={classes.labelInput}
              name="label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Description"
            />
            <button className={classes.button} onClick={addItem}>Save</button>
            <button className={classes.button} onClick={clearAddItem}>Cancel</button>
          </span>
        )}
      </ColumnHeaderCell2>
    );
  };
  const deleteRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      return (
        <Cell className={getCellClassName(index, [classes.delete])}>
          <span className={classes.deleteIcon}>
            <span className="material-icons md-18" onClick={() => confirmDeletion(index)}>
              cancel
            </span>
          </span>
        </Cell>
      );
    }
  };
  const deleteHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2>
        <div className={classes.deleteHeader}>
          <div></div>
          <span className={classes.addIcon}>
            <span className="material-icons md-18" onClick={() => { clearItemToEdit(); setIsAdding(!isAdding)}}>
              add_circle
            </span>
          </span>
        </div>
      </ColumnHeaderCell2>
    );
  };

  const getLoadingOptions = (): TableLoadingOption[] => {
    const loadingOptions: TableLoadingOption[] = [];

    if (isBudgetLoading) {
        loadingOptions.push(TableLoadingOption.CELLS);
    }

    return loadingOptions;
  };

  const getColumnWidths = useCallback((): Array<number> => {
    const deleteColWidth = 30;
    const setWidths = [80, 80, 80, 100, 80, 40];
    const labelColWidth = ledgerRightWidth - deleteColWidth - setWidths.reduce((prev, curr) => { return prev + curr});
    setWidths.push(labelColWidth);
    setWidths.push(deleteColWidth);
    return setWidths;
  }, [ledgerRightWidth]);

  useEffect(() => {
    window.addEventListener("resize", getColumnWidths);
  }, [getColumnWidths]);

  useLayoutEffect(() => {
    setLedgerRightWidth(ledgerRightInstance?.current?.offsetWidth || 0);
  }, [ledgerRightInstance]);

  const refHandlers = {
    table: (ref: Table2) => (tableInstance = ref),
  };

  const scrollToMonth = (month: number) => {
    tableInstance.scrollToRegion(regions.current[month]);
  };

  const confirmDeletion = (index: number) => {
    clearItemToEdit();
    setItemToDelete(index);
    setDialogMessage(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[index]));
    openDeleteDialog();
  };

  const deleteItem = async () => {
    setIsDeleteDialogOpen(false);
    if (itemToDelete) {
      await deleteEntry(budgetGuid, ledgerData.items[itemToDelete].guid);
      const deletedItem: LedgerDataItem = ledgerData.items.splice(itemToDelete, 1)[0];
      await reloadLedgerData();
      const message = getMessage(MessageType.ITEM_DELETED, deletedItem);
      Toaster.show({
        message,
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    }
    setItemToDelete(undefined);
  };

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(undefined);
  };

  const addItem = async () => {
    try {
      const newEntry = await createEntry(budgetGuid, {
        settledDate: newSettledDate,
        type_id: newTypeId,
        amount: newAmount, 
        paid: !!newPaid,
        label: newLabel,
      });
      clearAddItem();
      await reloadLedgerData();
      Toaster.show({
        message: getMessage(MessageType.ITEM_ADDED, newEntry),
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    } catch (err) {
      Toaster.show({
        message: `An error occurred while trying to save the new item`,
        intent: Intent.DANGER,
        icon: 'error',
      });
    }
  };

  const clearAddItem = () => {
    clearItemToEdit();
    setIsAdding(!isAdding);
    setNewSettledDate(defaultDate.toISOString().split('T')[0]);
    setNewTypeId(2);
    setNewAmount(undefined);
    setNewPaid(false);
    setNewLabel('');
  };

  const saveEditedItem = async (guid: string) => {
    try {
      const editedEntry = await updateEntry(budgetGuid, {
        guid,
        settledDate: editedSettledDate?.split('T')[0],
        type_id: editedTypeId,
        amount: editedAmount, 
        paid: !!editedPaid,
        label: editedLabel,
      });
      await reloadLedgerData();
      Toaster.show({
        message: getMessage(MessageType.ITEM_EDITED, editedEntry),
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    } catch (err) {
      Toaster.show({
        message: `An error occurred while trying to save the new item`,
        intent: Intent.DANGER,
        icon: 'error',
      });
    }
  };

  const clearItemToEdit = () => {
    setItemToEdit(undefined);
  };

  const handleCellFocus = (cell: IFocusedCellCoordinates) => {
    if (cell.col !== 7) { // Don't start the edit action if the delete icon was clicked
      if (!itemToEdit || itemToEdit !== cell.row ) {
        setEditedSettledDate(filteredLedgerData.items[cell.row].settledDate);
        setEditedTypeId(filteredLedgerData.items[cell.row].type_id);
        setEditedPaid(filteredLedgerData.items[cell.row].paid);
        setEditedAmount(filteredLedgerData.items[cell.row].amount);
        setEditedLabel(filteredLedgerData.items[cell.row].label);
        setItemToEdit(cell.row);
      }
    }
  };

  return (
    <div className={classes.ledger}>
      <div className={classes.ledgerLeft}>
        <LedgerNav scrollToMonth={scrollToMonth} />
      </div>
      <div className={classes.ledgerRight} ref={ledgerRightInstance}>
        <HotkeysProvider>
          <Table2
            numRows={filteredLedgerData.items.length}
            enableRowHeader={false}
            renderMode={RenderMode.NONE}
            columnWidths={getColumnWidths()}
            enableColumnResizing={false}
            enableFocusedCell={true}
            selectionModes={SelectionModes.ROWS_ONLY}
            cellRendererDependencies={[filteredLedgerData,isBudgetLoading,ledgerRightWidth]}
            loadingOptions={getLoadingOptions()}
            onFocusedCell={handleCellFocus}
            ref={refHandlers.table}
          >
            <Column
              name="Date"
              cellRenderer={dateRenderer}
              columnHeaderCellRenderer={dateHeaderRenderer}
            />
            <Column
              name="Income"
              cellRenderer={incomeRenderer}
              columnHeaderCellRenderer={incomeHeaderRenderer}
            />
            <Column name="Transfer" cellRenderer={transferRenderer} />
            <Column name="Balance"
              cellRenderer={balanceRenderer}
              columnHeaderCellRenderer={balanceHeaderRenderer}
            />
            <Column name="Expense"
              cellRenderer={expenseRenderer}
              columnHeaderCellRenderer={expenseHeaderRenderer}
            />
            <Column name="Paid"
              cellRenderer={paidRenderer}
              columnHeaderCellRenderer={paidHeaderRenderer}
            />
            <Column
              name="label"
              cellRenderer={labelRenderer}
              columnHeaderCellRenderer={labelHeaderRenderer}
            />
            <Column name=""
              cellRenderer={deleteRenderer}
              columnHeaderCellRenderer={deleteHeaderRenderer}
            />
          </Table2>
        </HotkeysProvider>
      </div>
      <Dialog
        isOpen={isDeleteDialogOpen && !!itemToDelete}
        title="Confirm deletion"
        onClose={closeDeleteDialog}
        message={dialogMessage}
        cancelLabel="Cancel"
        cancelIntent={Intent.NONE}
        onCancel={closeDeleteDialog}
        actionLabel="Delete"
        actionIntent={Intent.DANGER}
        actionIcon="trash"
        onAction={async () => await deleteItem()}
      />
    </div>
  );
};
