import { Spinner } from "@blueprintjs/core";
import { useStyles } from './Loader.styles';

interface Props {
  year: number;
}

export const Loader = (props: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Spinner size={42} />
      <span className={classes.message}>Loading {props.year} budget...</span>
    </div>
  );
};
