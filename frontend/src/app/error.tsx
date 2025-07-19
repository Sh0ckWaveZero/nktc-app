'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

// ** Layout Component
import BlankLayout from '@/@core/layouts/BlankLayout';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <BlankLayout>
      <Box className="content-center">
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
              เกิดข้อผิดพลาด! 🤯
            </Typography>
            <Typography variant="body2">
              ขออภัย เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง
            </Typography>
          </Box>
          <Button onClick={reset} variant="contained" sx={{ px: 5.5 }}>
            ลองใหม่อีกครั้ง
          </Button>
        </Box>
      </Box>
    </BlankLayout>
  );
}