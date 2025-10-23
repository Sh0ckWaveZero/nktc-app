// ** MUI Imports
import { Theme } from '@mui/material/styles';

// ** Util Import
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

const Tooltip = (theme: Theme) => {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: hexToRGBA(theme.palette.grey[900], 0.9),
          ...theme.applyStyles('dark', {
            backgroundColor: hexToRGBA(theme.palette.grey[700], 0.9),
          }),
        },
        arrow: {
          color: hexToRGBA(theme.palette.grey[900], 0.9),
          ...theme.applyStyles('dark', {
            color: hexToRGBA(theme.palette.grey[700], 0.9),
          }),
        },
      },
    },
  };
};

export default Tooltip;
