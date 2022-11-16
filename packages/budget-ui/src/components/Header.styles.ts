import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  header: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  appName: {
    display: 'flex',
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
  user: {
    display: 'flex',
    alignContent: 'center',
  },
  userImage: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    marginRight: '4px',
  },
  userStatus: {
    fontSize: '12px',
  },
  userName: {
    fontSize: '15px',
  },
  logout: {
    marginLeft: '8px',
    verticalAlign: 'text-bottom',
    color: COLORS.text,
  },
});
