import { Footer } from './Footer';
import { Logo } from './Logo';
import { useStyles } from './Logout.styles';
import { Link } from 'react-router-dom';
import { APP } from '../constants/app';
import { withOktaAuth } from '@okta/okta-react';
import { useEffect } from 'react';
import { clearSession } from '../utils/session';

const Logout = (props: any) => {
  const classes = useStyles();

  useEffect(() => {
    clearSession();
  }, []);

  return (
    <div className={classes.wrapper}>
      <div className={classes.dialog}>
        <Logo />

        <p>
          You have been logged out from the site. You may <Link to={`${APP.ROUTES.LOGIN}`}>log in</Link> again.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default withOktaAuth(Logout);
