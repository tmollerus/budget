import React from 'react';
import { useStyles } from './Logout.styles';

export const Logout = (props: any) => {
  const classes = useStyles();

  return (
    <header className={classes.header}>
      <div className={classes.appName}>
        <img src="/img/icon.16f0c995.png" className={classes.logo} alt="" />
        <h1 className={classes.name}>Budget</h1>
      </div>
    </header>
  );
};
