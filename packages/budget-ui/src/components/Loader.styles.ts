import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '4px',
  },
  spinner: {
  },
  hidden: {
    display: 'none',
  },
  message: {
    display: 'block',
    color: COLORS.mediumGrey,
  },
});
