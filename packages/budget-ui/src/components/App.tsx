import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { LoginCallback, SecureRoute, Security } from '@okta/okta-react';
import { BrowserRouter as Router, Redirect, Route, Switch, useHistory, withRouter } from 'react-router-dom';
import { APP } from '../constants/app';
import { OKTA } from '../constants/okta';
import { BudgetContextProvider } from '../context';
import Budget from './Budget';
import Login from './Login';
import Logout from './Logout';

 const AppWithoutRouter = () => {
  const history = useHistory();
  const currentYear = (new Date()).getFullYear();

  const oktaAuth = new OktaAuth({
    issuer: `${OKTA.ORG_URL}/oauth2/default`,
    clientId: OKTA.CLIENT_ID,
    redirectUri: window.location.origin + '/implicit/callback',
    pkce: false,
  });

  const customAuthHandler = (oktaAuth: OktaAuth) => {
    history.push(APP.ROUTES.LOGIN);
  };
  
  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    if (originalUri?.includes(APP.ROUTES.LOGOUT)) {
      originalUri = '/';
    }
    history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <BudgetContextProvider>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri} onAuthRequired={customAuthHandler}>
        <Switch>
          <Route path={APP.ROUTES.LOGIN} exact={true} component={Login} />
          <SecureRoute path={APP.ROUTES.LOGOUT} exact={true} component={Logout} />
          <Route path={APP.ROUTES.CALLBACK} component={LoginCallback} />
          <SecureRoute path={`${APP.ROUTES.LEDGER}/:year`} exact={true} component={Budget} />
          <SecureRoute
            path="/"
            exact={true}
            render={() => <Redirect to={`${APP.ROUTES.LEDGER}/${currentYear}`} />}
          />
        </Switch>
      </Security>
    </BudgetContextProvider>
  );
};

const AppWithRouterAccess = withRouter(AppWithoutRouter);

export const App = () => {
  return (
    <Router>
      <AppWithRouterAccess />
    </Router>
  );
}
