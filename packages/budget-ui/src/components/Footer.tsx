import { formatDate } from '../utils/format';
import { useStyles } from './Footer.styles';

export const Footer = () => {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();
  const deployDate =
    (process.env.REACT_APP_DEPLOY_DATE && new Date(process.env.REACT_APP_DEPLOY_DATE)) ||
    new Date();
  const formattedDeployDate = formatDate(deployDate, 'MMMM Do, YYYY, [at] h:mma');

  return (
    <div className={classes.footer}>
      Version {process.env.REACT_APP_VERSION}{' '}
      {process.env.REACT_APP_DEPLOY_DATE ? 'deployed' : 'built locally'} on {formattedDeployDate}.
      Copyright &copy;2014-{currentYear} Tom Mollerus
    </div>
  );
};
