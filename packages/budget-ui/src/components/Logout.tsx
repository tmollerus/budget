import { Footer } from './Footer';
import { Logo } from './Logo';
import { useGlobalStyles } from './Global.styles';
import { Link } from 'react-router-dom';
import { APP } from '../constants/app';
import { withOktaAuth } from '@okta/okta-react';
import { useEffect } from 'react';
import { clearSession } from '../utils/session';

const Logout = (props: any) => {
  const globalClasses = useGlobalStyles();

  useEffect(() => {
    clearSession();
  }, []);

  return (
    <div className={globalClasses.wrapper}>
      <div className={globalClasses.dialogWrapper}>
        <div className={globalClasses.dialog}>
          <Logo />

          <p>
            You have been logged out from the site. You may <Link to={`${APP.ROUTES.LOGIN}`}>log in</Link> again.
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default withOktaAuth(Logout);
