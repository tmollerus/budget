import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
  },
  message: {
    display: 'block',
    color: COLORS.mediumGrey,
  },
});
