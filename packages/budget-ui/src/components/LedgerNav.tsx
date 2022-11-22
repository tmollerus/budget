import { useStyles } from './LedgerNav.styles';
import { useBudgetContext } from '../context';
import { getMonthAsName } from '../utils/format';
import { useState } from 'react';

export const LedgerNav = (props: any) => {
  const classes = useStyles();
  const { budgetYear, setBudgetYear } = useBudgetContext();
  const [ prevBudgetYear, setPrevBudgetYear ] = useState<number>(budgetYear - 1);
  const [ nextBudgetYear, setNextBudgetYear ] = useState<number>(budgetYear + 1);

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

  const changeBudgetYear = (e: React.MouseEvent, year: number) => {
    e.preventDefault();
    setBudgetYear(year);
    setPrevBudgetYear(year - 1);
    setNextBudgetYear(year + 1);
  };

  return (
    <div className={classes.ledgerNav}>
      <div className={classes.year}>
        <a href={`/year/${prevBudgetYear}`} onClick={(e) => {changeBudgetYear(e, prevBudgetYear)}}>&lt;</a>
        {budgetYear}
        <a href={`/year/${nextBudgetYear}`} onClick={(e) => {changeBudgetYear(e, nextBudgetYear)}}>&gt;</a>
      </div>
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
