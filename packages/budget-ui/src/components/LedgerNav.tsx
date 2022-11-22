import { useStyles } from './LedgerNav.styles';
import { useBudgetContext } from '../context';
import { getMonthAsName } from '../utils/format';
import { useState } from 'react';
import { Icon } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';

export const LedgerNav = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
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
    history.push(`/year/${year}`);
    setPrevBudgetYear(year - 1);
    setNextBudgetYear(year + 1);
  };

  return (
    <div className={classes.ledgerNav}>
      <div className={classes.yearNav}>
        <a href={`/year/${prevBudgetYear}`} onClick={(e) => {changeBudgetYear(e, prevBudgetYear)}}><Icon icon="caret-left" /></a>
        <span className={classes.year}>{budgetYear}</span>
        <a href={`/year/${nextBudgetYear}`} onClick={(e) => {changeBudgetYear(e, nextBudgetYear)}}><Icon icon="caret-right" /></a>
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
