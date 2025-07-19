'use client';

// ** MUI Components
import { Typography, Card, CardContent } from '@mui/material';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

const ACLPage = () => {
  return (
    <UserLayout>
      <Card>
        <CardContent>
          <Typography variant='h4' sx={{ mb: 2 }}>
            การควบคุมการเข้าถึง (ACL)
          </Typography>
          <Typography variant='body2'>
            ระบบจัดการสิทธิ์การเข้าถึงจะพัฒนาในอนาคต
          </Typography>
        </CardContent>
      </Card>
    </UserLayout>
  );
};

export default ACLPage;