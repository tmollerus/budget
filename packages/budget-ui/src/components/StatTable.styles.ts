import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  header: {
    margin: 0,
    fontSize: '18px',
    lineHeight: '1.1',
    color: COLORS.logo,
  },
  statTable: {
    borderCollapse: 'collapse',
    clear: 'both',
    width: '100%',
    '& th': {
      borderBottom: '1px solid #999999',
      textAlign: 'right',
      '&:first-of-type': {
        textAlign: 'left',
      },
    },
    '& td': {
      borderTop: '1px dotted #999999',
      padding: '4px 0px',
      '&.income, &.expense': {
        textAlign: 'right',
        paddingLeft: '20px',
      },
      '&.income': {
        color: COLORS.income,
      },
      '&.expense': {
        color: COLORS.expense,
      },
    },
  },
  statTableTitle: {
    fontSize: '1rem',
  },
  statTableTh: {
    fontSize: '1rem',
    textAlign: 'left',
  },
  statTableTd: {
    fontSize: '.8rem',
    borderTop: '1px dotted #999999',
    padding: '4px 0px',
  }
});
