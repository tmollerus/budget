import { Footer } from './Footer';
import { Logo } from './Logo';
import { useStyles } from './Login.styles';
import { useHistory } from 'react-router-dom';
import { getBudgetGuid } from '../utils/api';
import { useBudgetContext } from '../context';
import { BudgetAuthResponse } from '../types';

export const Login = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const { setBudgetGuid, setBudgetYear } = useBudgetContext();

  const login = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const budgetGuid: BudgetAuthResponse = await getBudgetGuid();
    await setBudgetGuid(budgetGuid.budgetGUID);
    const budgetYear = new Date().getFullYear();
    await setBudgetYear(budgetYear);
    // const ledgerData = await getBudgetItems(budgetGuid.budgetGUID, String(budgetYear));
    // await setLedgerData(ledgerData);
    history.push(`/year/${budgetYear}`);
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.dialog}>
        <Logo />

        <p>You must be authenticated in order to access this site.</p>

        <button className={classes.button} onClick={(e) => login(e)}>
          Authenticate
        </button>
      </div>
      <Footer />
    </div>
  );
};
