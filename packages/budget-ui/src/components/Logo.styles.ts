import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  appName: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
  },
  logo: {
    height: '40px',
    paddingRight: '4px',
    pointerEvents: 'none',
  },
  name: {
    display: 'inline',
    margin: '2px 0px',
    padding: 0,
    fontSize: '30px',
    fontWeight: 700,
    color: COLORS.logo,
  },
});
