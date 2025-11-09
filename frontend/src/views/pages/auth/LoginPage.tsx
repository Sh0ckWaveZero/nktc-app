'use client';

// ** React Imports
import { useState, MouseEvent, useCallback } from 'react';

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
  GlobalStyles,
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
import { toast } from 'react-toastify';

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
  size: { xs: 120, sm: 140, md: 160, lg: 180 },
};

const TOAST_MESSAGES = {
  loading: 'กำลังเข้าสู่ระบบ...',
  success: 'เข้าสู่ระบบสำเร็จ',
  error: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
};

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const LOGIN_TIMEOUT = 200;

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.up('xs')]: {
    width: '100%',
    maxWidth: '100%',
    height: '100vh',
    minHeight: '100vh',
    boxShadow: 'none',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
  },
  [theme.breakpoints.up('sm')]: {
    width: '90%',
    maxWidth: '28rem',
    minHeight: 'auto',
    height: 'auto',
    boxShadow: theme.shadows[8],
    borderRadius: theme.shape.borderRadius,
  },
  [theme.breakpoints.up('md')]: {
    width: '28rem',
    maxWidth: '28rem',
  },
  [theme.breakpoints.up('lg')]: {
    width: '32rem',
    maxWidth: '32rem',
  },
}));

// ** Sub Components
const Logo = () => (
  <Box
    id='login-logo-container'
    sx={{
      mb: { xs: 3, sm: 4, md: 5 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: '100%',
    }}
  >
    <Box
      id='login-logo'
      component='img'
      src={LOGO_CONFIG.src}
      alt={LOGO_CONFIG.alt}
      sx={{
        width: LOGO_CONFIG.size,
        height: LOGO_CONFIG.size,
        objectFit: 'contain',
        maxWidth: '100%',
        display: 'block',
      }}
    />
  </Box>
);

const WelcomeText = () => (
  <Box
    id='login-welcome-text-container'
    sx={{
      mb: { xs: 3, sm: 4, md: 5 },
      textAlign: 'center',
      flexShrink: 0,
      width: '100%',
    }}
  >
    <Typography
      id='login-welcome-title'
      variant='h6'
      sx={{
        fontWeight: 600,
        marginBottom: { xs: 0.75, sm: 1.5 },
        color: 'text.primary',
        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.375rem' },
        lineHeight: { xs: 1.4, sm: 1.5 },
      }}
    >
      ยินดีต้อนรับสู่ ระบบช่วยเหลือผู้เรียน
    </Typography>
    <Typography
      id='login-welcome-subtitle'
      variant='body2'
      sx={{
        color: 'text.secondary',
        fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem', lg: '0.9375rem' },
        lineHeight: { xs: 1.5, sm: 1.6 },
      }}
    >
      กรุณาลงชื่อเข้าใช้บัญชีของคุณและเริ่มการใช้งาน
    </Typography>
  </Box>
);

interface UsernameFieldProps {
  control: any;
  errors: any;
}

const UsernameField = ({ control, errors }: UsernameFieldProps) => (
  <Controller
    name='username'
    control={control}
    render={({ field }) => (
      <Box id='login-username-container'>
        <TextField
          {...field}
          id='login-username'
          name='username'
          autoFocus
          fullWidth
          label='ชื่อผู้ใช้งาน'
          sx={{
            mb: { xs: 2, sm: 3, md: 3.5, lg: 4 },
            '& .MuiInputBase-root': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
          }}
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          slotProps={{
            htmlInput: {
              'aria-describedby': errors.username ? 'login-username-error' : undefined,
            },
            formHelperText: {
              id: 'login-username-error',
              sx: {
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              },
            },
          }}
        />
      </Box>
    )}
  />
);

interface PasswordFieldProps {
  control: any;
  errors: any;
  showPassword: boolean;
  onTogglePassword: () => void;
  onMouseDownPassword: (event: MouseEvent<HTMLButtonElement>) => void;
}

const PasswordField = ({
  control,
  errors,
  showPassword,
  onTogglePassword,
  onMouseDownPassword,
}: PasswordFieldProps) => (
  <Controller
    name='password'
    control={control}
    render={({ field }) => (
      <Box id='login-password-container'>
        <FormControl
          id='login-password-form-control'
          fullWidth
          sx={{
            mb: { xs: 2, sm: 3, md: 3.5, lg: 4 },
            '& .MuiInputBase-root': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            },
          }}
          error={Boolean(errors.password)}
        >
          <InputLabel id='login-password-label' htmlFor='login-password'>
            รหัสผ่าน
          </InputLabel>
          <OutlinedInput
            {...field}
            id='login-password'
            name='password'
            label='รหัสผ่าน'
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment id='login-password-adornment' position='end'>
                <IconButton
                  id='login-password-toggle'
                  edge='end'
                  onClick={onTogglePassword}
                  onMouseDown={onMouseDownPassword}
                  aria-label='toggle password visibility'
                  size='small'
                  sx={{
                    '& svg': {
                      fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    },
                  }}
                >
                  {showPassword ? <EyeOutline /> : <EyeOffOutline />}
                </IconButton>
              </InputAdornment>
            }
          />
          {errors.password && (
            <FormHelperText
              id='login-password-error'
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              }}
            >
              {errors.password.message}
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    )}
  />
);

const SubmitButton = () => (
  <Box id='login-submit-button-container'>
    <Button
      id='login-submit-button'
      fullWidth
      size='large'
      variant='contained'
      type='submit'
      sx={{
        marginTop: { xs: 0.5, sm: 0 },
        height: { xs: '44px', sm: '48px', md: '52px' },
        fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
        fontWeight: 600,
        textTransform: 'none',
        flexShrink: 0,
      }}
    >
      ลงชื่อเข้าใช้
    </Button>
  </Box>
);

// ** Main Component
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
  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleMouseDownPassword = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const createLoginPromise = useCallback(
    (username: string, password: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        let hasError = false;
        let isResolved = false;

        auth.login(
          { username, password },
          (error) => {
            if (!isResolved) {
              hasError = true;
              reject(error);
            }
          }
        );

        setTimeout(() => {
          if (!hasError && !isResolved) {
            isResolved = true;
            resolve();
          }
        }, LOGIN_TIMEOUT);
      });
    },
    [auth]
  );

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      const loginPromise = createLoginPromise(data.username, data.password);

      try {
        await toast.promise(loginPromise, TOAST_MESSAGES, TOAST_OPTIONS);
      } catch (error) {
        // Error จะถูกจัดการโดย toast.promise แล้ว
      }
    },
    [createLoginPromise]
  );

  return (
    <>
      <GlobalStyles
        styles={(theme) => ({
          '.layout-wrapper': {
            height: '100vh',
            overflow: 'hidden',
          },
          '.layout-wrapper .content-center': {
            padding: '0 !important',
            margin: '0 !important',
            width: '100%',
            height: '100vh',
            minHeight: '100vh',
            [theme.breakpoints.up('sm')]: {
              padding: `${theme.spacing(2)} !important`,
              height: 'auto',
              minHeight: 'auto',
            },
            [theme.breakpoints.up('md')]: {
              padding: `${theme.spacing(3)} !important`,
            },
            [theme.breakpoints.up('lg')]: {
              padding: `${theme.spacing(4)} !important`,
            },
            [theme.breakpoints.up('xl')]: {
              padding: `${theme.spacing(5)} !important`,
            },
          },
        })}
      />
      <Box
        id='login-page-container'
        className='content-center'
        sx={{
          minHeight: { xs: '100vh', sm: 'auto' },
          height: { xs: '100vh', sm: 'auto' },
          overflow: { xs: 'hidden', sm: 'visible' },
          boxSizing: 'border-box',
          width: '100%',
          margin: 0,
        }}
      >
        <Card id='login-card' sx={{ zIndex: { xs: 0, sm: 1 } }}>
          <CardContent
            id='login-card-content'
            sx={{
              padding: {
                xs: (theme) => `${theme.spacing(3, 2.5, 3)} !important`,
                sm: (theme) => `${theme.spacing(6, 5, 6)} !important`,
                md: (theme) => `${theme.spacing(8, 7, 8)} !important`,
              },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              flex: 1,
              height: { xs: '100vh', sm: 'auto' },
              minHeight: { xs: '100vh', sm: 'auto' },
              overflow: { xs: 'hidden', sm: 'visible' },
              boxSizing: 'border-box',
            }}
          >
            <Logo />
            <WelcomeText />

            <form
              id='login-form'
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(onSubmit)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <UsernameField control={control} errors={errors} />
              <PasswordField
                control={control}
                errors={errors}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
                onMouseDownPassword={handleMouseDownPassword}
              />
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <Box id='login-footer-illustration' sx={{ display: { xs: 'none', sm: 'block' } }}>
          <FooterIllustrationsV1 />
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
