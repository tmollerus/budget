import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  ledgerNav: {
    display: 'flex',
    flexDirection: 'column',
    height: '-webkit-fill-available',
    textAlign: 'center',
  },
  yearNav: {
    flexBasis: 'auto',
    lineHeight: '30px',
    fontSize: '14px',
    fontWeight: '700',
    '& a': {
      color: COLORS.text,
    },
  },
  year: {
    padding: '0px 1px',
  },
  month: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: '1',
    '&:hover': {
      backgroundColor: COLORS.sidebar,
    },
    cursor: 'pointer',
  }
});
