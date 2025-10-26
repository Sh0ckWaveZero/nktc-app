'use client';

// ** React Imports
import React from 'react';

// ** MUI Imports
import { useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

// ** Type Import
import { Settings } from '@/@core/context/settingsContext';

interface Props {
  hidden: boolean;
  navWidth: number;
  navHover: boolean;
  settings: Settings;
  navVisible: boolean;
  children: React.ReactNode;
  collapsedNavWidth: number;
  navigationBorderWidth: number;
  setNavHover: (values: boolean) => void;
  setNavVisible: (value: boolean) => void;
}

const Drawer = (props: Props) => {
  // ** Props
  const {
    hidden,
    children,
    navHover,
    navWidth,
    settings,
    navVisible,
    setNavHover,
    setNavVisible,
    collapsedNavWidth,
    navigationBorderWidth,
  } = props;

  // ** Hook
  const theme = useTheme();

  // ** Vars
  const { navCollapsed } = settings;

  // Drawer Props for Mobile & Tablet screens
  const MobileDrawerProps = {
    open: navVisible,
    onOpen: () => setNavVisible(true),
    onClose: () => setNavVisible(false),
    ModalProps: {
      keepMounted: true, // Better open performance on mobile.
    },
  };

  // Drawer Props for Desktop screens
  const DesktopDrawerProps = {
    open: true,
    onOpen: () => null,
    onClose: () => null,
    onMouseEnter: () => {
      // Only expand on hover when collapsed
      if (navCollapsed) {
        setNavHover(true);
      }
    },
    onMouseLeave: () => {
      if (navCollapsed) {
        setNavHover(false);
      }
    },
  };

  return (
    <SwipeableDrawer
      className='layout-vertical-nav'
      variant={hidden ? 'temporary' : 'permanent'}
      {...(hidden ? { ...MobileDrawerProps } : { ...DesktopDrawerProps })}
      sx={{
        overflowX: 'hidden',
        transition: 'width .25s ease-in-out',
        width: navCollapsed && !navHover ? collapsedNavWidth : navWidth,
        flexShrink: 0,
        '& ul': {
          listStyle: 'none',
        },
        '& .MuiListItem-gutters': {
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
        },
        '& .MuiDrawer-paper': {
          left: 'unset',
          right: 'unset',
          overflowX: 'hidden',
          transition: 'width .25s ease-in-out, box-shadow .25s ease-in-out',
          width: navCollapsed && !navHover ? collapsedNavWidth : navWidth,
          '& .MuiListItemIcon-root': {
            fontSize: '1.3rem',
          },
          backgroundColor: theme.palette.background.paper,
          ...(!hidden && navCollapsed && navHover ? { boxShadow: 9 } : {}),
          borderRight: navigationBorderWidth === 0 ? 0 : `${navigationBorderWidth}px solid ${theme.palette.divider}`,
        },
      }}
    >
      {children}
    </SwipeableDrawer>
  );
};

export default Drawer;
