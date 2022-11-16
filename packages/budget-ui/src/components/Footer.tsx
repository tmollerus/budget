import React from 'react';
import { useStyles } from './Footer.styles';

export const Footer = (props: any) => {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();

  return (
    <div className={classes.footer}>
      Version {process.env.REACT_APP_VERSION} deployed on 2021-04-23 at 8:04am. Copyright &copy;2014-{currentYear} Tom
      Mollerus
    </div>
  );
};
