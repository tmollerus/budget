import Header from './Header';
import { useStyles } from './Budget.styles';
import { Ledger } from './Ledger';
import { Footer } from './Footer';
import { Stats } from './Stats';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useBudgetContext } from '../context';
import { BudgetUrlParams } from '../types';

function Budget() {
  const classes = useStyles();
  let { year: yearUrlParam } = useParams<BudgetUrlParams>();
  const { budgetYear, setBudgetYear } = useBudgetContext();

  useEffect(() => {
    if (Number(yearUrlParam) !== budgetYear) {
      setBudgetYear(Number(yearUrlParam));
    }
  }, [yearUrlParam]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.body}>
        <Header />
        <Ledger />
        <Footer />
      </div>
      <div className={classes.sidebar}>
        <Stats />
      </div>
    </div>
  );
}

export default Budget;
