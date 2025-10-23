// ** MUI Imports
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// ** Icons Imports
import MenuIcon from 'mdi-material-ui/Menu';

// ** Type Import
import { Settings } from '@/@core/context/settingsContext';

// ** Components
import ModeToggler from '@/@core/layouts/components/shared-components/ModeToggler';
import UserDropdown from '@/layouts/components/UserDropdown';
import Autocomplete from '@/layouts/components/Autocomplete';

interface Props {
  hidden: boolean;
  settings: Settings;
  toggleNavVisibility: () => void;
  saveSettings: (values: Settings) => void;
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props;
  return (
    <Box
      id='appbar-content'
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box id='appbar-actions-left' className='actions-left' sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        {hidden ? (
          <IconButton id='menu-toggle-button' color='inherit' sx={{ ml: -2.75, mr: 1 }} onClick={toggleNavVisibility}>
            <MenuIcon />
          </IconButton>
        ) : null}
        <Autocomplete hidden={hidden} settings={settings} />
      </Box>
      <Box id='appbar-actions-right' className='actions-right' sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  );
};

export default AppBarContent;
