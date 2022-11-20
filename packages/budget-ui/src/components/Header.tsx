import React from 'react';
import { Icon } from '@blueprintjs/core';
import { useStyles } from './Header.styles';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';

const Header = (props: any) => {
  const classes = useStyles();

  return (
    <header className={classes.header}>
      <Logo />
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
          <Link className={classes.logout} to="/logout">
            <Icon icon="log-out" size={12} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
