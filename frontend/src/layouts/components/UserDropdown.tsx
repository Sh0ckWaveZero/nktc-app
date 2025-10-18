'use client';

import { AccountOutline, CogOutline, EmailOutline, LogoutVariant } from 'mdi-material-ui';
import React, { Fragment, SyntheticEvent, useState } from 'react';

import { Avatar, CircularProgress } from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CustomAvatar from '@/@core/components/mui/avatar';
import Divider from '@mui/material/Divider';
import { LocalStorageService } from '@/services/localStorageService';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Settings } from '@/@core/context/settingsContext';
import Typography from '@mui/material/Typography';
import { getInitials } from '@/@core/utils/get-initials';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import { useRouter } from 'next/navigation';

interface Props {
  settings: Settings;
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
}));

const localStorageService = new LocalStorageService();

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props;

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  // ** Hooks
  const router = useRouter();
  const { user, logout } = useAuth();

  // ** Vars
  const { direction } = settings;
  const storedToken = localStorageService.getToken()!;

  const { isLoading, image } = useGetImage(user?.account?.avatar as string, storedToken);

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url);
    }
    setAnchorEl(null);
  };

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      fontSize: '1.375rem',
      color: 'text.secondary',
    },
  };

  const handleLogout = () => {
    logout();
    handleDropdownClose('/login');
  };

  const customAvatar = (row: any) => {
    if (row?.avatar) {
      {
        return isLoading ? (
          <CircularProgress
            size={40}
            sx={{
              mr: (theme) => theme.spacing(6.25),
            }}
          />
        ) : (
          <CustomAvatar src={image as string} sx={{ width: 40, height: 40 }} />
        );
      }
    } else {
      return (
        <CustomAvatar skin='light' color={row?.avatarColor || 'primary'} sx={{ width: 40, height: 40 }}>
          {getInitials(row?.firstName + ' ' + row?.lastName)}
        </CustomAvatar>
      );
    }
  };

  const avatarAccount = () => {
    return user?.role === 'Admin' ? (
      <Avatar alt={user?.username} src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
    ) : (
      customAvatar(user?.account)
    );
  };

  return (
    <React.Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, mr: 3, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {avatarAccount()}
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: direction === 'ltr' ? 'right' : 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: direction === 'ltr' ? 'right' : 'left',
        }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              {avatarAccount()}
            </Badge>
            <Box
              sx={{
                ml: 3,
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
              }}
            >
              <Typography variant={'button'} sx={{ fontWeight: 600 }}>
                {user?.account ? user?.account?.firstName + ' ' + user?.account?.lastName : '-'}
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                {user?.role ?? '-'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 0, mb: 1 }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/pages/account-settings')}>
          <Box sx={styles}>
            <AccountOutline sx={{ mr: 2 }} />
            ข้อมูลส่วนตัว
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/pages/history')}>
          <Box sx={styles}>
            <EmailOutline sx={{ mr: 2 }} />
            ประวัติการใช้งาน
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <CogOutline sx={{ mr: 2 }} />
            การตั้งค่า
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }} onClick={handleLogout}>
          <LogoutVariant
            sx={{
              mr: 2,
              fontSize: '1.375rem',
              color: 'text.secondary',
            }}
          />
          ออกจากระบบ
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default UserDropdown;
