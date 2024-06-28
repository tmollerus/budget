import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  stats: {
    minHeight: '100vh',
    backgroundColor: COLORS.sidebar,
    backgroundImage: 'linear-gradient(to bottom, #F6F6F6, #EEE)',
    borderLeft: '1px solid #cccccc',
    boxShadow: '0px 5px 5px rgb(0 0 0 / 10%)',
    padding: '1.6em',
    width: '100%',
  },
});
