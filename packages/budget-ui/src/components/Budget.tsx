import Header from './Header';
import { useStyles } from './Budget.styles';
import { Ledger } from './Ledger';
import { Footer } from './Footer';
import { Stats } from './Stats';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useBudgetContext } from '../context';
import { BudgetUrlParams } from '../types';

function Budget() {
  const classes = useStyles();
  let { year: yearUrlParam } = useParams<BudgetUrlParams>();
  const { budgetYear, setBudgetYear } = useBudgetContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (Number(yearUrlParam) !== budgetYear) {
      setBudgetYear(Number(yearUrlParam));
    }
  }, [yearUrlParam]);

  const getSidebarClasses = (): string => {
    return isSidebarOpen
      ? [classes.sidebar, 'open'].join(' ')
      : classes.sidebar;
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.body}>
        <Header />
        <Ledger />
        <Footer />
      </div>
      <div className={getSidebarClasses()}>
        <Stats />
        <div className={classes.statsHandle} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>Statistics</div>
      </div>
    </div>
  );
}

export default Budget;
