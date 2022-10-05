// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** MUI Imports
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ** Icons Imports

// ** Context
import { useAuth } from '@/hooks/useAuth';

// ** Type Imports
import { Settings } from '@/@core/context/settingsContext';
import { useUserStore } from '@/store/index';
import { AccountOutline, CogOutline, EmailOutline, LogoutVariant } from 'mdi-material-ui';

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

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props;

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  // ** Hooks
  const router = useRouter();
  // const { logout } = useAuth();
  const { userInfo, logout } = useUserStore();

  // ** Vars
  const { direction } = settings;

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

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Avatar
          alt={userInfo?.username}
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src='/images/avatars/1.png'
        />
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
              <Avatar alt={userInfo?.username} src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
            </Badge>
            <Box
              sx={{
                ml: 3,
                display: 'flex',
                alignItems: 'flex-start',
                flexDirection: 'column',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>{userInfo?.username ?? '-'}</Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                {userInfo?.role ?? '-'}
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
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
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
    </Fragment>
  );
};

export default UserDropdown;
