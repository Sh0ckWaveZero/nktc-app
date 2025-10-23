// ** React Imports
import { ElementType } from 'react';

// ** Next Imports
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ** MUI Imports
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton';
import Icon from '@/@core/components/icon';

// ** Configs Import
import themeConfig from '@/configs/themeConfig';

// ** Types
import { NavLink, NavGroup } from '@/@core/layouts/types';
import { Settings } from '@/@core/context/settingsContext';

// ** Custom Components Imports
import Translations from '@/layouts/components/Translations';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';

interface Props {
  parent?: boolean;
  item: NavLink;
  navHover?: boolean;
  settings: Settings;
  navVisible?: boolean;
  collapsedNavWidth: number;
  navigationBorderWidth: number;
  toggleNavVisibility: () => void;
  isSubToSub?: NavGroup | undefined;
}

// ** Styled Components
const MenuNavLink = styled(ListItemButton)<
  ListItemButtonProps & {
    component?: ElementType;
    href?: string;
  }
>(({ theme }) => ({
  width: '100%',
  borderTopRightRadius: 100,
  borderBottomRightRadius: 100,
  color: theme.palette.text.primary,
  transition: 'padding-left .25s ease-in-out',
  '&.active': {
    '&, &:hover': {
      boxShadow: theme.shadows[3],
      backgroundImage: `linear-gradient(98deg, ${theme.palette.customColors.primaryGradient}, ${theme.palette.primary.main} 94%)`,
    },
    '& .MuiTypography-root, & .MuiListItemIcon-root': {
      color: `${theme.palette.common.white} !important`,
    },
  },
}));

const MenuItemTextMetaWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' }),
}));

const VerticalNavLink = ({
  item,
  parent,
  navHover,
  settings,
  navVisible,
  isSubToSub,
  collapsedNavWidth,
  toggleNavVisibility,
  navigationBorderWidth,
}: Props) => {
  // ** Hooks
  const pathname = usePathname();

  // ** Vars
  const { navCollapsed } = settings;

  const icon = parent && !item.icon ? themeConfig.navSubItemIcon : item.icon;

  const isNavLinkActive = () => {
    if (pathname === item.path) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <CanViewNavLink navLink={item}>
      <ListItem
        disablePadding
        className='nav-link'
        sx={{
          mt: 1.5,
          px: '0 !important',
          pointerEvents: item.disabled ? 'none' : 'auto',
          opacity: item.disabled ? 0.5 : 1,
        }}
      >
        <MenuNavLink
          component={Link}
          href={item.path === undefined ? '/' : item.path}
          {...(item.openInNewTab ? { target: '_blank' } : {})}
          {...(item.disabled && { tabIndex: -1 })}
          className={isNavLinkActive() ? 'active' : ''}
          onClick={(e) => {
            if (item.path === undefined) {
              e.preventDefault();
              e.stopPropagation();
            }
            if (navVisible) {
              toggleNavVisibility();
            }
          }}
          sx={{
            py: 2.25,
            ...(item.disabled ? { pointerEvents: 'none' } : { cursor: 'pointer' }),
            pl: navCollapsed && !navHover ? (collapsedNavWidth - navigationBorderWidth - 24) / 8 : 5.5,
            pr: navCollapsed && !navHover ? ((collapsedNavWidth - navigationBorderWidth - 24) / 2 - 5) / 4 : 3.5,
          }}
        >
          {isSubToSub ? null : (
            <ListItemIcon
              sx={{
                color: 'text.primary',
                transition: 'margin .25s ease-in-out',
                ...(navCollapsed && !navHover ? { mr: 0 } : { mr: 2.5 }),
                ...(parent ? { ml: 1.25, mr: 3.75 } : {}), // This line should be after (navCollapsed && !navHover) condition for proper styling
                '& svg': {
                  fontSize: '0.875rem',
                  ...(!parent ? { fontSize: '1.5rem' } : {}),
                  ...(parent && item.icon ? { fontSize: '0.875rem' } : {}),
                },
              }}
            >
              <Icon icon={icon as string} />
            </ListItemIcon>
          )}

          <MenuItemTextMetaWrapper
            sx={{
              ...(isSubToSub ? { ml: 9 } : {}),
              ...(navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 }),
            }}
          >
            <Typography
              {...((themeConfig.menuTextTruncate || (!themeConfig.menuTextTruncate && navCollapsed && !navHover)) && {
                noWrap: true,
              })}
            >
              <Translations text={item.title} />
            </Typography>
            {item.badgeContent ? (
              <Chip
                label={item.badgeContent}
                color={item.badgeColor || 'primary'}
                sx={{
                  height: 20,
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' },
                }}
              />
            ) : null}
          </MenuItemTextMetaWrapper>
        </MenuNavLink>
      </ListItem>
    </CanViewNavLink>
  );
};

export default VerticalNavLink;
