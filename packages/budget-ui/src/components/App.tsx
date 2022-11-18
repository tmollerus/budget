import { BudgetContextProvider } from '../context';
import Budget from './Budget';

export const App = () => {
  return (
    <BudgetContextProvider>
      <Budget />
    </BudgetContextProvider>
  );
};
