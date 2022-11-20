import { useStyles } from './Logo.styles';

export const Logo = () => {
  const classes = useStyles();

  return (
    <div className={classes.appName}>
      <img src="/img/icon.16f0c995.png" className={classes.logo} alt="" />
      <h1 className={classes.name}>Budget</h1>
    </div>
  );
};
