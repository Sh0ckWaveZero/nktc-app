'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

import AdminHomePage from './AdminHomePage';
import TeacherHomePage from './TeacherHomePage';

const HomePage = () => {
  const auth = useAuth();
  const { isAdmin } = useRole();

  if (!auth.isInitialized || auth.loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return isAdmin ? <AdminHomePage /> : <TeacherHomePage />;
};

export default HomePage;
