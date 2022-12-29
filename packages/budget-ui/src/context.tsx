import { createContext, FC, useContext, useState } from 'react';
import { BudgetContextType, BudgetProviderProps, LedgerData } from './types';

const BudgetContextDefaults: BudgetContextType = {
  budgetYear: new Date().getFullYear(),
  setBudgetYear: () => {
    throw new Error('Function not implemented!');
  },
  budgetGuid: '',
  setBudgetGuid: () => {
    throw new Error('Function not implemented!');
  },
  ledgerData: { items: []},
  setLedgerData: () => {
    throw new Error('Function not implemented!');
  },
};

const BudgetContext = createContext<BudgetContextType>(BudgetContextDefaults);

export const useBudgetContext = () => {
  return useContext(BudgetContext);
};

export const BudgetContextProvider: FC<BudgetProviderProps> = ({ children }) => {
  const [budgetYear, setBudgetYear] = useState<number>(BudgetContextDefaults.budgetYear);
  const [budgetGuid, setBudgetGuid] = useState<string>(BudgetContextDefaults.budgetGuid);
  const [ledgerData, setLedgerData] = useState<LedgerData>(BudgetContextDefaults.ledgerData);

  const contextValue = {
    budgetYear,
    setBudgetYear,
    budgetGuid,
    setBudgetGuid,
    ledgerData,
    setLedgerData,
  };

  return <BudgetContext.Provider value={contextValue}>{children}</BudgetContext.Provider>;
};
