import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  ledger: {
    display: 'flex',
    alignItems: 'stretch',
    overflowY: 'scroll',
  },
  ledgerLeft: {
    width: '80px',
    minWidth: '80px',
    backgroundColor: '#f6f7f9',
  },
  ledgerRight: {
    '& .bp4-table-column-headers .bp4-table-header': {
      fontWeight: '700',
      padding: '0 4px',
      cursor: 'auto',
      '&:hover': {
        '&::before': {
          backgroundColor: 'transparent',
          pointerEvents: 'none',
        }
      }
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
      cursor: 'pointer',
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
  dateHeader: {
    overflowX: 'visible',
  },
  memoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  memo: {
    '& .bp4-table-truncated-text': {
      display: 'flex',
      justifyContent: 'space-between',
      '&:hover $delete': {
        visibility: 'visible',
      }
    },
  },
  delete: {
    visibility: 'hidden',
      color: COLORS.expense,
  },
  dateInput: {
    fontFamily: 'Asap, Arial, sans-serif',
    padding: '2px 0px',
    border: `1px solid #cccccc`,
    borderRadius: '3px',
    '&:focus': {
      outline: 'none',
    },
  },
  searchInput: {
    width: '190px',
    height: '24px',
    margin: '4px 4px 4px 0px',
    border: `1px solid #cccccc`,
    borderRadius: '3px',
    '&:focus': {
      outline: 'none',
    },
  },
});
