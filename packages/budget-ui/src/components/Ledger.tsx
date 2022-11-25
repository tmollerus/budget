import { createRef, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Button, Dialog, HotkeysProvider, Icon, Intent } from '@blueprintjs/core';
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
import { BudgetAuthResponse, LedgerData, LedgerDataItem } from '../types';
import { LedgerNav } from './LedgerNav';
import { getRegions, updateItemBalances } from '../utils/ledger';
import { getBudgetGuid, getBudgetItems } from '../utils/api';
import { Toaster } from './Toaster';

export const Ledger = (props: any) => {
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<number>();
  const [isBudgetLoading, setIsBudgetLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [ledgerRightWidth, setLedgerRightWidth] = useState(0);
  let ledgerRightInstance = createRef<HTMLDivElement>();
  let tableInstance: Table2;
  let regions: Array<Region> = [];

  const { budgetGuid, setBudgetGuid, budgetYear, ledgerData, setLedgerData } = useBudgetContext();
  let filteredLedgerData: LedgerData = Object.assign({}, ledgerData);

  useEffect(() => {
    async function checkBudgetGuid() {
      if (!budgetGuid) {
        const budgetAuthResponse: BudgetAuthResponse = await getBudgetGuid();
        setBudgetGuid(budgetAuthResponse.budgetGUID);
      }
    }
    checkBudgetGuid();
  });

  useEffect(() => {
    async function loadData() {
      const newLedgerData = await getBudgetItems(budgetGuid, String(budgetYear));
      newLedgerData.items = updateItemBalances(newLedgerData);
      setLedgerData(newLedgerData);
    }
    setIsBudgetLoading(true);
    loadData();
    setIsBudgetLoading(false);
    window.document.title = `${budgetYear} Budget`;
  }, [budgetGuid, budgetYear, setLedgerData]);

  useEffect(() => {
    filteredLedgerData.items = ledgerData.items.filter((item) => {
      return (
        searchTerm.trim() === '' || item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    regions = getRegions(filteredLedgerData.items);
  }, [searchTerm]);

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
        <Cell className={getCellClassName(index, [classes.date])}>{`${getMonthAsName(
          settledDate.getMonth(),
        )}. ${settledDate.getDate()}`}</Cell>
      );
    }
  };
  const dateHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2 className={classes.dateHeader}>
        <div>Date</div>
        {!!isAdding && <input className={classes.dateInput} type="date" name="settledDate" />}
      </ColumnHeaderCell2>
    );
  };
  const incomeRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const amount =
        filteredLedgerData.items[index].type_id === 1
          ? dollarFormat(filteredLedgerData.items[index].amount)
          : '';
      return <Cell className={getCellClassName(index, [classes.income])}>{amount}</Cell>;
    }
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
      return <Cell className={getCellClassName(index, [classes.expense])}>{amount}</Cell>;
    }
  };
  const balanceRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const balance = filteredLedgerData.items[index].balance || 5;
      return (
        <Cell className={getCellClassName(index, [classes.income])}>{dollarFormat(balance)}</Cell>
      );
    }
  };
  const paidRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      const paid = (filteredLedgerData.items[index].paid && <span>✓</span>) || '';
      return <Cell className={getCellClassName(index, [classes.paid])}>{paid}</Cell>;
    }
  };
  const labelRenderer = (index: number) => {
    if (filteredLedgerData.items[index]) {
      return (
        <Cell className={getCellClassName(index, [classes.label])}>
          <span>{filteredLedgerData.items[index].label}</span>
          <Icon
            className={classes.delete}
            icon="delete"
            size={12}
            onClick={() => confirmDeletion(index)}
          />
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
            <input
              className={classes.searchInput}
              name="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setIsAdding(!isAdding)}>Add</button>
          </div>
        </div>
        {!!isAdding && (
          <span>
            <input
              className={classes.searchInput}
              name="label"
              value=""
              placeholder="Description"
            />
            <button>Save</button>
          </span>
        )}
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
    const labelWidth = ledgerRightWidth - 444;
    return [64, 80, 80, 100, 80, 40, labelWidth];
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
    tableInstance.scrollToRegion(regions[month]);
  };

  const confirmDeletion = (index: number) => {
    setItemToDelete(index);
    openDeleteDialog();
  };

  const deleteItem = () => {
    setIsDeleteDialogOpen(false);
    if (itemToDelete) {
      const deletedItem: LedgerDataItem = ledgerData.items.splice(itemToDelete, 1)[0];
      setLedgerData(ledgerData);
      Toaster.show({
        message: `Item '${deletedItem.label}' has been deleted`,
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
            selectionModes={SelectionModes.NONE}
            cellRendererDependencies={[filteredLedgerData]}
            loadingOptions={getLoadingOptions()}
            ref={refHandlers.table}
          >
            <Column
              name="Date"
              cellRenderer={dateRenderer}
              columnHeaderCellRenderer={dateHeaderRenderer}
            />
            <Column name="Income" cellRenderer={incomeRenderer} />
            <Column name="Transfer" cellRenderer={transferRenderer} />
            <Column name="Balance" cellRenderer={balanceRenderer} />
            <Column name="Expense" cellRenderer={expenseRenderer} />
            <Column name="Paid" cellRenderer={paidRenderer} />
            <Column
              name="label"
              cellRenderer={labelRenderer}
              columnHeaderCellRenderer={labelHeaderRenderer}
            />
          </Table2>
        </HotkeysProvider>
      </div>
      <Dialog
        isOpen={isDeleteDialogOpen && !!itemToDelete}
        title="Confirm deletion"
        onClose={closeDeleteDialog}
      >
        <div>
          <p>Are you sure you would like to delete this item?</p>
        </div>
        <div>
          <div>
            <Button text="Cancel" intent={Intent.NONE} onClick={closeDeleteDialog} />
            <Button text="Delete" intent={Intent.DANGER} icon="trash" onClick={deleteItem} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
