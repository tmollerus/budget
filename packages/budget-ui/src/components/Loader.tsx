import { Spinner } from '@blueprintjs/core';
import { useStyles } from './Loader.styles';

interface Props {
  message?: string;
  size?: number;
  hide?: boolean;
}

export const Loader = (props: Props) => {
  const classes = useStyles();
  const classList = [classes.container];
  if (!!props.hide) {
    classList.push(classes.hidden);
  }

  return (
    <div className={classList.join(' ')}>
      <Spinner size={props.size || 42} data-testid="spinner" />
      {props.message && (
        <span className={classes.message} data-testid="loadingMessage">
          {props.message}...
        </span>
      )}
    </div>
  );
};
