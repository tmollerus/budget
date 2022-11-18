import { useEffect, useState } from 'react';
import { HotkeysProvider } from '@blueprintjs/core';
import {
  Cell,
  Column,
  ColumnHeaderCell2,
  RenderMode,
  SelectionModes,
  Table2,
} from '@blueprintjs/table';
import { useStyles } from './Ledger.styles';
import { parseDate } from '../utils/date';
import { dollarFormat, getMonthAsName } from '../utils/format';
import { useBudgetContext } from '../context';
import { LedgerData } from '../types';

export const Ledger = (props: any) => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState('');
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
          <input
            className={classes.searchBox}
            name="searchFilter"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </ColumnHeaderCell2>
    );
  };

  return (
    <div className={classes.ledger}>
      <HotkeysProvider>
        <Table2
          numRows={filteredLedgerData.items.length}
          enableRowHeader={false}
          renderMode={RenderMode.NONE}
          columnWidths={[64, null, null, null, null, 40, 300]}
          enableColumnResizing={false}
          selectionModes={SelectionModes.ROWS_ONLY}
        >
          <Column name="Date" cellRenderer={dateRenderer} />
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
  );
};
