// ** MUI Imports
import { PaletteMode } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

// ** Icons Imports
import WeatherNight from 'mdi-material-ui/WeatherNight';
import WeatherSunny from 'mdi-material-ui/WeatherSunny';

// ** Type Import
import { Settings } from '@/@core/context/settingsContext';

interface Props {
  settings: Settings;
  saveSettings: (values: Settings) => void;
}

const ModeToggler = (props: Props) => {
  // ** Props
  const { settings, saveSettings } = props;

  // ** MUI v7 Color Scheme Hook
  const { mode, setMode } = useColorScheme();

  const handleModeToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    // Also update settings for backward compatibility
    saveSettings({ ...settings, mode: newMode });
  };

  return (
    <IconButton color='inherit' aria-haspopup='true' onClick={handleModeToggle}>
      {mode === 'dark' ? <WeatherSunny /> : <WeatherNight />}
    </IconButton>
  );
};

export default ModeToggler;
