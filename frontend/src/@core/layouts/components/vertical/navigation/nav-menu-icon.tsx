import type { ElementType, ReactElement } from 'react';

import Icon from '@/@core/components/icon';

interface NavMenuIconProps {
  icon?: string | ElementType;
}

/** แสดง Iconify name หรือ React icon component ตามชนิดที่เมนูกำหนด */
const NavMenuIcon = ({ icon }: NavMenuIconProps): ReactElement | null => {
  if (!icon) return null;
  if (typeof icon === 'string') return <Icon icon={icon} />;
  const IconComponent = icon;
  return <IconComponent />;
};

export default NavMenuIcon;
