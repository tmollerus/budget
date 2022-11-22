import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { BudgetContextProvider } from '../context';
import Budget from './Budget';
import { Login } from './Login';
import { Logout } from './Logout';

export const App = () => {
  return (
    <BudgetContextProvider>
      <Router>
        <Switch>
          <Route path="/login" exact={true} component={Login} />
          <Route path="/logout" exact={true} component={Logout} />
          <Route path="/year/:year" exact={true} component={Budget} />
          <Route
            path="/"
            exact={true}
            render={() => <Redirect to={'/year/' + new Date().getFullYear()} />}
          />
        </Switch>
      </Router>
    </BudgetContextProvider>
  );
};
