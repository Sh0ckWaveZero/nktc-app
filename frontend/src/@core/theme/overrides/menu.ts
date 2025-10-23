// ** MUI Imports
import { Theme } from '@mui/material/styles';

// ** Theme Type Import
import { Skin } from '@/@core/layouts/types';

const Menu = (theme: Theme, skin: Skin) => {
  return {
    MuiMenu: {
      styleOverrides: {
        root: {
          '& .MuiMenu-paper': {
            borderRadius: 5,
            ...(skin === 'bordered'
              ? {
                  boxShadow: theme.shadows[0],
                  border: `1px solid ${theme.palette.divider}`,
                }
              : {
                  boxShadow: theme.shadows[8],
                  ...theme.applyStyles('dark', {
                    boxShadow: theme.shadows[9],
                  }),
                }),
          },
        },
      },
    },
  };
};

export default Menu;
