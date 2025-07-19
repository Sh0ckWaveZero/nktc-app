'use client';

// ** MUI Components
import { Typography, Card, CardContent } from '@mui/material';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

interface StudentEditPageProps {
  id: string;
}

const StudentEditPage = ({ id }: StudentEditPageProps) => {
  return (
    <UserLayout>
      <Card>
        <CardContent>
          <Typography variant='h4' sx={{ mb: 2 }}>
            แก้ไขข้อมูลนักเรียน
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

export default StudentEditPage;