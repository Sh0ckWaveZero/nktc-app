// ** MUI Imports
import { Theme } from '@mui/material/styles';

// ** Type Imports
import { Settings } from '@/@core/context/settingsContext';

// ** Util Import
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

const GlobalStyles = (theme: Theme, settings: Settings) => {
  // ** Vars
  const { skin } = settings;

  return {
    ':root': {
      colorScheme: 'light dark',
    },
    html: {
      height: '100%',
      backgroundColor: theme.palette.background.default,
      colorScheme: theme.palette.mode,
    },
    body: {
      height: '100%',
      margin: 0,
      padding: 0,
      backgroundColor: theme.palette.background.default,
    },
    '#__next': {
      height: '100%',
      backgroundColor: theme.palette.background.default,
    },
    '.layout-wrapper': {
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
    },
    'body[style^="padding-right"] .layout-navbar-and-nav-container::after': {
      content: '""',
      position: 'absolute' as const,
      left: '100%',
      top: 0,
      height: '100%',
      backgroundColor: hexToRGBA(theme.palette.background.paper, 0.85),
      width: '30px',
    },
    '.demo-space-x > *': {
      marginTop: '1rem !important',
      marginRight: '1rem !important',
      'body[dir="rtl"] &': {
        marginRight: '0 !important',
        marginLeft: '1rem !important',
      },
    },
    '.demo-space-y > *:not(:last-of-type)': {
      marginBottom: '1rem',
    },
    '.MuiGrid-container.match-height .MuiCard-root': {
      height: '100%',
    },
    '.ps__rail-y': {
      zIndex: 1,
      right: '0 !important',
      left: 'auto !important',
      '&:hover, &:focus, &.ps--clicking': {
        backgroundColor: `${theme.palette.grey[200]} !important`,
        ...theme.applyStyles('dark', {
          backgroundColor: `${theme.palette.grey[800]} !important`,
        }),
      },
      '& .ps__thumb-y': {
        right: '3px !important',
        left: 'auto !important',
        backgroundColor: `${theme.palette.grey[400]} !important`,
        ...theme.applyStyles('dark', {
          backgroundColor: `${theme.palette.grey[700]} !important`,
        }),
      },
      '.layout-vertical-nav &': {
        '& .ps__thumb-y': {
          width: 4,
          backgroundColor: skin === 'semi-dark' ? `${theme.palette.grey[700]} !important` : `${theme.palette.grey[400]} !important`,
          ...theme.applyStyles('dark', {
            backgroundColor: skin === 'semi-dark' ? `${theme.palette.grey[400]} !important` : `${theme.palette.grey[700]} !important`,
          }),
        },
        '&:hover, &:focus, &.ps--clicking': {
          backgroundColor: 'transparent !important',
          '& .ps__thumb-y': {
            width: 6,
          },
        },
      },
    },

    '#nprogress': {
      pointerEvents: 'none',
      '& .bar': {
        left: 0,
        top: 0,
        height: 3,
        width: '100%',
        zIndex: 2000,
        position: 'fixed',
        backgroundColor: theme.palette.primary.main,
      },
    },
  };
};

export default GlobalStyles;
