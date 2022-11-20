import { useStyles } from './LedgerNav.styles';
import { useBudgetContext } from '../context';
import { getMonthAsName } from '../utils/format';

export const LedgerNav = (props: any) => {
  const classes = useStyles();
  const { budgetYear } = useBudgetContext();

  const scrollToMonth = (month: number) => {
    props.scrollToMonth(month);
  };

  const getMonthNavFor = (month: number) => {
    return (
      <div key={month} className={classes.month} onClick={() => scrollToMonth(month)}>
        {getMonthAsName(month)}
      </div>
    );
  };

  return (
    <div className={classes.ledgerNav}>
      <div className={classes.year}>&lt; {budgetYear} &gt;</div>
      {getMonthNavFor(0)}
      {getMonthNavFor(1)}
      {getMonthNavFor(2)}
      {getMonthNavFor(3)}
      {getMonthNavFor(4)}
      {getMonthNavFor(5)}
      {getMonthNavFor(6)}
      {getMonthNavFor(7)}
      {getMonthNavFor(8)}
      {getMonthNavFor(9)}
      {getMonthNavFor(10)}
      {getMonthNavFor(11)}
    </div>
  );
};
