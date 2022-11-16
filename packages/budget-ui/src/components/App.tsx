import React from 'react';
import Header from './Header';
import { useStyles } from './App.styles';
import { Ledger } from './Ledger';
import { Footer } from './Footer';
import { Stats } from './Stats';
import { BudgetContextProvider } from '../context';

export const App = () => {
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
};
