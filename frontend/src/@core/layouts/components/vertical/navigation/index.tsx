// ** React Import
import { ReactNode, useRef, useState, useEffect } from 'react';

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
  const scrollbarRef = useRef<any>(null);

  // ** Hooks
  const theme = useTheme();

  // ** Var
  const { skin, navCollapsed } = settings;
  const { afterVerticalNavMenuContentPosition, beforeVerticalNavMenuContentPosition } = themeConfig;

  // ** Fixes Navigation InfiniteScroll
  const handleInfiniteScroll = (ref: any | HTMLElement) => {
    if (ref) {
      // Store reference to the scrollbar
      scrollbarRef.current = ref;
      
      // Complete replacement of the method to avoid any recursion
      ref.getBoundingClientRect = function() {
        // Use Element.prototype.getBoundingClientRect directly to avoid recursion
        const rect = Element.prototype.getBoundingClientRect.call(this);
        
        // Create a new object to avoid modifying the original rect
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: Math.floor(rect.height), // Apply the flooring here
          x: rect.x,
          y: rect.y,
          toJSON: rect.toJSON
        };
      };
    }
  };
  
  // Clean up scrollbar on unmount to avoid the "destroy" error
  useEffect(() => {
    return () => {
      // Clean reference to avoid destroy call on null
      scrollbarRef.current = null;
    };
  }, []);

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

  const shadowBgColor = () => {
    if (skin === 'semi-dark' && theme.palette.mode === 'light') {
      return `linear-gradient(${theme.palette.customColors.darkBg} 5%,${hexToRGBA(
        theme.palette.customColors.darkBg,
        0.85,
      )} 30%,${hexToRGBA(theme.palette.customColors.darkBg, 0.5)} 65%,${hexToRGBA(
        theme.palette.customColors.darkBg,
        0.3,
      )} 75%,transparent)`;
    } else if (skin === 'semi-dark' && theme.palette.mode === 'dark') {
      return `linear-gradient(${theme.palette.customColors.lightBg} 5%,${hexToRGBA(
        theme.palette.customColors.lightBg,
        0.85,
      )} 30%,${hexToRGBA(theme.palette.customColors.lightBg, 0.5)} 65%,${hexToRGBA(
        theme.palette.customColors.lightBg,
        0.3,
      )} 75%,transparent)`;
    } else {
      return `linear-gradient(${theme.palette.background.default} 5%,${hexToRGBA(
        theme.palette.background.default,
        0.85,
      )} 30%,${hexToRGBA(theme.palette.background.default, 0.5)} 65%,${hexToRGBA(
        theme.palette.background.default,
        0.3,
      )} 75%,transparent)`;
    }
  };

  const ScrollWrapper: any = hidden ? Box : PerfectScrollbar;

  return (
    <Drawer {...props}>
      <VerticalNavHeader {...props} />
      {beforeVerticalNavMenuContent && beforeVerticalNavMenuContentPosition === 'fixed'
        ? beforeVerticalNavMenuContent(props)
        : null}
      {(beforeVerticalNavMenuContentPosition === 'static' || !beforeVerticalNavMenuContent) && (
        <StyledBoxForShadow ref={shadowRef} sx={{ background: shadowBgColor() }} />
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
                component: 'div', // Specify a component type
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
