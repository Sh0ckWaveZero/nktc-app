// ** MUI Imports
import { Theme } from '@mui/material/styles';

// ** Util Import
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

const Backdrop = (theme: Theme) => {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: `rgba(${theme.palette.customColors.main}, 0.7)`,
          ...theme.applyStyles('dark', {
            backgroundColor: hexToRGBA(theme.palette.background.default, 0.7),
          }),
        },
        invisible: {
          backgroundColor: 'transparent',
        },
      },
    },
  };
};

export default Backdrop;
