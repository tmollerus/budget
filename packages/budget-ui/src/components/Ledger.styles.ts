import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

export const useStyles = createUseStyles({
  ledger: {
    display: 'flex',
    alignItems: 'stretch',
    overflowY: 'scroll',
    height: '100%',
  },
  ledgerLeft: {
    width: '80px',
    minWidth: '80px',
    backgroundColor: '#f6f7f9',
  },
  ledgerRight: {
    width: '100%',
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
    display: 'inline-flex',
    width: '100%',
    justifyContent: 'center',
  },
  paidHeader: {
    display: 'flex',
    justifyContent: 'space-around',
    textAlign: 'center',
  },
  paidInput: {
    margin: '9px auto',
  },
  expense: {
    textAlign: 'right',
    color: COLORS.expense,
  },
  expenseHeader: {
  },
  expenseInput: {
    width: '100%',
    textAlign: 'right',
  },
  income: {
    textAlign: 'right',
    color: COLORS.income,
  },
  dateHeader: {
    overflowX: 'visible',
  },
  dateInput: {
    fontFamily: 'Asap, Arial, sans-serif',
    padding: '2px 0px',
    border: `1px solid #cccccc`,
    borderRadius: '3px',
  },
  labelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    '& .material-icons': {
      verticalAlign: 'middle',
      fontSize: '16px',
      cursor: 'pointer',
      color: COLORS.icon_default,
    }
  },
  addIcon: {
    marginLeft: '4px',
    fontSize: '15px',
    '& .material-icons:hover': {
      color: COLORS.income,
    }
  },
  balanceHeader: {

  },
  typeSelect: {
    padding: '1px 4px',
    width: '100%',
  },
  label: {
    '& .bp4-table-truncated-text': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '&:hover $deleteIcon': {
        visibility: 'visible',
      }
    },
  },
  labelInput: {
    width: '190px',
    height: '24px',
    margin: '0px',
    padding: '0px 4px',
    border: `1px solid #cccccc`,
    borderRadius: '3px',
  },
  searchInputGroup: {
    display: 'inline-flex',
    maxHeight: '24px',
    backgroundColor: '#ffffff',
    border: `1px solid #cccccc`,
    borderRadius: '3px',
    margin: '0px',
    padding: '0px 4px',
    alignItems: 'center',
  },
  clearIconHidden: {
    '& .material-icons': {
      visibility: 'hidden',
    },
  },
  clearIconVisible: {
    '& .material-icons.show': {
      visibility: 'visible',
    },
  },
  searchInput: {
    width: '190px',
    // height: '24px',
    margin: '0px',
    paddingRight: '20px',
    border: 'none',
    color: COLORS.icon_default,
  },
  button: {
    marginLeft: '6px',
  },
  deleteIcon: {
    visibility: 'hidden',
    color: COLORS.icon_default,
    marginTop: '7px',
    '& .material-icons': {
      fontSize: '16px',
    },
    '&:hover': {
      color: COLORS.expense,
    }
  },
});
