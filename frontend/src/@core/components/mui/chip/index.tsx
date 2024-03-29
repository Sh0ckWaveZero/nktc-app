// ** MUI Imports
import MuiChip from '@mui/material/Chip';

// ** Types
import { CustomChipProps } from './types';

// ** Hooks Imports
import useBgColor, { UseBgColorType } from '@/@core/hooks/useBgColor';

const Chip = (props: any | CustomChipProps) => {
  // ** Props
  const { sx, skin, color, icon } = props;

  // ** Hook
  const bgColors = useBgColor();

  const colors: UseBgColorType = {
    primary: { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success: { ...bgColors.successLight },
    error: { ...bgColors.errorLight },
    warning: { ...bgColors.warningLight },
    info: { ...bgColors.infoLight },
  };

  return (
    <MuiChip
      {...props}
      icon={icon}
      variant='filled'
      {...(skin === 'light' && { className: 'MuiChip-light' })}
      sx={skin === 'light' && color ? Object.assign(colors[color], sx) : sx}
    />
  );
};

export default Chip;
