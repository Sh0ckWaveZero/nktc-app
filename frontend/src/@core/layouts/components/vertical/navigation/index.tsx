'use client';

// ** React Import
import { ReactNode, useRef, useState } from 'react';

// ** MUI Import
import List from '@mui/material/List';
import Box, { BoxProps } from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar';

// ** Type Import
import { Settings } from '@/@core/context/settingsContext';
import { VerticalNavItemsType } from '@/@core/layouts/types';

import themeConfig from '@/configs/themeConfig';

// ** Component Imports
import Drawer from './Drawer';
import VerticalNavItems from './VerticalNavItems';
import VerticalNavHeader from './VerticalNavHeader';

// ** Util Import
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

interface Props {
  hidden: boolean;
  navWidth: number;
  navHover: boolean;
  settings: Settings;
  children: ReactNode;
  navVisible: boolean;
  collapsedNavWidth: number;
  navigationBorderWidth: number;
  toggleNavVisibility: () => void;
  setNavHover: (values: boolean) => void;
  setNavVisible: (value: boolean) => void;
  verticalNavItems?: VerticalNavItemsType;
  saveSettings: (values: Settings) => void;
  verticalNavMenuContent?: (props?: any) => ReactNode;
  afterVerticalNavMenuContent?: (props?: any) => ReactNode;
  beforeVerticalNavMenuContent?: (props?: any) => ReactNode;
}

const StyledBoxForShadow = styled(Box)<BoxProps>(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  display: 'none',
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  '&.d-block': {
    display: 'block',
  },
}));

const Navigation = (props: Props) => {
  // ** Props
  const {
    hidden,
    navHover,
    settings,
    afterVerticalNavMenuContent,
    beforeVerticalNavMenuContent,
    verticalNavMenuContent: userVerticalNavMenuContent,
  } = props;

  // ** States
  const [groupActive, setGroupActive] = useState<string[]>([]);
  const [currentActiveGroup, setCurrentActiveGroup] = useState<string[]>([]);

  // ** Ref
  const shadowRef: any = useRef(null);

  // ** Hooks
  const theme = useTheme();

  // ** Var
  const { skin, navCollapsed } = settings;
  const { afterVerticalNavMenuContentPosition, beforeVerticalNavMenuContentPosition } = themeConfig;

  // ** Fixes Navigation InfiniteScroll
  const handleInfiniteScroll = (ref: any | HTMLElement) => {
    if (ref) {
      ref._getBoundingClientRect = ref.getBoundingClientRect;

      ref.getBoundingClientRect = () => {
        const original = ref._getBoundingClientRect();

        return { ...original, height: Math.floor(original.height) };
      };
    }
  };

  // ** Scroll Menu
  const scrollMenu = (container: any) => {
    if (beforeVerticalNavMenuContentPosition === 'static' || !beforeVerticalNavMenuContent) {
      container = hidden ? container.target : container;
      if (shadowRef && container.scrollTop > 0) {
        if (!shadowRef.current.classList.contains('d-block')) {
          shadowRef.current.classList.add('d-block');
        }
      } else {
        shadowRef.current.classList.remove('d-block');
      }
    }
  };

  const shadowBgColorStyles =
    skin === 'semi-dark'
      ? {
          background: `linear-gradient(${theme.palette.customColors.darkBg} 5%,${hexToRGBA(
            theme.palette.customColors.darkBg,
            0.85,
          )} 30%,${hexToRGBA(theme.palette.customColors.darkBg, 0.5)} 65%,${hexToRGBA(
            theme.palette.customColors.darkBg,
            0.3,
          )} 75%,transparent)`,
          ...theme.applyStyles('dark', {
            background: `linear-gradient(${theme.palette.customColors.lightBg} 5%,${hexToRGBA(
              theme.palette.customColors.lightBg,
              0.85,
            )} 30%,${hexToRGBA(theme.palette.customColors.lightBg, 0.5)} 65%,${hexToRGBA(
              theme.palette.customColors.lightBg,
              0.3,
            )} 75%,transparent)`,
          }),
        }
      : {
          background: `linear-gradient(${theme.palette.background.default} 5%,${hexToRGBA(
            theme.palette.background.default,
            0.85,
          )} 30%,${hexToRGBA(theme.palette.background.default, 0.5)} 65%,${hexToRGBA(
            theme.palette.background.default,
            0.3,
          )} 75%,transparent)`,
        };

  const ScrollWrapper: any = hidden ? Box : PerfectScrollbar;

  return (
    <Drawer {...props}>
      <VerticalNavHeader {...props} />
      {beforeVerticalNavMenuContent && beforeVerticalNavMenuContentPosition === 'fixed'
        ? beforeVerticalNavMenuContent(props)
        : null}
      {(beforeVerticalNavMenuContentPosition === 'static' || !beforeVerticalNavMenuContent) && (
        <StyledBoxForShadow ref={shadowRef} sx={shadowBgColorStyles} />
      )}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <ScrollWrapper
          {...(hidden
            ? {
                onScroll: (container: any) => scrollMenu(container),
                sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' },
              }
            : {
                options: { wheelPropagation: false },
                onScrollY: (container: any) => scrollMenu(container),
                containerRef: (ref: any) => handleInfiniteScroll(ref),
              })}
        >
          {beforeVerticalNavMenuContent && beforeVerticalNavMenuContentPosition === 'static'
            ? beforeVerticalNavMenuContent(props)
            : null}
          {userVerticalNavMenuContent ? (
            userVerticalNavMenuContent(props)
          ) : (
            <List
              className='nav-items'
              sx={{
                pt: 0,
                transition: 'padding .25s ease',
                '& > :first-of-type': { mt: '0' },
                pr: !navCollapsed || (navCollapsed && navHover) ? 4.5 : 1.25,
              }}
            >
              <VerticalNavItems
                groupActive={groupActive}
                setGroupActive={setGroupActive}
                currentActiveGroup={currentActiveGroup}
                setCurrentActiveGroup={setCurrentActiveGroup}
                {...props}
              />
            </List>
          )}
          {afterVerticalNavMenuContent && afterVerticalNavMenuContentPosition === 'static'
            ? afterVerticalNavMenuContent(props)
            : null}
        </ScrollWrapper>
      </Box>
      {afterVerticalNavMenuContent && afterVerticalNavMenuContentPosition === 'fixed'
        ? afterVerticalNavMenuContent(props)
        : null}
    </Drawer>
  );
};

export default Navigation;
