// ** MUI Imports
import { Theme } from '@mui/material/styles';
import { lighten, darken } from '@mui/material/styles';

// ** Util Import
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

const Alert = (theme: Theme) => {
  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          '& .MuiAlertTitle-root': {
            marginBottom: theme.spacing(1.6),
          },
          '& a': {
            fontWeight: 500,
            color: 'inherit',
          },
        },
        standardSuccess: {
          color: darken(theme.palette.success.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.success.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.success.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.success.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.success.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.success.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.success.main, 0.12),
            },
          }),
        },
        standardInfo: {
          color: darken(theme.palette.info.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.info.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.info.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.info.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.info.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.info.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.info.main, 0.12),
            },
          }),
        },
        standardWarning: {
          color: darken(theme.palette.warning.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.warning.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.warning.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.warning.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.warning.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.warning.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.warning.main, 0.12),
            },
          }),
        },
        standardError: {
          color: darken(theme.palette.error.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.error.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.error.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.error.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.error.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.error.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.error.main, 0.12),
            },
          }),
        },
        outlinedSuccess: {
          borderColor: theme.palette.success.main,
          color: darken(theme.palette.success.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.success.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.success.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.success.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.success.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.success.main, 0.12),
            },
          }),
        },
        outlinedInfo: {
          borderColor: theme.palette.info.main,
          color: darken(theme.palette.info.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.info.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.info.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.info.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.info.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.info.main, 0.12),
            },
          }),
        },
        outlinedWarning: {
          borderColor: theme.palette.warning.main,
          color: darken(theme.palette.warning.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.warning.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.warning.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.warning.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.warning.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.warning.main, 0.12),
            },
          }),
        },
        outlinedError: {
          borderColor: theme.palette.error.main,
          color: darken(theme.palette.error.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: darken(theme.palette.error.main, 0.12),
          },
          '& .MuiAlert-icon': {
            color: darken(theme.palette.error.main, 0.12),
          },
          ...theme.applyStyles('dark', {
            color: lighten(theme.palette.error.main, 0.12),
            '& .MuiAlertTitle-root': {
              color: lighten(theme.palette.error.main, 0.12),
            },
            '& .MuiAlert-icon': {
              color: lighten(theme.palette.error.main, 0.12),
            },
          }),
        },
        filled: {
          fontWeight: 400,
        },
      },
    },
  };
};

export default Alert;
