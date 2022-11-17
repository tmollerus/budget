import React from 'react';
import { BalanceChart } from './BalanceChart';
import { useStyles } from './Stats.styles';
import { StatTable } from './StatTable';
import { getStatistics } from '../utils/statistics';
import { useBudgetContext } from '../context';

export const Stats = (props: any) => {
  const classes = useStyles();
  const { ledgerData } = useBudgetContext();
  const statistics = getStatistics(ledgerData.items, ledgerData.starting_balance);

  return (
    <div className={classes.stats}>
      <StatTable
        today={statistics.today}
        startingBalance={ledgerData.starting_balance}
        expensesLeft={statistics.expensesLeft}
        yearEnd={statistics.yearEnd}
        year={2022}
        deficitDate={statistics.deficitDate}
        incomeTotal={statistics.incomeTotal}
        expenseTotal={statistics.expenseTotal}
        transferTotal={statistics.transferTotal}
        entries={ledgerData.items}
      />
      {ledgerData.items && <BalanceChart />}
    </div>
  );
};
