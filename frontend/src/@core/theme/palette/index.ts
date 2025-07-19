// ** Type Imports
import { PaletteMode } from '@mui/material';
import { Skin, ThemeColor } from '@/@core/layouts/types';

const DefaultPalette = (mode: PaletteMode, skin: Skin, themeColor: ThemeColor) => {

  // ** Vars
  const lightColor = '#3A3541';
  const darkColor = '#E7E3FC';
  const mainColor = mode === 'light' ? lightColor : darkColor;


  const primaryGradient = () => {
    if (themeColor === 'primary') {
      return '#6ACDFF';
    } else if (themeColor === 'secondary') {
      return '#9C9FA4';
    } else if (themeColor === 'success') {
      return '#93DD5C';
    } else if (themeColor === 'error') {
      return '#FF8C90';
    } else if (themeColor === 'warning') {
      return '#FFCF5C';
    } else {
      return '#6ACDFF';
    }
  };

  const defaultBgColor = () => {
    if (skin === 'bordered' && mode === 'light') {
      return '#FFF';
    } else if (skin === 'bordered' && mode === 'dark') {
      return '#312D4B';
    } else if (mode === 'light') {
      return '#F4F5FA';
    } else return '#28243D';
  };

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      darkBg: '#28243D',
      lightBg: '#F4F5FA',
      primaryGradient: primaryGradient(),
      bodyBg: mode === 'light' ? '#F4F5FA' : '#28243D', // Same as palette.background.default but doesn't consider bordered skin
      tableHeaderBg: mode === 'light' ? '#F9FAFC' : '#3D3759',
    },
    common: {
      black: '#000',
      white: '#FFF',
    },
    mode: mode,
    primary: {
      light: '#32BAFF',
      main: '#16B1FF',
      dark: '#139CE0',
      contrastText: '#FFF',
    },
    secondary: {
      light: '#9C9FA4',
      main: '#8A8D93',
      dark: '#777B82',
      contrastText: '#FFF',
    },
    success: {
      light: '#6AD01F',
      main: '#56CA00',
      dark: '#4CB200',
      contrastText: '#FFF',
    },
    error: {
      light: '#FF6166',
      main: '#FF4C51',
      dark: '#E04347',
      contrastText: '#FFF',
    },
    warning: {
      light: '#FFCA64',
      main: '#FFB400',
      dark: '#E09E00',
      contrastText: '#FFF',
    },
    info: {
      light: '#32BAFF',
      main: '#16B1FF',
      dark: '#139CE0',
      contrastText: '#FFF',
    },
    other: {
      light: '#9E69FD',
      main: '#9155FD',
      dark: '#804BDF',
      contrastText: '#FFF',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#D5D5D5',
      A200: '#AAAAAA',
      A400: '#616161',
      A700: '#303030',
    },
    text: {
      primary: mode === 'light' ? 'rgba(58, 53, 65, 0.87)' : 'rgba(231, 227, 252, 0.87)',
      secondary: mode === 'light' ? 'rgba(58, 53, 65, 0.68)' : 'rgba(231, 227, 252, 0.68)',
      disabled: mode === 'light' ? 'rgba(58, 53, 65, 0.38)' : 'rgba(231, 227, 252, 0.38)',
    },
    divider: mode === 'light' ? 'rgba(58, 53, 65, 0.12)' : 'rgba(231, 227, 252, 0.12)',
    background: {
      paper: mode === 'light' ? '#FFF' : '#312D4B',
      default: defaultBgColor(),
    },
    action: {
      active: mode === 'light' ? 'rgba(58, 53, 65, 0.54)' : 'rgba(231, 227, 252, 0.54)',
      hover: mode === 'light' ? 'rgba(58, 53, 65, 0.04)' : 'rgba(231, 227, 252, 0.04)',
      selected: mode === 'light' ? 'rgba(58, 53, 65, 0.08)' : 'rgba(231, 227, 252, 0.08)',
      disabled: mode === 'light' ? 'rgba(58, 53, 65, 0.3)' : 'rgba(231, 227, 252, 0.3)',
      disabledBackground: mode === 'light' ? 'rgba(58, 53, 65, 0.18)' : 'rgba(231, 227, 252, 0.18)',
      focus: mode === 'light' ? 'rgba(58, 53, 65, 0.12)' : 'rgba(231, 227, 252, 0.12)',
    },
  };
};

export default DefaultPalette;
