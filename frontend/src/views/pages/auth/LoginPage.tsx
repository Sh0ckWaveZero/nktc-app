'use client';

// ** React Imports
import { useState, type MouseEvent, useCallback, useEffect, useRef } from 'react';

// ** MUI Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import GlobalStyles from '@mui/material/GlobalStyles';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import MuiCard, { type CardProps } from '@mui/material/Card';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';

// ** Form & Validation
import { Controller, useForm, type Control, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ** Next Imports
import { useSearchParams } from 'next/navigation';

// ** Hooks & Utils
import { useLogin } from '@/hooks/queries/useAuth';
import { toast } from 'react-toastify';

// ** Components
import FooterIllustrationsV1 from '@/views/pages/auth/FooterIllustration';

// ** Types
type LoginFormData = z.infer<typeof VALIDATION_SCHEMA>;

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
  size: { xs: 100, sm: 120, md: 140, lg: 160 },
} as const;

const TOAST_MESSAGES = {
  loading: 'กำลังเข้าสู่ระบบ\u2026',
  success: 'เข้าสู่ระบบสำเร็จ',
  error: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
} as const;

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
} as const;

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.up('xs')]: {
    width: '100%',
    maxWidth: '100%',
    height: '100dvh',
    minHeight: '100dvh',
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
    borderRadius: Number(theme.shape.borderRadius) * 2,
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

// ** Sub Components (hoisted static JSX — rendering-hoist-jsx)
const Logo = () => (
  <Box
    id='login-logo-container'
    sx={{
      mb: { xs: 2, sm: 3, md: 4 },
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
      width={160}
      height={160}
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
      mb: { xs: 2, sm: 3, md: 4 },
      textAlign: 'center',
      flexShrink: 0,
      width: '100%',
    }}
  >
    <Typography
      id='login-welcome-title'
      variant='h6'
      component='h1'
      sx={{
        fontWeight: 600,
        marginBottom: { xs: 0.5, sm: 1 },
        color: 'text.primary',
        fontSize: { xs: '0.9375rem', sm: '1.0625rem', md: '1.1875rem', lg: '1.3125rem' },
        lineHeight: { xs: 1.4, sm: 1.5 },
        textWrap: 'balance',
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
        textWrap: 'pretty',
      }}
    >
      กรุณาลงชื่อเข้าใช้บัญชีของคุณและเริ่มการใช้งาน
    </Typography>
  </Box>
);

interface UsernameFieldProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  shouldAutoFocus: boolean;
}

const UsernameField = ({ control, errors, inputRef, shouldAutoFocus }: UsernameFieldProps) => (
  <Controller
    name='username'
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        inputRef={inputRef}
        id='login-username'
        name='username'
        autoFocus={shouldAutoFocus}
        fullWidth
        label='ชื่อผู้ใช้งาน'
        autoComplete='username'
        spellCheck={false}
        sx={{
          mb: { xs: 1.5, sm: 2.5, md: 3, lg: 3.5 },
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
            'aria-invalid': errors.username ? true : undefined,
          },
          formHelperText: {
            id: 'login-username-error',
            role: 'alert',
            sx: {
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            },
          },
        }}
      />
    )}
  />
);

interface PasswordFieldProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
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
      <FormControl
        id='login-password-form-control'
        fullWidth
        sx={{
          mb: { xs: 1.5, sm: 2.5, md: 3, lg: 3.5 },
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
          autoComplete='current-password'
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          aria-invalid={errors.password ? true : undefined}
          slotProps={{
            input: {
              spellCheck: false,
            },
          }}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                id='login-password-toggle'
                edge='end'
                onClick={onTogglePassword}
                onMouseDown={onMouseDownPassword}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                size='small'
                sx={{
                  '& svg': {
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  },
                }}
              >
                {showPassword ? (
                  <EyeOutline aria-hidden='true' />
                ) : (
                  <EyeOffOutline aria-hidden='true' />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
        {errors.password ? (
          <FormHelperText
            id='login-password-error'
            role='alert'
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            }}
          >
            {errors.password.message}
          </FormHelperText>
        ) : null}
      </FormControl>
    )}
  />
);

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton = ({ isLoading }: SubmitButtonProps) => (
  <Button
    id='login-submit-button'
    fullWidth
    size='large'
    variant='contained'
    type='submit'
    disabled={isLoading}
    aria-busy={isLoading}
    sx={{
      marginTop: { xs: 0.5, sm: 0 },
      height: { xs: '44px', sm: '48px', md: '52px' },
      fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
      fontWeight: 600,
      textTransform: 'none',
      flexShrink: 0,
      touchAction: 'manipulation',
      gap: 1,
    }}
  >
    {isLoading ? (
      <>
        <CircularProgress size={20} color='inherit' aria-hidden='true' />
        กำลังเข้าสู่ระบบ&#x2026;
      </>
    ) : (
      'ลงชื่อเข้าใช้'
    )}
  </Button>
);

// ** Main Component
const LoginPage = () => {
  // ** State
  const [showPassword, setShowPassword] = useState(false);

  // ** Refs
  const usernameRef = useRef<HTMLInputElement>(null);

  // ** Hooks
  const { mutateAsync: loginMutation, isPending } = useLogin();
  const searchParams = useSearchParams();
  const theme = useTheme();

  // autoFocus only on desktop — avoids keyboard pop-up on mobile
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  // ** Form
  const {
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
    resolver: zodResolver(VALIDATION_SCHEMA),
  });

  // Focus first error field on validation failure
  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0] as keyof LoginFormData | undefined;
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  }, [errors, setFocus]);

  // ** Handlers
  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleMouseDownPassword = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      const toastId = toast.loading(TOAST_MESSAGES.loading, TOAST_OPTIONS);
      try {
        await loginMutation({ username: data.username, password: data.password });
        toast.dismiss(toastId);
        // Use hard redirect so initAuth re-runs with the fresh token from localStorage
        const returnUrl = searchParams.get('returnUrl');
        const isSafeUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/';
        window.location.href = isSafeUrl ? returnUrl : '/home';
      } catch {
        toast.update(toastId, {
          render: TOAST_MESSAGES.error,
          type: 'error',
          isLoading: false,
          autoClose: TOAST_OPTIONS.autoClose,
        });
      }
    },
    [loginMutation, searchParams],
  );

  return (
    <>
      <GlobalStyles
        styles={(theme) => ({
          '.layout-wrapper': {
            height: '100dvh',
            overflow: 'hidden',
          },
          '.layout-wrapper .content-center': {
            padding: '0 !important',
            margin: '0 !important',
            width: '100%',
            height: '100dvh',
            minHeight: '100dvh',
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
          minHeight: { xs: '100dvh', sm: 'auto' },
          height: { xs: '100dvh', sm: 'auto' },
          overflow: { xs: 'auto', sm: 'visible' },
          overscrollBehavior: 'contain',
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
                xs: `env(safe-area-inset-top, 16px) max(env(safe-area-inset-right, 0px), 20px) max(env(safe-area-inset-bottom, 0px), 24px) max(env(safe-area-inset-left, 0px), 20px) !important`,
                sm: (theme) => `${theme.spacing(5, 4, 5)} !important`,
                md: (theme) => `${theme.spacing(6, 5, 6)} !important`,
                lg: (theme) => `${theme.spacing(7, 6, 7)} !important`,
              },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              height: { xs: '100dvh', sm: 'auto' },
              minHeight: { xs: '100dvh', sm: 'auto' },
              overflow: { xs: 'auto', sm: 'visible' },
              boxSizing: 'border-box',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Logo />
              <WelcomeText />

              <Box
                component='form'
                id='login-form'
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <UsernameField
                  control={control}
                  errors={errors}
                  inputRef={usernameRef}
                  shouldAutoFocus={isDesktop}
                />
                <PasswordField
                  control={control}
                  errors={errors}
                  showPassword={showPassword}
                  onTogglePassword={handleTogglePassword}
                  onMouseDownPassword={handleMouseDownPassword}
                />
                <SubmitButton isLoading={isPending} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box id='login-footer-illustration' sx={{ display: { xs: 'none', md: 'block' } }}>
          <FooterIllustrationsV1 />
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
