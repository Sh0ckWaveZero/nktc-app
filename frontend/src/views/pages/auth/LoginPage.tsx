'use client';

// ** React Imports
import { useState, type MouseEvent, useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

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
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import httpClient from '@/@core/utils/http';
import { useSettings } from '@/@core/hooks/useSettings';
import ModeToggler from '@/@core/layouts/components/shared-components/ModeToggler';
import { authConfig } from '@/configs/auth';
import OtpInput from '@/@core/components/otp-input/otp-input';
import { authClient } from '@/libs/better-auth/client';
import { exchangeBetterAuthSession } from '@/libs/better-auth/exchange-session';
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
  mfaError: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุ',
  passkeyError: 'ไม่สามารถเข้าสู่ระบบด้วย Passkey ได้',
} as const;

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
} as const;

const emptySubscribe = () => () => {};
const getPasskeySupport = (): boolean => window.isSecureContext && 'PublicKeyCredential' in window;

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
        autoComplete='username webauthn'
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
                {showPassword ? <EyeOutline aria-hidden='true' /> : <EyeOffOutline aria-hidden='true' />}
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

interface MfaFormProps {
  code: string;
  isBackupCode: boolean;
  isLoading: boolean;
  error?: string;
  trustDevice: boolean;
  onBack: () => void;
  onCodeChange: (value: string) => void;
  onAutoSubmit: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleBackupCode: () => void;
  onTrustDeviceChange: (value: boolean) => void;
}

const MfaForm = ({
  code,
  isBackupCode,
  isLoading,
  error,
  trustDevice,
  onBack,
  onCodeChange,
  onAutoSubmit,
  onSubmit,
  onToggleBackupCode,
  onTrustDeviceChange,
}: MfaFormProps) => (
  <Box
    component={isBackupCode ? 'form' : 'div'}
    id='login-mfa-form'
    onSubmit={isBackupCode ? onSubmit : undefined}
    sx={{ width: '100%' }}
  >
    <Typography variant='h6' component='h2' sx={{ mb: 1, textAlign: 'center' }}>
      ยืนยันตัวตนสองขั้นตอน
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 3, textAlign: 'center' }}>
      {isBackupCode ? 'กรอกรหัสสำรองหนึ่งรหัส' : 'กรอกรหัส 6 หลักจากแอปยืนยันตัวตน'}
    </Typography>
    {isBackupCode ? (
      <TextField
        id='login-mfa-code'
        autoFocus
        fullWidth
        required
        label='รหัสสำรอง'
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
        autoComplete='one-time-code'
        error={Boolean(error)}
        helperText={error}
        slotProps={{
          htmlInput: {
            inputMode: 'text',
            maxLength: 64,
          },
        }}
        sx={{ mb: 1.5 }}
      />
    ) : (
      <Box sx={{ mb: 1.5, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <OtpInput
          id='login-mfa-code'
          value={code}
          onChange={(value) => {
            onCodeChange(value);
            if (value.length === 6 && !isLoading) onAutoSubmit(value);
          }}
          label=''
          helperText={error || (isLoading ? 'กำลังตรวจสอบรหัสยืนยัน…' : '')}
          error={Boolean(error)}
          disabled={isLoading}
          autoFocus
        />
      </Box>
    )}
    <FormControlLabel
      control={
        <Checkbox
          checked={trustDevice}
          onChange={(event) => onTrustDeviceChange(event.target.checked)}
          slotProps={{ input: { 'aria-label': 'เชื่อถืออุปกรณ์นี้ 30 วัน' } }}
        />
      }
      label='เชื่อถืออุปกรณ์นี้ 30 วัน'
      sx={{ mb: 1 }}
    />
    {isBackupCode ? (
      <Button
        id='login-mfa-submit'
        fullWidth
        size='large'
        type='submit'
        variant='contained'
        disabled={isLoading || !code.trim()}
        sx={{ minHeight: 48, mb: 1.5 }}
      >
        {isLoading ? <CircularProgress size={20} color='inherit' aria-label='กำลังตรวจสอบ' /> : 'ยืนยันและเข้าสู่ระบบ'}
      </Button>
    ) : null}
    <Button fullWidth type='button' onClick={onToggleBackupCode} disabled={isLoading}>
      {isBackupCode ? 'ใช้รหัสจากแอปยืนยันตัวตน' : 'ใช้รหัสสำรอง'}
    </Button>
    <Button fullWidth type='button' color='secondary' onClick={onBack} disabled={isLoading}>
      กลับไปหน้าเข้าสู่ระบบ
    </Button>
  </Box>
);

// ** Main Component
const LoginPage = () => {
  // ** State
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string>();
  const [trustDevice, setTrustDevice] = useState(false);

  // ** Refs
  const usernameRef = useRef<HTMLInputElement>(null);

  // ** Hooks
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { settings, saveSettings } = useSettings();
  const isPasskeySupported = useSyncExternalStore(emptySubscribe, getPasskeySupport, () => false);

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

  const completeLogin = useCallback(async () => {
    await exchangeBetterAuthSession();
    const returnUrl = searchParams.get('returnUrl');
    const isSafeUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/';
    window.location.href = isSafeUrl ? returnUrl : '/home';
  }, [searchParams]);

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      const toastId = toast.loading(TOAST_MESSAGES.loading, TOAST_OPTIONS);
      setIsAuthenticating(true);
      try {
        await httpClient.post(authConfig.prepareBetterAuthEndpoint as string, data);
        const result = await authClient.signIn.username({
          username: data.username,
          password: data.password,
        });

        if (result.error) {
          throw new Error(result.error.message || 'Better Auth sign-in failed');
        }

        const authData = result.data as { twoFactorRedirect?: boolean } | null;
        if (authData?.twoFactorRedirect) {
          toast.dismiss(toastId);
          setMfaCode('');
          setMfaError(undefined);
          setIsMfaStep(true);
          return;
        }

        await completeLogin();
        toast.dismiss(toastId);
      } catch {
        toast.update(toastId, {
          render: TOAST_MESSAGES.error,
          type: 'error',
          isLoading: false,
          autoClose: TOAST_OPTIONS.autoClose,
        });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [completeLogin],
  );

  const handleMfaSubmit = useCallback(
    async (code = mfaCode) => {
      if (!code.trim() || isAuthenticating) return;

      setIsAuthenticating(true);
      setMfaError(undefined);
      try {
        const result = isBackupCode
          ? await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice })
          : await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice });

        if (result.error) {
          throw new Error(result.error.message || 'MFA verification failed');
        }

        if (!result.data) {
          throw new Error('MFA verification did not return an authenticated session');
        }

        await completeLogin();
      } catch {
        setMfaError(TOAST_MESSAGES.mfaError);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [completeLogin, isAuthenticating, isBackupCode, mfaCode, trustDevice],
  );

  const handlePasskeyLogin = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result.error) {
        if ('code' in result.error && result.error.code === 'AUTH_CANCELLED') return;
        throw new Error(result.error.message || 'Passkey sign-in failed');
      }
      await completeLogin();
    } catch {
      toast.error(TOAST_MESSAGES.passkeyError, TOAST_OPTIONS);
    } finally {
      setIsAuthenticating(false);
    }
  }, [completeLogin]);

  const handleBackToCredentials = useCallback(async () => {
    await authClient.signOut();
    setIsMfaStep(false);
    setIsBackupCode(false);
    setMfaCode('');
    setMfaError(undefined);
  }, []);

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
        <Box
          id='login-theme-toggle'
          sx={{
            position: 'fixed',
            top: { xs: 'max(12px, env(safe-area-inset-top))', sm: 20 },
            right: { xs: 'max(12px, env(safe-area-inset-right))', sm: 24 },
            zIndex: 1300,
            border: 1,
            borderColor: 'divider',
            borderRadius: '50%',
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <ModeToggler settings={settings} saveSettings={saveSettings} />
        </Box>
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
              {!isMfaStep ? <WelcomeText /> : null}

              {isMfaStep ? (
                <MfaForm
                  code={mfaCode}
                  isBackupCode={isBackupCode}
                  isLoading={isAuthenticating}
                  error={mfaError}
                  trustDevice={trustDevice}
                  onBack={handleBackToCredentials}
                  onCodeChange={(value) => {
                    setMfaCode(value);
                    if (mfaError) setMfaError(undefined);
                  }}
                  onAutoSubmit={(value) => void handleMfaSubmit(value)}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleMfaSubmit();
                  }}
                  onToggleBackupCode={() => {
                    setIsBackupCode((value) => !value);
                    setMfaCode('');
                    setMfaError(undefined);
                  }}
                  onTrustDeviceChange={setTrustDevice}
                />
              ) : (
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
                  <UsernameField control={control} errors={errors} inputRef={usernameRef} shouldAutoFocus={isDesktop} />
                  <PasswordField
                    control={control}
                    errors={errors}
                    showPassword={showPassword}
                    onTogglePassword={handleTogglePassword}
                    onMouseDownPassword={handleMouseDownPassword}
                  />
                  <SubmitButton isLoading={isAuthenticating} />
                  {isPasskeySupported ? (
                    <>
                      <Divider sx={{ my: 2.5 }}>หรือ</Divider>
                      <Button
                        id='login-passkey-button'
                        fullWidth
                        size='large'
                        type='button'
                        variant='outlined'
                        disabled={isAuthenticating}
                        onClick={handlePasskeyLogin}
                        sx={{ minHeight: { xs: 44, sm: 48 }, textTransform: 'none' }}
                      >
                        เข้าสู่ระบบด้วย Passkey
                      </Button>
                    </>
                  ) : null}
                </Box>
              )}
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
