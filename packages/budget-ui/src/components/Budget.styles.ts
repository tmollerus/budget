import {createUseStyles} from 'react-jss';
import { BREAKPOINTS, COLORS } from '../constants/theme';

const sidebarDimensions = {
  handleWidth: 32,
  statsWidth: 408,
  borderWidth: 2,
};

export const useStyles = createUseStyles({
  wrapper: {
    backgroundColor: COLORS.mainBackground,
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Asap, Helvetica, sans-serif',
    fontColor: COLORS.text,
  },
  body: {
    height: '100vh',
    width: 'calc(100% - 400px)',
    flexGrow: 1,
    padding: '24px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    [`@media (max-width: ${BREAKPOINTS.small.top}px)`]: {
      padding: '24px 0px',
    },
  },
  sidebar: {
    width: `${sidebarDimensions.statsWidth + sidebarDimensions.handleWidth}px`,
    flexBasis: 'auto',
    minHeight: '100vh',
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    transition: 'margin-right .7s ease-out 0s',
    [`@media (max-width: ${BREAKPOINTS.medium.top}px)`]: {
      marginRight: `-${sidebarDimensions.statsWidth + sidebarDimensions.handleWidth + sidebarDimensions.borderWidth + sidebarDimensions.borderWidth}px`,
      position: 'absolute',
      right: '0',
      display: 'flex',
      flexDirection: 'row-reverse',
      width: `${sidebarDimensions.statsWidth + sidebarDimensions.handleWidth}px`,
      '&.open': {
        marginRight: '0',
      },
    },
  },
  statsHandle: {
    height: 'fit-content',
    backgroundColor: COLORS.sidebar,
    // backgroundImage: 'linear-gradient(to bottom, #F6F6F6, #EEE)',
    borderLeft: '1px solid #cccccc',
    borderRadius: '6px 0px 0px 6px',
    width: `${sidebarDimensions.handleWidth}px`,
    writingMode: 'vertical-rl',
    textOrientation: 'upright',
    padding: `20px ${(sidebarDimensions.handleWidth - 14) / 2}px`,
    marginTop: '120px',
    marginRight: `-${sidebarDimensions.borderWidth}px`,
    cursor: 'pointer',
    display: 'none',
    // transition: 'width .1s ease-out 0s',
    '&:hover': {
      backgroundColor: COLORS.table,
      color: 'black',
    },
    [`@media (max-width: ${BREAKPOINTS.medium.top}px)`]: {
      display: 'inline',
    }
  }
});
