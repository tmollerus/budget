import {createUseStyles} from 'react-jss';
import { COLORS } from '../constants/theme';

const inputStyles = {
  margin: '0px',
  padding: '0px 3px',
  border: `1px solid #cccccc`,
  borderRadius: '3px',
  fontSize: '12px',
  height: '22px',
};

const iconStyles = {
  height: 'min-content',
  color: COLORS.icon_default,
  '& .material-icons': {
    fontSize: '16px',
  },
}

export const useStyles = createUseStyles({
  table: {
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    '-webkit-flex-flow': 'column nowrap',
    '-moz-flex-flow': 'column nowrap',
    flexFlow: 'column nowrap',
    '-webkit-box-pack': 'justify',
    '-moz-box-pack': 'justify',
    boxPack: 'justify',
    '-webkit-justify-content': 'space-between',
    '-moz-justify-content': 'space-between',
    '-ms-justify-content': 'space-between',
    '-o-justify-content': 'space-between',
    justifyContent: 'space-between',
    '-ms-flex-pack': 'justify',
    fontSize: 'inherit',
    // margin: '0.5rem',
    lineHeight: '1.5',
  },
  tableHeader: {
    // display: 'none',
    display: 'flex',
    fontWeight: '700',
    '& $tableRowItem': {
      lineHeight: '30px',
      borderTop: 'none !important',
      backgroundColor: COLORS.table,
    },
    '& $tableRowItem:nth-of-type(8)': {
    },
  },
  tableFooter: {
    // display: 'none',
    display: 'flex',
    fontWeight: '700',
    '& $tableRowItem': {
      lineHeight: '30px',
      borderTop: 'none !important',
      backgroundColor: COLORS.table,
    },
  },
  tableRow: {
    width: '100%',
    backgroundColor: COLORS.white,
    display: 'flex',
    '-webkit-flex-flow': 'row nowrap',
    '-moz-flex-flow': 'row nowrap',
    flexFlow: 'row nowrap',
    '&:hover': {
      backgroundColor: COLORS.sidebar,
    },
    '&:hover $deleteIcon': {
      visibility: 'visible',
    }
  },
  evenRow: {
    backgroundColor: COLORS.ledgerEven,
  },

  dateInput: {
    fontFamily: 'Asap, Arial, sans-serif',
    width: '100%',
    ...inputStyles,
  },
  typeSelect: {
    // padding: '1px 4px',
    width: '70%',
    ...inputStyles,
  },
  expenseInput: {
    width: '90%',
    textAlign: 'right',
    ...inputStyles,
  },
  paidInput: {
    // margin: '4px 0px 4px 10px',
  },
  labelInput: {
    width: '60%',
    ...inputStyles,
  },

  button: {
    fontSize: '12px',
    marginLeft: '6px',
    height: '23px',
    width: 'max-content',
    whiteSpace: 'nowrap',
  },

  addIcon: {
    lineHeight: 1.5,
    ...iconStyles,
    '&:hover': {
      color: COLORS.income,
    }
  },
  deleteIcon: {
    lineHeight: 1,
    visibility: 'hidden',
    ...iconStyles,
    '&:hover': {
      color: COLORS.expense,
    }
  },
  // '@media (min-width: 500px)': {
  //   tableHeader: {
  //     fontWeight: '700',
  //   },
  //   tableRow: {
  //     display: 'flex',
  //     '-webkit-flex-flow': 'row nowrap',
  //     '-moz-flex-flow': 'row nowrap',
  //     flexFlow: 'row nowrap',
  //   },
  //   tableRowItem: {
  //     padding: '0.5em',
  //     '&:before': {
  //       content: 'none',
  //     },
  //   },
  // },
  firstOfDate: {
    color: 'inherit',
  },
  notFirstOfDate: {
  },
  income: {
    textAlign: 'right',
    color: COLORS.income,
  },
  expense: {
    textAlign: 'right',
    color: COLORS.expense,
  },
  tableRowItem: {
    display: 'flex',
    flexFlow: 'row nowrap',
    flexGrow: 1,
    '-ms-flex-positive': 1,
    '-webkit-flex-basis': 0,
    '-moz-flex-basis': 0,
    flexBasis: 0,
    '-ms-flex-preferred-size': 0,
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'break-all',
    padding: '1px 4px',
    // border: 'none !important',
    borderTop: '1px dotted #cccccc !important',
    '&$firstOfDate': {
      borderTop: '1px solid #bababa !important',
    },
    cursor: 'pointer',
    'word-break': 'break-word',
    '&:has(> $dateInput)': {
      overflowY: 'overlay',
    },
    '&:nth-of-type(1)': { // Date
      flexGrow: 2,
      '&$notFirstOfDate': {
        color: 'transparent',
      },
    },
    '&:nth-of-type(2)': { // Income
      flexGrow: 3,
    },
    '&:nth-of-type(3)': { // Transfer
      flexGrow: 3,
    },
    '&:nth-of-type(4)': { // Balance
      flexGrow: 4,
    },
    '&:nth-of-type(5)': { // Expense
      flexGrow: 3,
    },
    '&:nth-of-type(6)': { // Paid
      flexBasis: '20px',
      flexGrow: 1,
      justifyContent: 'center',
    },
    '&:nth-of-type(7)': { // Label
      flexGrow: 10,
    },
    '&:nth-of-type(8)': { // Add/delete
      flexBasis: '20px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'end',
      justifyContent: 'flex-end',
    },
    '&:before': {
      content: 'none',
    },
  },
  rowCollection: {
    overflow: 'auto',
    height: 'inherit',
  },
  searchInputGroupContainer: {
    width: '100%',
  },
  searchInputGroup: {
    width: '100%',
    display: 'inline-flex',
    maxHeight: '24px',
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.lightGrey}`,
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
    marginTop: '5px',
    '& .material-icons': {
      visibility: 'visible',
      cursor: 'pointer',
      fontSize: '15px',
      color: COLORS.mediumGrey,
    },
  },
  searchLabel: {
    whiteSpace: 'nowrap',
    paddingRight: '1rem',
  },
  searchInput: {
    width: '100%',
    margin: '0px',
    paddingRight: '20px',
    border: 'none',
    color: COLORS.icon_default,
  },

  addInputGroup: {
    display: 'inline-flex',
    maxHeight: '24px',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
});
