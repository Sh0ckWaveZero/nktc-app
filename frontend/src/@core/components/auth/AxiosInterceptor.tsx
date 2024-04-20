import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
// ** React Imports
import { Fragment, useEffect, useState } from 'react';

import IconifyIcon from '../icon';
import { authConfig } from '@/configs/auth';
import httpClient from '../../utils/http';
import timeoutAnimation from '../../animations/TimeoutAnimation.json';
import { useAuth } from '../../../hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRouter } from 'next/router';

/**
 * Catch the Unauthorized Request
 */
const UnauthorizedDialog = ({ open, handleClose }: any) => (
  <Dialog
    aria-describedby='alert-dialog-description'
    aria-labelledby='alert-dialog-title'
    disableEscapeKeyDown
    fullScreen={useMediaQuery(useTheme().breakpoints.down('md'))}
    open={open}
    onClose={(event, reason) => {
      if (reason !== 'backdropClick') {
        handleClose();
      }
    }}
    sx={{
      '& .MuiPaper-root': {
        borderRadius: '0.625rem',
      },
    }}
  >
    <DialogTitle
      id='alert-dialog-title'
      sx={{
        fontFamily: 'Prompt,Sarabun, sans-serif',
        fontWeight: 'bold',
      }}
    >
      เนื่องจากไม่ได้รับการอนุญาตหรือหมดอายุการใช้งาน
    </DialogTitle>
    <DialogContent>
      
    </DialogContent>
    <DialogActions
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        fullWidth
        onClick={handleClose}
        color='success'
        autoFocus
        sx={{
          fontFamily: 'Prompt,Sarabun, sans-serif',
          borderRadius: '0.4rem',
        }}
        size='medium'
        variant='contained'
        startIcon={<IconifyIcon icon='line-md:login' color='#fff' width='1.5rem' height='1.5rem' />}
      >
        ลงชื่อเข้าใช้อีกครั้ง
      </Button>
    </DialogActions>
  </Dialog>
);

const AxiosInterceptor = ({ children }: any) => {
  // ** Hooks
  const { logout } = useAuth();
  const router = useRouter();
  const useLocal = useLocalStorage();

  const [open, setOpen] = useState(false);

  const refreshToken = async () => {
    const storedToken = localStorage.getItem('refresh_token');
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: authConfig.refreshTokenEndpoint as string,
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    };

    try {
      const response = await httpClient.request(config);
      console.log(JSON.stringify(response.data));
      useLocal.setToken(response?.data?.access_token);
      window.localStorage.setItem('refresh_token', response?.data?.refresh_token);
      router.reload();
    } catch (error) {
      setOpen(false);
      logout();
      router.push('/login');
    }
  };

  const handleClose = () => {
    setOpen(false);
    refreshToken();
  };

  const handleErrorResponse = (error: any) => {
    if (error?.response?.status === 401) {
      setOpen(true);
    } else {
      return Promise.reject(error);
    }
  };

  useEffect(() => {
    httpClient.interceptors.response.use((response) => response, handleErrorResponse);
  }, [router.route]);

  return (
    <Fragment>
      <UnauthorizedDialog open={open} handleClose={handleClose} />
      {children}
    </Fragment>
  );
};

export { AxiosInterceptor };
