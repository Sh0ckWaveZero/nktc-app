'use client';

// ** MUI Components
import { Typography, Card, CardContent } from '@mui/material';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

interface StudentViewPageProps {
  id: string;
}

const StudentViewPage = ({ id }: StudentViewPageProps) => {
  return (
    <UserLayout>
      <Card>
        <CardContent>
          <Typography variant='h4' sx={{ mb: 2 }}>
            ดูข้อมูลนักเรียน
          </Typography>
          <Typography variant='body2' sx={{ mb: 2 }}>
            รหัสนักเรียน: {id}
          </Typography>
          <Typography variant='body2'>
            หน้านี้จะพัฒนาในอนาคต
          </Typography>
        </CardContent>
      </Card>
    </UserLayout>
  );
};

export default StudentViewPage;