import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  wrapper: {
    backgroundColor: '#ebefe3',
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
  },
  sidebar: {
    width: '400px',
    flexBasis: 'auto',
    minHeight: '100vh',
    backgroundColor: COLORS.sidebar,
    backgroundImage: 'linear-gradient(to bottom, #F6F6F6, #EEE)',
    borderLeft: '1px solid #cccccc',
    boxShadow: '0px 5px 5px rgb(0 0 0 / 10%)',
    padding: '1.6em',
    alignSelf: 'flex-end',
  }
});
