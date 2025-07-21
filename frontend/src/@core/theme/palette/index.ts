// ** Type Imports
import { PaletteMode } from '@mui/material';
import { Skin, ThemeColor } from '@/@core/layouts/types';

const DefaultPalette = (mode: PaletteMode, skin: Skin, themeColor: ThemeColor) => {

  // ** Vars
  const lightColor = '58, 53, 65';
  const darkColor = '231, 227, 252';
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
      return '#2a1f3d';
    } else if (mode === 'light') {
      return '#F4F5FA';
    } else return '#1a1625';
  };

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      darkBg: '#1a1625',
      lightBg: '#F4F5FA',
      primaryGradient: primaryGradient(),
      bodyBg: mode === 'light' ? '#F4F5FA' : '#1a1625', // Same as palette.background.default but doesn't consider bordered skin
      tableHeaderBg: mode === 'light' ? '#F9FAFC' : '#2a1f3d',
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
      primary: `rgba(${mainColor}, 0.98)`,
      secondary: `rgba(${mainColor}, 0.85)`,
      disabled: `rgba(${mainColor}, 0.50)`,
    },
    divider: `rgba(${mainColor}, 0.12)`,
    background: {
      paper: mode === 'light' ? '#FFF' : '#2a1f3d',
      default: defaultBgColor(),
    },
    action: {
      active: `rgba(${mainColor}, 0.65)`,
      hover: `rgba(${mainColor}, 0.08)`,
      selected: `rgba(${mainColor}, 0.12)`,
      disabled: `rgba(${mainColor}, 0.35)`,
      disabledBackground: `rgba(${mainColor}, 0.22)`,
      focus: `rgba(${mainColor}, 0.15)`,
    },
  };
};

export default DefaultPalette;
