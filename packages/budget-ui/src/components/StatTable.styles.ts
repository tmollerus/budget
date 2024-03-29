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
      '&.income, &.expense, &.neutral': {
        textAlign: 'right',
        paddingLeft: '20px',
      },
      '&.income': {
        color: COLORS.income,
      },
      '&.expense': {
        color: COLORS.expense,
      },
      '& div.neutral': {
        color: COLORS.silver,
      },
    },
  },
  statTableTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    paddingTop: '20px',
  },
  statTableTh: {
    fontSize: '1rem',
    textAlign: 'left',
  },
  statTableTd: {
    fontSize: '.8rem',
    borderTop: '1px dotted #999999',
    padding: '4px 0px',
  },
  label: {
    width: '50%',
  },
  averages: {
    width: '25%',
  },
  totals: {
    width: '25%',
  },
  annual: {
    marginTop: '24px',
  },
  balanceChart: {
    marginTop: '24px',
  }
});
