// ** MUI Imports
import Box from '@mui/material/Box'

// ** Type Import
import { Settings } from "@/@core/context/settingsContext";

// ** Components
import ModeToggler from "@/@core/layouts/components/shared-components/ModeToggler";
import UserDropdown from "@/layouts/components/UserDropdown";

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}
const AppBarContent = (props: Props) => {
  // ** Props
  const { settings, saveSettings } = props

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ModeToggler settings={settings} saveSettings={saveSettings} />
      <UserDropdown settings={settings} />
    </Box>
  )
}

export default AppBarContent
