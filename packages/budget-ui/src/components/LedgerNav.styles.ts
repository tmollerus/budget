import {createUseStyles} from 'react-jss';
import { COLORS, MONTH_HEIGHT } from '../constants/theme';
import { getDayOfYear } from '../utils/date';

const background = `linear-gradient(to right, ${COLORS.monthBorder} 1px, transparent 1px) 0 0,
  linear-gradient(to right, ${COLORS.monthBorder} 1px, transparent 1px) 0 100%,
  linear-gradient(to left, ${COLORS.monthBorder} 1px, transparent 1px) 100% 0,
  linear-gradient(to left, ${COLORS.monthBorder} 1px, transparent 1px) 100% 100%,
  linear-gradient(to bottom, ${COLORS.monthBorder} 1px, transparent 1px) 0 0,
  linear-gradient(to bottom, ${COLORS.monthBorder} 1px, transparent 1px) 100% 0,
  linear-gradient(to top, ${COLORS.monthBorder} 0px, transparent 0px) 0 100%,
  linear-gradient(to top, ${COLORS.monthBorder} 0px, transparent 0px) 100% 100%`;

export const useStyles = createUseStyles({
  ledgerNav: {
    display: 'flex',
    flexDirection: 'column',
    height: '-webkit-fill-available',
    textAlign: 'center',
  },
  yearNav: {
    flexBasis: 'auto',
    lineHeight: '32px',
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
    // borderTop: `1px solid ${COLORS.monthBorder}`,
    '& $month:nth-of-type(0)': {
      background: 'none !important',
    },
  },
  month: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: '1',
    '&:hover': {
      borderColor: COLORS.monthBorder,
    },
    cursor: 'pointer',
    // borderTop: `.5px dotted ${COLORS.sidebar}`,
    background,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 2px',
      border: `2px dashed transparent`,
  },
  todayIndicator: {
    position: 'absolute',
    display: 'inline-block',
    width: '100%',
    top: `${(getDayOfYear(new Date()) / 365) * 100}%`,
    height: '1px',
    borderBottom: `1px dashed ${COLORS.today}`,
    color: COLORS.today,
    fontSize: '7px',
    textShadow: `0px 0px 2px ${COLORS.ledgerHover}`,
    cursor: 'pointer',
    '&:hover': {
      borderColor: COLORS.expense,
      color: COLORS.expense,
    },
    '&::after': {
      content: '"Today"',
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
    },
    zIndex: 1,
  },
  last: {
    background,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '10px 2px',
  },
  highlightedNav: {
    position: 'absolute',
    width: '100%',
    height: `${MONTH_HEIGHT * 100}%`,
    backgroundColor: COLORS.monthBorder,
    cursor: 'pointer',
    opacity: 0.4,
    border: `1px dashed ${COLORS.mediumGrey}`,
    top: 0,
  }
});
