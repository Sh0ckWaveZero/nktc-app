'use client';

// ** MUI Components
import { Typography, Card, CardContent } from '@mui/material';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

const ActivityCheckInSummaryReportPage = () => {
  return (
    <UserLayout>
      <Card>
        <CardContent>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Activity Check In Summary Report
          </Typography>
          <Typography variant='body2'>
            หน้านี้จะพัฒนาในอนาคต
          </Typography>
        </CardContent>
      </Card>
    </UserLayout>
  );
};

export default ActivityCheckInSummaryReportPage;