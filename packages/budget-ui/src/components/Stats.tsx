import { BalanceChart } from './BalanceChart';
import { useStyles } from './Stats.styles';
import { StatTable } from './StatTable';
import { useBudgetContext } from '../context';

export const Stats = (props: any) => {
  const classes = useStyles();
  const { ledgerData } = useBudgetContext();

  return (
    <div className={classes.stats}>
      <StatTable />
      {ledgerData.items && <BalanceChart />}
    </div>
  );
};
