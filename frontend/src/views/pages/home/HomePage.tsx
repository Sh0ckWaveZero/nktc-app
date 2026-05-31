'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '@/hooks/useAuth';

import AdminHomePage from './AdminHomePage';
import TeacherHomePage from './TeacherHomePage';

const HomePage = () => {
  const auth = useAuth();
  const role = auth.user?.role?.toLowerCase();

  if (!auth.isInitialized || auth.loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return role === 'admin' ? <AdminHomePage /> : <TeacherHomePage />;
};

export default HomePage;
