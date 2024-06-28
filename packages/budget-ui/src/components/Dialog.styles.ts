import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles({
  body: {
    lineHeight: '18px',
    margin: '20px',
  },
  footer: {
    flex: '0 0 auto',
    margin: '0 20px',
    paddingBottom: '20px',
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& .bp4-button': {
      marginLeft: '10px',
      borderRadius: '4px',
    },
  }
});
