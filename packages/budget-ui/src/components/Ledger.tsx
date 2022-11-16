import React, { useEffect } from 'react';
import { HotkeysProvider } from '@blueprintjs/core';
import { Cell, Column, RenderMode, Table2 } from '@blueprintjs/table';
import { useStyles } from './Ledger.styles';
import { parseDate } from '../utils/date';
import { dollarFormat, getMonthAsName } from '../utils/format';
import { netValue } from '../utils/number';
import * as BudgetAPI from '../utils/api';
import { useBudgetContext } from '../context';

export const Ledger = (props: any) => {
  const classes = useStyles();
  const balances: Array<number> = [];
  const { budgetYear, dailyBalances, ledgerData } = useBudgetContext();

  useEffect(() => {
    const getBudgetGuid = async () => {
      return await BudgetAPI.getBudgetGuid();
    };
    getBudgetGuid();
  });

  useEffect(() => {
    window.document.title = `${budgetYear} Budget`;
  }, [budgetYear]);

  useEffect(() => {
    ledgerData.items.forEach((item, index) => {
      balances[index] =
        index === 0
          ? ledgerData.starting_balance
          : balances[index - 1] +
            netValue(ledgerData.items[index].amount, ledgerData.items[index].type_id);
    });
  }, [ledgerData]);

  const getCellClassName = (index: number, existingClasses?: Array<string>) => {
    const className = index % 2 ? classes.even : undefined;
    const allClasses = existingClasses || [];
    if (className) {
      allClasses.push(className);
    }
    allClasses.push(getFirstOfDateClass(index));
    // allClasses.push(getLastOfDateClass(index));

    return allClasses.join(' ');
  };
  const getFirstOfDateClass = (index: number) => {
    const currentDate = ledgerData.items[index].settledDate.split('T')[0];
    const previousDate = index > 0 ? ledgerData.items[index - 1].settledDate.split('T')[0] : '';

    if (index === 0 || currentDate !== previousDate) {
      return classes.firstOfDate;
    } else {
      return classes.date;
    }
  };
  const dateRenderer = (index: number) => {
    const settledDate = parseDate(ledgerData.items[index].settledDate);
    return (
      <Cell className={getCellClassName(index)}>{`${getMonthAsName(
        settledDate.getMonth(),
      )}. ${settledDate.getDate()}`}</Cell>
    );
  };
  const incomeRenderer = (index: number) => {
    const amount =
      ledgerData.items[index].type_id === 1 ? dollarFormat(ledgerData.items[index].amount) : '';
    return <Cell className={getCellClassName(index, [classes.income])}>{amount}</Cell>;
  };
  const transferRenderer = (index: number) => {
    const amount =
      ledgerData.items[index].type_id === 3 ? dollarFormat(ledgerData.items[index].amount) : '';
    return <Cell className={getCellClassName(index, [classes.income])}>{amount}</Cell>;
  };
  const expenseRenderer = (index: number) => {
    const amount =
      ledgerData.items[index].type_id === 2 ? dollarFormat(ledgerData.items[index].amount) : '';
    return <Cell className={getCellClassName(index, [classes.expense])}>{amount}</Cell>;
  };
  const balanceRenderer = (index: number) => {
    const balance = balances[index] || 0;
    return (
      <Cell className={getCellClassName(index, [classes.income])}>{dollarFormat(balance)}</Cell>
    );
  };
  const paidRenderer = (index: number) => {
    const paid = (ledgerData.items[index].paid && <span>✓</span>) || '';
    return <Cell className={getCellClassName(index, [classes.paid])}>{paid}</Cell>;
  };
  const memoRenderer = (index: number) => {
    return <Cell className={getCellClassName(index)}>{ledgerData.items[index].label}</Cell>;
  };

  return (
    <div className={classes.ledger}>
      <HotkeysProvider>
        <Table2
          numRows={ledgerData.items.length}
          enableRowHeader={false}
          renderMode={RenderMode.NONE}
          columnWidths={[64, null, null, null, null, 40, 300]}
          enableColumnResizing={false}
        >
          <Column name="Date" cellRenderer={dateRenderer} />
          <Column name="Income" cellRenderer={incomeRenderer} />
          <Column name="Transfer" cellRenderer={transferRenderer} />
          <Column name="Balance" cellRenderer={balanceRenderer} />
          <Column name="Expense" cellRenderer={expenseRenderer} />
          <Column name="Paid" cellRenderer={paidRenderer} />
          <Column name="Memo" cellRenderer={memoRenderer} />
        </Table2>
      </HotkeysProvider>
      {/* <HotkeysProvider>
        <Table2
          numRows={1}
          enableColumnHeader={false}
          enableRowHeader={false}
          renderMode={RenderMode.NONE}
          columnWidths={[64, null, null, null, null, 40, 300]}
          enableColumnResizing={false}
        >
          <Column name="Date" cellRenderer={dateRenderer} />
          <Column name="Income" cellRenderer={incomeRenderer} />
          <Column name="Transfer" cellRenderer={transferRenderer} />
          <Column name="Balance" cellRenderer={balanceRenderer} />
          <Column name="Expense" cellRenderer={expenseRenderer} />
          <Column name="Paid" cellRenderer={paidRenderer} />
          <Column name="Memo" cellRenderer={memoRenderer} />
        </Table2>
      </HotkeysProvider> */}
    </div>
  );
};
