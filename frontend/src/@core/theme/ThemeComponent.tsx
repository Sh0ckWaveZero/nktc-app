// ** React Imports
import { ReactNode } from 'react';

// ** MUI Imports
import { deepmerge } from '@mui/utils';
import { Theme } from '@mui/system';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { thTH } from '@mui/material/locale';

// ** Type Imports
import { Settings } from '@/@core/context/settingsContext';

// ** Theme Config
import themeConfig from '@/configs/themeConfig';

// ** Theme Override Imports
import overrides from './overrides';
import typography from './typography';

// ** Theme
import themeOptions from './ThemeOptions';
import UserThemeOptions from '@/layouts/UserThemeOptions';

// ** Global Styles
import GlobalStyling from './globalStyles';

interface Props {
  settings: Settings;
  children: ReactNode;
}

const ThemeComponent = (props: Props) => {
  // ** Props
  const { settings, children } = props;

  // ** Merged ThemeOptions of Core and User
  const coreThemeConfig = themeOptions(settings);

  // ** Pass ThemeOptions to CreateTheme Function to create partial theme without component overrides
  let theme = createTheme(coreThemeConfig);

  // ** Deep Merge Component overrides of core and user
  const mergeComponentOverrides = (theme: Theme, settings: Settings) =>
    deepmerge({ ...overrides(theme, settings) }, UserThemeOptions()?.components);

  // ** Deep Merge Typography of core and user
  const mergeTypography = (theme: Theme) => deepmerge(typography(theme), UserThemeOptions()?.typography);

  // ** Continue theme creation and pass merged component overrides to CreateTheme function
  theme = createTheme(
    theme,
    {
      components: { ...mergeComponentOverrides(theme, settings) },
      typography: { ...mergeTypography(theme) },
    },
    thTH,
  );

  // ** Set responsive font sizes to true
  if (themeConfig.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={() => GlobalStyling(theme, settings) as any} />
      {children}
    </ThemeProvider>
  );
};

export default ThemeComponent;
