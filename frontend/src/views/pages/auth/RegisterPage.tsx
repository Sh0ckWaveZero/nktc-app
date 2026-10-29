'use client';

// ** React Imports
import { useState, ReactNode, MouseEvent } from 'react';
import Link from 'next/link';

// ** MUI Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled, useTheme } from '@mui/material/styles';
import MuiCard, { CardProps } from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';

// ** Configs & Hooks
import themeConfig from '@/configs/themeConfig';
import { useSystemSettings } from '@/hooks/queries';

// ** Layout Import
import BlankLayout from '@/@core/layouts/BlankLayout';

// ** Demo Imports
import FooterIllustrationsV1 from '@/views/pages/auth/FooterIllustration';

interface State {
  password: string;
  showPassword: boolean;
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' },
}));

const LinkStyled = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const RegisterPage = () => {
  // ** States
  const [values, setValues] = useState<State>({
    password: '',
    showPassword: false,
  });

  // ** Hook
  const theme = useTheme();
  const { settings } = useSystemSettings();

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: (theme) => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              {settings?.collegeAcronym ? `${settings.collegeAcronym}-SYSTEM` : themeConfig.templateName}
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              เริ่มต้นการผจญภัยของคุณ! 🚀
            </Typography>
            <Typography variant='body2'>สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</Typography>
          </Box>
          <form noValidate autoComplete='off' onSubmit={(e) => e.preventDefault()}>
            <TextField autoFocus fullWidth id='username' label='ชื่อผู้ใช้' sx={{ marginBottom: 4 }} />
            <TextField fullWidth type='email' label='อีเมล' sx={{ marginBottom: 4 }} />
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-register-password'>รหัสผ่าน</InputLabel>
              <OutlinedInput
                label='รหัสผ่าน'
                value={values.password}
                id='auth-register-password'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      aria-label='toggle password visibility'
                    >
                      {values.showPassword ? <EyeOutline fontSize='small' /> : <EyeOffOutline fontSize='small' />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Button fullWidth size='large' type='submit' variant='contained' sx={{ marginBottom: 7, marginTop: 4 }}>
              สมัครสมาชิก
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography variant='body2' sx={{ marginRight: 2 }}>
                มีบัญชีอยู่แล้ว?
              </Typography>
              <Link href='/login'>
                <LinkStyled>เข้าสู่ระบบ</LinkStyled>
              </Link>
            </Box>
          </form>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  );
};

RegisterPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default RegisterPage;
