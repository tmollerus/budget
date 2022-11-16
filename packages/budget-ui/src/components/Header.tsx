import React from 'react';
import { Icon } from '@blueprintjs/core';
import { useStyles } from './Header.styles';

const Header = (props: any) => {
  const classes = useStyles();

  return (
    <header className={classes.header}>
      <div className={classes.appName}>
        <img src="/img/icon.16f0c995.png" className={classes.logo} alt="" />
        <h1 className={classes.name}>Budget</h1>
      </div>
      <div className={classes.user}>
        <img
          className={classes.userImage}
          src="https://www.gravatar.com/avatar/55f7bb536b98e6ab22ac97420f1089ed"
          alt="Tom Mollerus"
        />
        <div className={classes.userStatus}>
          Logged in as:
          <br />
          <span className={classes.userName}>Tom Mollerus</span>
          <a className={classes.logout} href="/logout">
            <Icon icon="log-out" size={12} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
