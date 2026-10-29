// ** MUI Imports
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
  const currentMode = mode ?? settings.mode;

  const handleModeToggle = () => {
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    // Also update settings for backward compatibility
    saveSettings({ ...settings, mode: newMode });
  };

  const label = currentMode === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด';

  return (
    <Tooltip title={label} arrow>
      <IconButton color='inherit' aria-label={label} aria-haspopup='true' onClick={handleModeToggle}>
        {currentMode === 'dark' ? <WeatherSunny /> : <WeatherNight />}
      </IconButton>
    </Tooltip>
  );
};

export default ModeToggler;
