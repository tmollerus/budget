import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  wrapper: {
    backgroundColor: '#ebefe3',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignContent: 'stretch',
    fontFamily: 'Asap, Helvetica, sans-serif',
    fontColor: COLORS.text,
  },
  body: {
    height: '100vh',
    flexGrow: 1,
    padding: '24px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sidebar: {
    width: '400px',
    minHeight: '100vh',
    backgroundColor: '#f2f2f2',
    backgroundImage: 'linear-gradient(to bottom, #F6F6F6, #EEE)',
    borderLeft: '1px solid #cccccc',
    boxShadow: '0px 5px 5px rgb(0 0 0 / 10%)',
    padding: '1.6em',
    flexBasis: 'auto',
    alignSelf: 'flex-end',
  }
});
