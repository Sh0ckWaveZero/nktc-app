'use client';

// ** React Imports
import { useEffect, useCallback, useRef, useState } from 'react';

// ** Next Imports
import { useRouter } from 'next/navigation';

// ** MUI Imports
import Box from '@mui/material/Box';
import MuiDialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import InputAdornment from '@mui/material/InputAdornment';
import MuiAutocomplete, { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';

// ** Icons Imports
import {
  Close,
  FileRemoveOutline,
  Magnify,
  SubdirectoryArrowLeft,
} from 'mdi-material-ui';

// ** Types Imports
import { Settings } from '@/@core/context/settingsContext';

// ** Configs Imports
import themeConfig from '@/configs/themeConfig';

// ** Custom Components Imports
import UserIcon from '@/layouts/components/UserIcon';

// ** API Icon Import with object
import { autocompleteIconObj } from './autocompleteIconObj';
import { AppBarSearchType } from '@/@core/layouts/types';
import { useAppbarStore } from '@/store/index';

const LinkStyled = styled(Box)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  cursor: 'pointer',
  width: '100%',
}));

interface Props {
  hidden: boolean;
  settings: Settings;
}

interface NoResultProps {
  value: string;
}

// Removed hardcoded defaultSuggestionsData - now using API data

const categoryTitle: { [k: string]: string } = {
  // Original categories
  dashboards: 'Dashboards',
  appsPages: 'Apps & Pages',
  userInterface: 'User Interface',
  formsTables: 'Forms & Tables',
  chartsMisc: 'Charts & Misc',

  // Thai system categories
  main: 'หน้าหลัก',
  'manage-data': 'จัดการข้อมูล',
  settings: 'การตั้งค่าระบบ',
  'check-in': 'เช็คชื่อ',
  goodness: 'บันทึกความดี',
  badness: 'บันทึกพฤติกรรมที่ไม่เหมาะสม',
  visit: 'บันทึกเยี่ยมบ้าน',
  reports: 'รายงาน',
  'admin-reports': 'รายงาน - ผู้ดูแลระบบ',
  student: 'นักเรียน',
};

// ** Styled Autocomplete component
const Autocomplete = styled(MuiAutocomplete)(({ theme }) => ({
  '& fieldset': {
    border: 0,
  },
  '& + .MuiAutocomplete-popper': {
    borderTop: `1px solid ${theme.palette.divider}`,
    '& .MuiAutocomplete-listbox': {
      paddingTop: 0,
      height: '100%',
      maxHeight: 'inherit',
      '& .MuiListSubheader-root': {
        top: 0,
        fontWeight: 400,
        lineHeight: '15px',
        fontSize: '0.75rem',
        letterSpacing: '1px',
        color: theme.palette.text.disabled,
        padding: theme.spacing(3.75, 6, 0.75),
      },
    },
    '& .MuiAutocomplete-paper': {
      border: 0,
      height: '100%',
      borderRadius: 0,
      boxShadow: 'none',
    },
    '& .MuiListItem-root.suggestion': {
      padding: 0,
      '& .MuiListItemSecondaryAction-root': {
        display: 'flex',
      },
      '&.Mui-focused.Mui-focusVisible, &:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '& .MuiListItemButton-root: hover': {
        backgroundColor: 'transparent',
      },
      '&:not(:hover)': {
        '& .MuiListItemSecondaryAction-root': {
          display: 'none',
        },
        '&.Mui-focused, &.Mui-focused.Mui-focusVisible:not(:hover)': {
          '& .MuiListItemSecondaryAction-root': {
            display: 'flex',
          },
        },
        [theme.breakpoints.down('sm')]: {
          '&.Mui-focused:not(.Mui-focusVisible) .MuiListItemSecondaryAction-root': {
            display: 'none',
          },
        },
      },
    },
    '& .MuiAutocomplete-noOptions': {
      display: 'grid',
      minHeight: '100%',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: theme.spacing(10),
    },
  },
}));

// ** Styled Dialog component
const Dialog = styled(MuiDialog)({
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)',
  },
  '& .MuiDialog-paper': {
    overflow: 'hidden',
    '&:not(.MuiDialog-paperFullScreen)': {
      height: '100%',
      maxHeight: 550,
    },
  },
});

const NoResult = ({ value }: NoResultProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <FileRemoveOutline sx={{ mb: 2.5, fontSize: '5rem', color: 'text.primary' }} />
      <Typography variant='h6' sx={{ mb: 11.5, wordWrap: 'break-word' }}>
        ไม่พบผลลัพธ์สำหรับ{' '}
        <Typography variant='h6' component='span' sx={{ wordWrap: 'break-word' }}>
          {`"${value}"`}
        </Typography>
      </Typography>
    </Box>
  );
};

const AutocompleteComponent = ({ hidden, settings }: Props) => {
  // UI removed as requested
  return null;
};

export default AutocompleteComponent;
