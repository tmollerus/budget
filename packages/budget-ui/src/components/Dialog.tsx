import { useStyles } from './Dialog.styles';
import { Button, Dialog as BPDialog, IconName, Intent } from '@blueprintjs/core';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: (event: React.SyntheticEvent<HTMLElement, Event>) => void;
  cancelLabel: string;
  cancelIntent: Intent;
  onCancel: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  actionLabel: string;
  actionIntent: Intent;
  actionIcon: IconName;
  onAction: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const Dialog = (props: Props) => {
  const classes = useStyles();

  return (
    <BPDialog
      isOpen={props.isOpen}
      title={props.title}
      onClose={props.onClose}
    >
      <div className={classes.body}>
        <p>{props.message}</p>
      </div>
      <div className={classes.footer}>
        <div className={classes.footerActions}>
          <Button text={props.cancelLabel} intent={props.cancelIntent} onClick={props.onCancel} />
          <Button text={props.actionLabel} intent={props.actionIntent} icon={props.actionIcon} onClick={props.onAction} />
        </div>
      </div>
    </BPDialog>
  );
};
