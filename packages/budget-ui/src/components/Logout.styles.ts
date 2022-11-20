import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  wrapper: {
    backgroundColor: '#ebefe3',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Asap, Helvetica, sans-serif',
    color: COLORS.text,
  },
  dialog: {
    backgroundColor: COLORS.dialog,
    padding: '20px 40px 30px 40px',
    border: '1px solid #aaaaaa',
    borderRadius: '4px',
    fontSize: '120%',
    textAlign: 'center',
    maxWidth: '300px',
    minHeight: '30vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
});
