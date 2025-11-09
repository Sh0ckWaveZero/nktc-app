// ** MUI Imports
import { styled } from '@mui/material/styles';
import { ToastContainer, ToastContainerProps } from 'react-toastify';
import React from 'react';
import Box from '@mui/material/Box';

// ** Styled wrapper Box for styling
const StyledWrapper = styled(Box)(({ theme: muiTheme }) => ({
  '& .Toastify__toast-container': {
    zIndex: 9999,
    [muiTheme.breakpoints.down('sm')]: {
      width: 'calc(100% - 32px) !important',
      left: '50% !important',
      transform: 'translateX(-50%) !important',
      padding: `${muiTheme.spacing(2)} !important`,
      top: `${muiTheme.spacing(2)} !important`,
    },
    [muiTheme.breakpoints.up('sm')]: {
      width: 'auto !important',
      padding: `${muiTheme.spacing(3)} !important`,
    },
  },
  '& .Toastify__toast': {
    fontFamily: `${muiTheme.typography.fontFamily} !important`,
    [muiTheme.breakpoints.down('sm')]: {
      fontSize: '0.875rem !important',
      padding: `${muiTheme.spacing(1.5, 2)} !important`,
      minHeight: '48px !important',
      borderRadius: `${muiTheme.shape.borderRadius}px !important`,
      marginBottom: `${muiTheme.spacing(1)} !important`,
    },
    [muiTheme.breakpoints.up('sm')]: {
      fontSize: '0.9375rem !important',
      padding: `${muiTheme.spacing(2, 2.5)} !important`,
      minHeight: '56px !important',
      borderRadius: `${muiTheme.shape.borderRadius}px !important`,
    },
    boxShadow: muiTheme.shadows[8],
    // Light mode styles
    backgroundColor: `${muiTheme.palette.background.paper} !important`,
    color: `${muiTheme.palette.text.primary} !important`,
    // Dark mode styles
    ...muiTheme.applyStyles('dark', {
      backgroundColor: `${muiTheme.palette.background.paper} !important`,
      color: `${muiTheme.palette.text.primary} !important`,
    }),
  },
  '& .Toastify__toast--error': {
    backgroundColor: muiTheme.palette.error.main,
    color: muiTheme.palette.error.contrastText,
  },
  '& .Toastify__toast--success': {
    backgroundColor: muiTheme.palette.success.main,
    color: muiTheme.palette.success.contrastText,
  },
  '& .Toastify__toast--info': {
    backgroundColor: muiTheme.palette.info.main,
    color: muiTheme.palette.info.contrastText,
  },
  '& .Toastify__toast--warning': {
    backgroundColor: muiTheme.palette.warning.main,
    color: muiTheme.palette.warning.contrastText,
  },
  '& .Toastify__progress-bar': {
    height: '3px !important',
  },
  '& .Toastify__close-button': {
    opacity: 0.8,
    '&:hover': {
      opacity: 1,
    },
  },
}));

// ** Styled ToastContainer Component (no theme prop conflict)
const BaseStyledToastContainer = styled(ToastContainer)(() => ({
  // Empty - styles are handled by StyledWrapper
}));

// ** Wrapper component to handle theme prop without conflict
interface StyledToastContainerProps extends Omit<ToastContainerProps, 'theme'> {
  toastTheme?: 'light' | 'dark' | 'colored';
}

const StyledToastContainer = ({ toastTheme = 'light', ...props }: StyledToastContainerProps) => {
  // Create ToastContainer props with theme
  const toastContainerProps: ToastContainerProps = {
    ...props,
    theme: toastTheme,
  };
  
  // Wrap ToastContainer in StyledWrapper for MUI theme styling
  // ToastContainer receives theme prop directly without MUI interference
  // Use suppressHydrationWarning to prevent hydration mismatch warnings
  return React.createElement(
    StyledWrapper,
    { suppressHydrationWarning: true },
    React.createElement(ToastContainer, toastContainerProps)
  );
};

StyledToastContainer.displayName = 'StyledToastContainer';

export default StyledToastContainer;
