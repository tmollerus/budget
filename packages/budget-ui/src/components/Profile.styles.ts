import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  profile: {
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
