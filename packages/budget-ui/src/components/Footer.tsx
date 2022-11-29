import { formatDate } from '../utils/format';
import { useStyles } from './Footer.styles';

export const Footer = () => {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();
  const deployDate = process.env.DEPLOY_DATE || formatDate(new Date(), 'yyyy-mm-dd');
  const deployTime = process.env.DEPLOY_TIME || formatDate(new Date(), 'h:MMtt');

  return (
    <div className={classes.footer}>
      Version {process.env.REACT_APP_VERSION} deployed on {deployDate} at {deployTime}. Copyright
      &copy;2014-
      {currentYear} Tom Mollerus
    </div>
  );
};
