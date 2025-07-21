'use client';

// ** React Imports
import Link from 'next/link';

// ** MUI Components
import { Box, Button, Typography, Container } from '@mui/material';

const ServerErrorPage = () => {
  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Box
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            mb: 8,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h1" sx={{ mb: 2.5, fontSize: '8.75rem !important' }}>
            500
          </Typography>
          <Typography variant="h5" sx={{ mb: 2.5, letterSpacing: '0.18px', fontSize: '1.5rem !important' }}>
            เกิดข้อผิดพลาดในเซิร์ฟเวอร์! 🤯
          </Typography>
          <Typography variant="body2">ขออภัย เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์</Typography>
        </Box>
        <Button href="/home" component={Link} variant="contained" sx={{ px: 5.5 }}>
          กลับสู่หน้าหลัก
        </Button>
      </Box>
    </Container>
  );
};

export default ServerErrorPage;