import { BalanceChart } from './BalanceChart';
import { PieChart } from './PieChart';
import { useStyles } from './Stats.styles';
import { StatTable } from './StatTable';

export const Stats = (props: any) => {
  const classes = useStyles();

  return (
    <div className={classes.stats}>
      <StatTable />
      <BalanceChart />
      <PieChart />
    </div>
  );
};
