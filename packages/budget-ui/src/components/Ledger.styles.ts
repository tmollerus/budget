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
      border: 'none !important',
      borderTop: '1px dotted #cccccc !important',
      '&$firstOfDate': {
        borderTop: '1px solid #bababa !important',
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
    '&.bp4-table-cell-interactive': {
      width: '110px !important',
      zIndex: '100',
      height: '18px',
    }
  },
  firstOfDate: {
  },
  notFirstOfDate: {
  },
  lastOfDate: {
    borderBottom: 'none',
  },
  incomeHeader: {
    pointerEvents: 'none',
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
    margin: '4px auto',
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
    fontSize: '12px',
    height: '18px',
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
    fontSize: '12px',
    width: '90px',
    height: '18px',
  },
  labelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  deleteHeader: {
    display: 'flex',
    justifyContent: 'center',
    '& .material-icons': {
      verticalAlign: 'middle',
      fontSize: '16px',
      cursor: 'pointer',
      color: COLORS.icon_default,
    }
  },
  addIcon: {
    fontSize: '16px',
    '& .material-icons:hover': {
      color: COLORS.income,
    }
  },
  balanceHeader: {

  },
  typeSelect: {
    padding: '1px 4px',
    width: '100%',
    fontSize: '12px',
    height: '18px',
  },
  label: {
    '& .bp4-table-truncated-text span': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '& button': {
        fontSize: '12px',
        height: '18px',
      },
      '&:hover $deleteIcon': {
        visibility: 'visible',
      }
    },
    '& .bp4-table-truncated-text span.labelInputItems': {
      display: 'inline',
    },
  },
  labelItems: {
    maxHeight: '20px',
  },
  labelInputItems: {
  },
  labelInput: {
    width: '190px',
    margin: '0px',
    padding: '0px 4px',
    border: `1px solid #cccccc`,
    borderRadius: '3px',
    fontSize: '12px',
    height: '18px',
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
    fontSize: '15px',
    marginTop: '2px',
    color: COLORS.text,
    '& .material-icons.show': {
      visibility: 'visible',
      cursor: 'pointer',
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
  delete: {
    '& .bp4-table-truncated-text': {
      display: 'flex',
      justifyContent: 'center',
      '& $deleteIcon': {
        marginTop: '2px',
      },
      '&:hover $deleteIcon': {
        visibility: 'visible',
      }
    },
  },
  deleteIcon: {
    visibility: 'hidden',
    color: COLORS.icon_default,
    '& .material-icons': {
      fontSize: '16px',
    },
    '&:hover': {
      color: COLORS.expense,
    }
  },
});
