// ** Icon Imports
import { Icon, IconProps } from '@iconify/react';

const IconifyIcon = ({ icon, fontSize = '1.5rem', ...rest }: IconProps) => {
  return <Icon icon={icon} fontSize={fontSize} {...rest} />;
};

export default IconifyIcon;
