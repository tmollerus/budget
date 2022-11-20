import { Footer } from './Footer';
import { Logo } from './Logo';
import { useStyles } from './Login.styles';
import { useHistory } from 'react-router-dom';

export const Login = (props: any) => {
  const classes = useStyles();
  const history = useHistory();

  const login = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    history.push('/');
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
