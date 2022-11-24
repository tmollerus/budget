import { useStyles } from './Header.styles';
import { Logo } from './Logo';
import Profile from './Profile';

const Header = (props: any) => {
  const classes = useStyles();

  return (
    <header className={classes.header}>
      <Logo />
      <Profile />
    </header>
  );
};

export default Header;
