import { Spinner } from "@blueprintjs/core";
import { useStyles } from './Loader.styles';

interface Props {
  year: number;
}

export const Loader = (props: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Spinner size={42} data-testid="spinner" />
      <span className={classes.message} data-testid="loadingMessage">
        Loading {props.year} budget...
      </span>
    </div>
  );
};
