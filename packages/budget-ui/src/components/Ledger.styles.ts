import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  ledger: {
    overflowY: 'scroll',
    '& .bp4-table-column-name-text': {
      fontWeight: 'bold',
      padding: '0 4px',
    },
    '& .bp4-table-cell': {
      padding: '0 4px',
      boxShadow: 'none',
      border: 'none',
      borderTop: '1px dotted #cccccc',
      '&$firstOfDate': {
        borderTop: '1px solid #bababa',
      },
    },
  },
  even: {
    backgroundColor: COLORS.ledgerEven,
  },
  firstOfDate: {
    color: 'inherit',
  },
  lastOfDate: {
    borderBottom: 'none',
  },
  date: {
    color: 'transparent',
  },
  paid: {
    textAlign: 'center',
  },
  expense: {
    textAlign: 'right',
    color: COLORS.expense,
  },
  income: {
    textAlign: 'right',
    color: COLORS.income,
  },
});
