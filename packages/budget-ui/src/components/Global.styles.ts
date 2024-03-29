import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useGlobalStyles = createUseStyles({
  wrapper: {
    backgroundColor: COLORS.mainBackground,
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '20vh',
    alignItems: 'center',
    fontFamily: 'Asap, Helvetica, sans-serif',
    color: COLORS.text,
  },
  dialogWrapper: {
    maxWidth: '300px',
  },
  dialog: {
    backgroundColor: COLORS.white,
    padding: '20px 40px 30px 40px',
    border: `1px solid ${COLORS.silver}`,
    borderRadius: '6px',
    fontSize: '120%',
    textAlign: 'center',
    width: '100%',
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
    whiteSpace: 'nowrap',
    // borderRadius: '4px',
    // '&.bp4-button.bp4-intent-primary': {
    //   backgroundColor: COLORS.income,
    // },
  },
});
