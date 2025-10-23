'use client';

// ** React Imports
import { useState, MouseEvent } from 'react';

// ** MUI Components
import {
  Box,
  Button,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  CardContent,
  FormControl,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiCard, { CardProps } from '@mui/material/Card';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';

// ** Form & Validation
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ** Hooks & Utils
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// ** Components
import FooterIllustrationsV1 from '@/views/pages/auth/FooterIllustration';

// ** Types
interface LoginFormData {
  username: string;
  password: string;
}

// ** Constants
const VALIDATION_SCHEMA = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

const DEFAULT_VALUES: LoginFormData = {
  username: '',
  password: '',
};

const LOGO_CONFIG = {
  src: '/images/pages/nktc-student-light.png',
  alt: 'NKTC Logo',
  size: { xs: 160, sm: 160, md: 180 },
};

const ERROR_MESSAGES = {
  loginFailed: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
  loading: 'กำลังเข้าสู่ระบบ...',
};

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: '100vh',
    boxShadow: 'none',
    borderRadius: 0,
  },
  [theme.breakpoints.up('sm')]: {
    width: '28rem',
  },
}));

const LoginPage = () => {
  // ** State
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // ** Hooks
  const auth = useAuth();

  // ** Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
    resolver: zodResolver(VALIDATION_SCHEMA),
  });

  // ** Handlers
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleLoginError = (toastId: string | number) => () => {
    toast.error(ERROR_MESSAGES.loginFailed, {
      id: toastId.toString(),
      duration: 4000,
    });
  };

  const onSubmit = async (data: LoginFormData) => {
    const toastId = toast.loading(ERROR_MESSAGES.loading);

    try {
      await auth.login({ username: data.username, password: data.password }, handleLoginError(toastId));

      // ปิด loading toast เมื่อ login สำเร็จ (จะ redirect ทันที)
      toast.dismiss(toastId);
    } catch {
      // Error จะถูกจัดการโดย handleLoginError callback
    }
  };

  return (
    <Box
      className='content-center'
      sx={{
        minHeight: { xs: '100vh', sm: 'auto' },
        height: { xs: '100vh', sm: 'auto' },
        overflow: { xs: 'hidden', sm: 'visible' },
      }}
    >
      <Card sx={{ zIndex: 1 }}>
        <CardContent
          sx={{
            padding: {
              xs: (theme) => `${theme.spacing(3, 4, 3)} !important`,
              sm: (theme) => `${theme.spacing(12, 9, 7)} !important`,
            },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: { xs: '100vh', sm: 'auto' },
            overflow: { xs: 'auto', sm: 'visible' },
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              mb: { xs: 2, sm: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component='img'
              src={LOGO_CONFIG.src}
              alt={LOGO_CONFIG.alt}
              sx={{
                width: LOGO_CONFIG.size,
                height: LOGO_CONFIG.size,
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Welcome Text */}
          <Box sx={{ mb: { xs: 2, sm: 6 }, textAlign: 'center' }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                marginBottom: 1.5,
                color: 'text.primary',
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
              }}
            >
              ยินดีต้อนรับสู่ ระบบช่วยเหลือผู้เรียน
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              }}
            >
              กรุณาลงชื่อเข้าใช้บัญชีของคุณและเริ่มการใช้งาน
            </Typography>
          </Box>

          {/* Login Form */}
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <Controller
              name='username'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  label='ชื่อผู้ใช้งาน'
                  sx={{ mb: { xs: 2, sm: 4 } }}
                  error={Boolean(errors.username)}
                  helperText={errors.username?.message}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mb: { xs: 2, sm: 4 } }} error={Boolean(errors.password)}>
                  <InputLabel htmlFor='auth-login-password'>รหัสผ่าน</InputLabel>
                  <OutlinedInput
                    {...field}
                    label='รหัสผ่าน'
                    id='auth-login-password'
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          aria-label='toggle password visibility'
                        >
                          {showPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Submit Button */}
            <Button
              fullWidth
              size='large'
              variant='contained'
              type='submit'
              sx={{
                marginTop: { xs: 2, sm: 0 },
                height: '48px',
                fontSize: '1rem',
              }}
            >
              ลงชื่อเข้าใช้
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Illustration (Desktop Only) */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <FooterIllustrationsV1 />
      </Box>
    </Box>
  );
};

export default LoginPage;
