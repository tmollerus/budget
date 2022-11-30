import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';
import { getDayOfYear } from '../utils/format';

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
  monthNav: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '-webkit-fill-available',
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
  },
  todayIndicator: {
    position: 'absolute',
    width: '100%',
    top: `${(getDayOfYear((new Date()).toISOString()) / 365) * 100}%`,
    height: '1px',
    borderBottom: `1px dashed ${COLORS.icon_default}`,
    cursor: 'pointer',
    '&:hover': {
      borderColor: COLORS.expense,
    },
  }
});
