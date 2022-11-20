import { useEffect, useState } from 'react';
import { HotkeysProvider } from '@blueprintjs/core';
import {
  Cell,
  Column,
  ColumnHeaderCell2,
  Region,
  RenderMode,
  SelectionModes,
  Table2,
} from '@blueprintjs/table';
import { useStyles } from './Ledger.styles';
import { parseDate } from '../utils/date';
import { dollarFormat, getMonthAsName } from '../utils/format';
import { useBudgetContext } from '../context';
import { LedgerData } from '../types';
import { LedgerNav } from './LedgerNav';
import { getRegions } from '../utils/table';

export const Ledger = (props: any) => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  let tableInstance: Table2;
  const regionBoundaries: Array<number> = [];
  let regions: Array<Region> = [];

  const { budgetYear, ledgerData } = useBudgetContext();
  let filteredLedgerData: LedgerData = Object.assign({}, ledgerData);

  useEffect(() => {
    window.document.title = `${budgetYear} Budget`;
  }, [budgetYear]);

  useEffect(() => {
    filteredLedgerData.items = ledgerData.items.filter((item) => {
      return (
        searchFilter.trim() === '' || item.label.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
    regions = getRegions(filteredLedgerData.items);
  }, [searchFilter]);

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
    const settledDate = parseDate(
      filteredLedgerData.items[index]?.settledDate || filteredLedgerData.items[index]?.dateCreated,
    );
    return (
      <Cell className={getCellClassName(index, [classes.date])}>{`${getMonthAsName(
        settledDate.getMonth(),
      )}. ${settledDate.getDate()}`}</Cell>
    );
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
    const amount =
      filteredLedgerData.items[index].type_id === 1
        ? dollarFormat(filteredLedgerData.items[index]?.amount)
        : '';
    return <Cell className={getCellClassName(index, [classes.income])}>{amount}</Cell>;
  };
  const transferRenderer = (index: number) => {
    const amount =
      filteredLedgerData.items[index].type_id === 3
        ? dollarFormat(filteredLedgerData.items[index]?.amount)
        : '';
    return <Cell className={getCellClassName(index, [classes.income])}>{amount}</Cell>;
  };
  const expenseRenderer = (index: number) => {
    const amount =
      filteredLedgerData.items[index].type_id === 2
        ? dollarFormat(filteredLedgerData.items[index]?.amount)
        : '';
    return <Cell className={getCellClassName(index, [classes.expense])}>{amount}</Cell>;
  };
  const balanceRenderer = (index: number) => {
    const balance = filteredLedgerData.items[index]?.balance || 0;
    return (
      <Cell className={getCellClassName(index, [classes.income])}>{dollarFormat(balance)}</Cell>
    );
  };
  const paidRenderer = (index: number) => {
    const paid = (filteredLedgerData.items[index]?.paid && <span>✓</span>) || '';
    return <Cell className={getCellClassName(index, [classes.paid])}>{paid}</Cell>;
  };
  const memoRenderer = (index: number) => {
    return (
      <Cell className={getCellClassName(index)}>{filteredLedgerData.items[index]?.label}</Cell>
    );
  };
  const memoHeaderRenderer = () => {
    return (
      <ColumnHeaderCell2>
        <div className={classes.memoHeader}>
          <div>Memo</div>
          <div>
            <input
              className={classes.searchInput}
              name="searchFilter"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
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

  const refHandlers = {
    table: (ref: Table2) => (tableInstance = ref),
  };

  const scrollToMonth = (month: number) => {
    tableInstance.scrollToRegion(regions[month]);
  };

  return (
    <div className={classes.ledger}>
      <div className={classes.ledgerLeft}>
        <LedgerNav scrollToMonth={scrollToMonth} />
      </div>
      <div className={classes.ledgerRight}>
        <HotkeysProvider>
          <Table2
            numRows={filteredLedgerData.items.length}
            enableRowHeader={false}
            renderMode={RenderMode.NONE}
            columnWidths={[64, 80, 80, 100, 80, 40, 340]}
            enableColumnResizing={false}
            selectionModes={SelectionModes.ROWS_AND_CELLS}
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
              name="Memo"
              cellRenderer={memoRenderer}
              columnHeaderCellRenderer={memoHeaderRenderer}
            />
          </Table2>
        </HotkeysProvider>
      </div>
    </div>
  );
};
