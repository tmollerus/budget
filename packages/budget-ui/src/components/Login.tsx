import React from 'react';
import { useStyles } from './Login.styles';

export const Login = (props: any) => {
  const classes = useStyles();
  const login = async () => {
    await props.oktaAuth.signInWithRedirect();
  };

  return (
    <header className={classes.header}>
      <div className={classes.appName}>
        <img src="/img/icon.16f0c995.png" className={classes.logo} alt="" />
        <h1 className={classes.name}>Budget</h1>
      </div>

      <button onClick={login}>Log In</button>
    </header>
  );
};
