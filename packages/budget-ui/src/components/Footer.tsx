import { formatDate } from '../utils/format';
import { useStyles } from './Footer.styles';

export const Footer = (props: any) => {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();
  const deployDate = formatDate(process.env.DEPLOY_DATE || new Date(), 'yyyy-mm-dd');
  const deployTime = formatDate(process.env.DEPLOY_DATE || new Date(), 'h:MMtt');

  return (
    <div className={classes.footer}>
      Version {process.env.REACT_APP_VERSION} deployed on {deployDate} at {deployTime}. Copyright
      &copy;2014-
      {currentYear} Tom Mollerus
    </div>
  );
};
