import { Footer } from './Footer';
import { Logo } from './Logo';
import { useGlobalStyles } from './Global.styles';
import { withOktaAuth } from '@okta/okta-react';
import { Button, Intent } from '@blueprintjs/core';

const Login = (props: any) => {
  const globalClasses = useGlobalStyles();

  const login = () => {
    props.oktaAuth.signInWithRedirect();
  };

  return (
    <div className={globalClasses.wrapper}>
      <div className={globalClasses.dialogWrapper}>
        <div className={globalClasses.dialog}>
          <Logo />

          <p>You must be authenticated in order to access this site.</p>

          <Button className={globalClasses.button} onClick={login} intent={Intent.NONE}>
            Authenticate
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default withOktaAuth(Login);
