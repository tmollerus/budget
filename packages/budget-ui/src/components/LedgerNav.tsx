import { useStyles } from './LedgerNav.styles';
import { useBudgetContext } from '../context';
import { getMonthAsName } from '../utils/format';
import { useEffect, useState } from 'react';
import { Icon } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { APP } from '../constants/app';

interface Props {
  scrollToMonth: (target: string, event?: React.MouseEvent<HTMLElement, MouseEvent>) => boolean;
}

export const LedgerNav = (props: Props) => {
  const classes = useStyles();
  const history = useHistory();
  const { budgetYear, setBudgetYear } = useBudgetContext();
  const [ prevBudgetYear, setPrevBudgetYear ] = useState<number>(budgetYear - 1);
  const [ nextBudgetYear, setNextBudgetYear ] = useState<number>(budgetYear + 1);

  useEffect(() => {
    setPrevBudgetYear(budgetYear - 1);
    setNextBudgetYear(budgetYear + 1);
  }, [budgetYear]);

  const scrollToMonth = (event: React.MouseEvent<HTMLElement, MouseEvent>, target: string) => {
    props.scrollToMonth(target, event);
  };

  const isCurrentYear = budgetYear === new Date().getFullYear();

  const getMonthNavFor = (month: number) => {
    return (
      <div key={month} className={classes.month} data-testid={`month${month}`} onClick={(e) => scrollToMonth(e, `month-${month}`)}>
        {getMonthAsName(month)}
      </div>
    );
  };

  const changeBudgetYear = (e: React.MouseEvent, year: number) => {
    e.preventDefault();
    setBudgetYear(year);
    history.push(`${APP.ROUTES.LEDGER}/${year}`);
  };

  return (
    <div className={classes.ledgerNav}>
      <div className={classes.yearNav} data-testid="yearNav">
        <a href={`${APP.ROUTES.LEDGER}/${prevBudgetYear}`} data-testid="yearNavPrev" onClick={(e) => {changeBudgetYear(e, prevBudgetYear)}}><Icon icon="caret-left" /></a>
        <span className={classes.year}>{budgetYear}</span>
        <a href={`${APP.ROUTES.LEDGER}/${nextBudgetYear}`} data-testid="yearNavNext" onClick={(e) => {changeBudgetYear(e, nextBudgetYear)}}><Icon icon="caret-right" /></a>
      </div>
      <div className={classes.monthNav} data-testid="monthNav">
        {isCurrentYear && <span className={classes.todayIndicator} data-test-id="todayIndicator" onClick={(e) => scrollToMonth(e, 'today')} />}
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
    </div>
  );
};
