import * as yup from 'yup';

import {
  Avatar,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  useMediaQuery,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import { Controller, useForm } from 'react-hook-form';
import { EyeOffOutline, EyeOutline } from 'mdi-material-ui';
import { ReactNode, useState } from 'react';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

import BlankLayout from '@/@core/layouts/BlankLayout';
import FooterIllustrationsV2 from '../../views/pages/auth/FooterIllustrationsV2';
import Link from 'next/link';
import themeConfig from '@/configs/themeConfig';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/@core/hooks/useSettings';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Styled Components
const LoginIllustrationWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10),
  },
}));

const LoginIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '35rem',
  },
}));

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450,
  },
}));

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: 400,
  },
}));

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { mt: theme.spacing(8) },
}));

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const schema = yup.object().shape({
  username: yup.string().required('กรุณากรอกชื่อผู้ใช้'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
});

const defaultValues = {
  username: '',
  password: '',
};

interface FormData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useSettings();
  const hidden = useMediaQuery(theme.breakpoints.down('md'));

  // ** Vars
  const { skin } = settings;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const { username, password } = data;

    auth.login({ username, password }, (res: any) => {
      if (res?.response?.status === 401) {
        toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      } else if (res?.response?.status === 500) {
        toast.error('เซิร์ฟเวอร์มีปัญหา กรุณาติดต่อผู้ดูแลระบบ');
      }
    });
  };

  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration';

  return (
    <>
      <Box className='content-right'>
        {!hidden ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoginIllustrationWrapper>
              <LoginIllustration
                alt='login-illustration'
                src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
              />
            </LoginIllustrationWrapper>
            <FooterIllustrationsV2 />
          </Box>
        ) : null}
        <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
          <Box
            sx={{
              p: 12,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <BoxWrapper>
              <Box
                sx={{
                  top: 30,
                  left: 40,
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  aria-hidden='true'
                  role='img'
                  width='35'
                  height='29'
                  preserveAspectRatio='xMidYMid meet'
                  viewBox='0 0 310 256'
                >
                  <g transform='rotate(90 155 155)'>
                    <path
                      fill={theme.palette.primary.main}
                      d='M254.313 235.519L148 9.749A17.063 17.063 0 0 0 133.473.037a16.87 16.87 0 0 0-15.533 8.052L2.633 194.848a17.465 17.465 0 0 0 .193 18.747L59.2 300.896a18.13 18.13 0 0 0 20.363 7.489l163.599-48.392a17.929 17.929 0 0 0 11.26-9.722a17.542 17.542 0 0 0-.101-14.76l-.008.008Zm-23.802 9.683l-138.823 41.05c-4.235 1.26-8.3-2.411-7.419-6.685l49.598-237.484c.927-4.443 7.063-5.147 9.003-1.035l91.814 194.973a6.63 6.63 0 0 1-4.18 9.18h.007Z'
                    />
                  </g>
                </svg>
                <Typography
                  variant='h6'
                  sx={{
                    ml: 3,
                    lineHeight: 1,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '1.5rem !important',
                  }}
                >
                  {themeConfig.templateName}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  position: 'inherit',
                  alignItems: 'center',
                  justifyContent: 'center',
                  m: 5,
                }}
              >
                <Avatar
                  alt='nktc-logo'
                  src={`/images/pages/${themeConfig.templateName.toLowerCase()}-${theme.palette.mode}.png`}
                  sx={{
                    borderRadius: '50%',
                    [theme.breakpoints.up('lg')]: {
                      width: 220,
                      height: 220,
                    },
                    [theme.breakpoints.only('md')]: {
                      width: 200,
                      height: 200,
                    },
                    [theme.breakpoints.down('md')]: {
                      width: 150,
                      height: 150,
                    },
                  }}
                />
              </Box>
              <TypographyStyled variant='h5'>ยินดีต้อนรับสู่ ระบบช่วยเหลือผู้เรียน</TypographyStyled>
              <Typography variant='body2' my={3}>
                กรุณาลงชื่อเข้าใช้บัญชีของคุณและเริ่มการใช้งาน
              </Typography>
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='username'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        autoFocus
                        label='ชื่อผู้ใช้งาน'
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        inputProps={{
                          onKeyDown: (e) => {
                            const regexEnglishOnly = /^[a-zA-Z0-9]*$/;
                            if (!regexEnglishOnly.test(e.key)) {
                              e.preventDefault();
                            }
                          },
                        }}
                        error={Boolean(errors.username)}
                      />
                    )}
                  />
                  {errors.username && (
                    <FormHelperText sx={{ color: 'error.main' }}>{errors.username.message}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                    รหัสผ่าน
                  </InputLabel>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <OutlinedInput
                        value={value}
                        onBlur={onBlur}
                        label='รหัสผ่าน'
                        onChange={onChange}
                        id='auth-login-v2-password'
                        error={Boolean(errors.password)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOutline /> : <EyeOffOutline />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    )}
                  />
                  {errors.password && (
                    <FormHelperText sx={{ color: 'error.main' }} id=''>
                      {errors.password.message}
                    </FormHelperText>
                  )}
                </FormControl>
                <Box
                  sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}
                >
                </Box>
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                  ลงชื่อเข้าใช้
                </Button>
              </form>
            </BoxWrapper>
          </Box>
        </RightWrapper>
      </Box>
    </>
  );
};

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

LoginPage.guestGuard = true;

export default LoginPage;
