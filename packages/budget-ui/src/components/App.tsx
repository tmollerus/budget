import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Budget from './Budget';
import { Login } from './Login';
import { Logout } from './Logout';

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login" exact={true} component={Login} />
        <Route path="/logout" exact={true} component={Logout} />
        <Route path="/:year" exact={true} component={Budget} />
        <Route
          path="/"
          exact={true}
          render={() => <Redirect to={'/' + new Date().getFullYear()} />}
        />
      </Switch>
    </Router>
  );
};
