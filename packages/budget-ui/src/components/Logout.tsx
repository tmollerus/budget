import { Footer } from './Footer';
import { Logo } from './Logo';
import { useStyles } from './Logout.styles';
import { Link } from 'react-router-dom';

export const Logout = () => {
  const classes = useStyles();

  const login = () => {};

  return (
    <div className={classes.wrapper}>
      <div className={classes.dialog}>
        <Logo />

        <p>
          You have been logged out from the site. You may <Link to="/login">log in</Link> again.
        </p>
      </div>
      <Footer />
    </div>
  );
};
