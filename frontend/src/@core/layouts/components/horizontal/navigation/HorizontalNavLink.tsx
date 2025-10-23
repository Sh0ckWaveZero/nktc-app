// ** React Imports
import React, { ElementType } from 'react';

// ** Next Imports
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// ** MUI Imports
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import MuiListItem, { ListItemProps } from '@mui/material/ListItem';

// ** Third Party Imports
import clsx from 'clsx';

// ** Theme Config Import
import themeConfig from '@/configs/themeConfig';

// ** Types
import { NavLink } from '@/@core/layouts/types';
import { Settings } from '@/@core/context/settingsContext';

// ** Custom Components Imports
import UserIcon from '@/layouts/components/UserIcon';
import Translations from '@/layouts/components/Translations';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';

// ** Util Import
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

interface Props {
  item: NavLink;
  settings: Settings;
  hasParent: boolean;
}

const ListItem = styled(MuiListItem, {
  shouldForwardProp: (prop) => prop !== 'component' && prop !== 'target' && prop !== 'ownerState',
})<ListItemProps & { component?: ElementType; target?: '_blank' | undefined }>(({ theme }) => ({
  width: 'auto',
  paddingTop: theme.spacing(2.25),
  color: theme.palette.text.primary,
  paddingBottom: theme.spacing(2.25),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.active, &.active:hover': {
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.08),
  },
  '&.active .MuiTypography-root, &.active .MuiListItemIcon-root': {
    color: theme.palette.primary.main,
  },
}));

const HorizontalNavLink = (props: Props) => {
  // ** Props
  const { item, settings, hasParent } = props;

  // ** Hook & Vars
  const router = useRouter();
  const pathname = usePathname();
  const { navSubItemIcon, menuTextTruncate } = themeConfig;

  const IconTag = item.icon ? item.icon : navSubItemIcon;

  const Wrapper = !hasParent ? List : React.Fragment;

  const isNavLinkActive = () => {
    if (pathname === item.path) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <CanViewNavLink navLink={item}>
      <Wrapper
        {...(!hasParent
          ? {
              component: 'div',
              sx: { py: settings.skin === 'bordered' ? 2.625 : 2.75 },
            }
          : {})}
      >
        <Link href={`${item.path}`} passHref>
          <ListItem
            component={'p'}
            className={clsx({ active: isNavLinkActive() })}
            target={item.openInNewTab ? '_blank' : undefined}
            onClick={(e) => {
              if (item.path === undefined) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            sx={{
              pointerEvents: item.disabled ? 'none' : 'auto',
              opacity: item.disabled ? 0.5 : 1,
              ...(item.disabled ? {} : { cursor: 'pointer' }),
              ...(!hasParent
                ? {
                    px: 5.5,
                    borderRadius: 3.5,
                    '&.active, &.active:hover': {
                      boxShadow: 3,
                      backgroundImage: (theme) =>
                        `linear-gradient(98deg, ${theme.palette.customColors.primaryGradient}, ${theme.palette.primary.main} 94%)`,
                      '& .MuiTypography-root, & .MuiListItemIcon-root': {
                        color: 'common.white',
                      },
                    },
                  }
                : { px: 5 }),
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ...(menuTextTruncate && { overflow: 'hidden' }),
                }}
              >
                <ListItemIcon sx={{ color: 'text.primary', mr: !hasParent ? 2 : 3 }}>
                  <UserIcon
                    icon={IconTag}
                    componentType='horizontal-menu'
                    iconProps={{
                      sx: IconTag === navSubItemIcon ? { fontSize: '0.875rem' } : { fontSize: '1.375rem' },
                    }}
                  />
                </ListItemIcon>
                <Typography {...(menuTextTruncate && { noWrap: true })}>
                  <Translations text={item.title} />
                </Typography>
              </Box>
              {item.badgeContent ? (
                <Chip
                  label={item.badgeContent}
                  color={item.badgeColor || 'primary'}
                  sx={{
                    ml: 1.6,
                    height: 20,
                    fontWeight: 500,
                    '& .MuiChip-label': {
                      px: 1.5,
                      textTransform: 'capitalize',
                    },
                  }}
                />
              ) : null}
            </Box>
          </ListItem>
        </Link>
      </Wrapper>
    </CanViewNavLink>
  );
};

export default HorizontalNavLink;
