import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    customColors: {
      dark: string;
      main: string;
      light: string;
      bodyBg: string;
      darkBg: string;
      lightBg: string;
      tableHeaderBg: string;
      primaryGradient: string;
      headerText: string;
    };
    other: PaletteColor;
  }
  interface PaletteOptions {
    customColors?: {
      dark?: string;
      main?: string;
      light?: string;
      bodyBg?: string;
      darkBg?: string;
      lightBg?: string;
      tableHeaderBg?: string;
      primaryGradient?: string;
      headerText?: string;
    };
    other?: PaletteColorOptions;
  }
}

export {};
