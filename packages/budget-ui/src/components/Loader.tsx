import { Spinner } from "@blueprintjs/core";
import { useStyles } from './Loader.styles';

interface Props {
  message?: string;
  size?: number;
}

export const Loader = (props: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Spinner size={props.size || 42} data-testid="spinner" />
      {props.message && <span className={classes.message} data-testid="loadingMessage">
        {props.message}...
      </span>}
    </div>
  );
};
