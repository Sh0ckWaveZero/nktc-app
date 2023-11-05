// ** React Imports
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import httpClient from '../../utils/http';
import IconifyIcon from '../icon';
import Lottie from 'lottie-react';
import timeoutAnimation from '../../animations/TimeoutAnimation.json';

/**
 * Catch the Unauthorized Request
 */
const AxiosInterceptor = ({ children }: any) => {
  // ** Hooks
  const { logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    logout();
    router.push('/login');
  };

  useEffect(() => {
    httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          setOpen(true);
        } else {
          return Promise.reject(error);
        }
      },
    );
  }, [router.route]);

  return (
    <Fragment>
      <Dialog
        aria-describedby='alert-dialog-description'
        aria-labelledby='alert-dialog-title'
        disableEscapeKeyDown
        fullScreen={fullScreen}
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
          <Lottie animationData={timeoutAnimation} loop={5} />
          <DialogContentText
            id='alert-dialog-description'
            sx={{
              fontFamily: 'Prompt,Sarabun, sans-serif',
            }}
          >
            กรุณาเข้าสู่ระบบใหม่อีกครั้ง
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
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
      {children}
    </Fragment>
  );
};

export { AxiosInterceptor };
