// ** React Imports
import { ReactNode } from 'react';

// ** Next Import
import Link from 'next/link';

// ** MUI Components
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';

// ** Layout Import
import BlankLayout from '@/@core/layouts/BlankLayout';

// ** Demo Imports
import FooterIllustrations from '../views/pages/misc/FooterIllustrations';

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw',
  },
}));

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const Img = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(10),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10),
  },
  [theme.breakpoints.down('md')]: {
    height: 400,
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(13),
  },
}));

const Error401 = () => {
  return (
    <Box className='content-center'>
      <Box
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <BoxWrapper>
          <Typography variant='h1'>401</Typography>
          <Typography variant='h5' sx={{ mb: 1, fontSize: '1.5rem !important' }}>
            คุณไม่ได้รับอนุญาต! 🔐
          </Typography>
          <Typography variant='body2'>คุณไม่มีสิทธิ์เข้าถึงหน้านี้ โปรดกลับสู่หน้าหลัก!</Typography>
        </BoxWrapper>
        <Img height='487' alt='error-illustration' src='/images/pages/401.png' />
        <LinkStyled passHref href='/'>
          <Button component='p' variant='contained' sx={{ px: 5.5 }}>
            กลับสู่หน้าหลัก
          </Button>
        </LinkStyled>
      </Box>
      <FooterIllustrations />
    </Box>
  );
};

Error401.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

export default Error401;
