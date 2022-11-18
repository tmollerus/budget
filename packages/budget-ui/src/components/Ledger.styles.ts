import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  ledger: {
    overflowY: 'scroll',
    '& .bp4-table-column-headers .bp4-table-header': {
      fontWeight: '700',
      padding: '0 4px',
      cursor: 'auto',
    },
    '& .bp4-table-column-name-text': {
      padding: '0',
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
  date: {
    color: 'transparent',
    '&$firstOfDate': {
      color: 'inherit',
    },
  },
  firstOfDate: {
  },
  notFirstOfDate: {
  },
  lastOfDate: {
    borderBottom: 'none',
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
  memoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  searchBox: {
    width: '210px',
    height: '24px',
    margin: '4px 0px',
    border: `1px solid #cccccc`,
    borderRadius: '2px',
  },
});
