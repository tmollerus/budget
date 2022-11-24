import { Footer } from './Footer';
import { Logo } from './Logo';
import { useStyles } from './Login.styles';
import { withOktaAuth } from '@okta/okta-react';

const Login = (props: any) => {
  const classes = useStyles();

  const login = () => {
    props.oktaAuth.signInWithRedirect();
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.dialog}>
        <Logo />

        <p>You must be authenticated in order to access this site.</p>

        <button className={classes.button} onClick={login}>
          Authenticate
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default withOktaAuth(Login);
