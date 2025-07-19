'use client';

// ** MUI Components
import { Typography, Card, CardContent } from '@mui/material';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

const AccountSettingsPage = () => {
  return (
    <UserLayout>
      <Card>
        <CardContent>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Account Settings
          </Typography>
          <Typography variant='body2'>
            หน้านี้จะพัฒนาในอนาคต
          </Typography>
        </CardContent>
      </Card>
    </UserLayout>
  );
};

export default AccountSettingsPage;