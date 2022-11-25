import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useGlobalStyles = createUseStyles({
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
  dialogWrapper: {
    maxWidth: '300px',
  },
  dialog: {
    backgroundColor: COLORS.dialog,
    padding: '20px 40px 30px 40px',
    border: '1px solid #aaaaaa',
    borderRadius: '6px',
    fontSize: '120%',
    textAlign: 'center',
    width: '100%',
    minHeight: '30vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    '& p': {
      padding: '36px 0px',
    }
  },
  button: {
    // width: '100%',
    padding: '8px 32px',
    // borderRadius: '4px',
    // '&.bp4-button.bp4-intent-primary': {
    //   backgroundColor: COLORS.income,
    // },
  },
});
