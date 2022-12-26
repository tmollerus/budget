import { BalanceChart } from './BalanceChart';
import { useStyles } from './Stats.styles';
import { StatTable } from './StatTable';

export const Stats = (props: any) => {
  const classes = useStyles();

  return (
    <div className={classes.stats}>
      <StatTable />
      <BalanceChart />
    </div>
  );
};
