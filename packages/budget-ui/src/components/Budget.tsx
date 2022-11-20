import React from 'react';
import Header from './Header';
import { useStyles } from './Budget.styles';
import { Ledger } from './Ledger';
import { Footer } from './Footer';
import { Stats } from './Stats';
import { BudgetContextProvider } from '../context';

function Budget() {
  const classes = useStyles();

  return (
    <BudgetContextProvider>
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
    </BudgetContextProvider>
  );
}

export default Budget;
