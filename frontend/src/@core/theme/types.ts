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
  }
}

export {};
