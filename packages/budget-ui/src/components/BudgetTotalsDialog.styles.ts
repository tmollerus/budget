import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles({
  totalsDialogBody: {
    fontSize: '12px',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
    marginBottom: '16px',
    '& p': {
      marginTop: 0,
      marginBottom: '12px',
      padding: '8px 15px',
    },
  },
  totalsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    '& th': {
      fontSize: '14px',
    },
    '& th, & td': {
      textAlign: 'left',
      padding: '8px 15px',
      borderBottom: '1px solid #dde1e6',
    },
  },
  categoryRow: {
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#f5f8fa',
  },
  subcategoryCell: {
    paddingLeft: '20px',
    color: '#5c7080',
  },
  percentCell: {
    textAlign: 'right',
  },
  totalRow: {
    fontSize: '14px',
    fontWeight: 'bold',
    borderTop: '2px solid #cdd7e0',
    backgroundColor: '#eef2f6',
  },
  dialogFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '12px',
  },
});