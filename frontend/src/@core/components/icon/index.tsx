// ** Icon Imports
import { Icon, IconProps } from '@iconify/react';
import Box from '@mui/material/Box';

const IconifyIcon = ({ icon, fontSize = '1.5rem', ...rest }: IconProps) => {
  return <Icon icon={icon} fontSize={fontSize} {...rest} />;
};

export default IconifyIcon;

type SemanticColor = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';

interface ColorIconProps {
  icon: string;
  color?: SemanticColor;
  fontSize?: string | number;
  opacity?: number;
}

/** Icon wrapped in a colored inline span. Inherits theme palette via `color.main`. */
export const ColorIcon = ({ icon, color, fontSize = '1rem', opacity = 0.8 }: ColorIconProps) => (
  <Box
    component='span'
    sx={{
      color: color ? `${color}.main` : 'inherit',
      display: 'inline-flex',
      flexShrink: 0,
      opacity,
    }}
  >
    <Icon icon={icon} fontSize={fontSize} />
  </Box>
);
