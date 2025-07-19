'use client';

// ** MUI Imports
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// ** Layout Import
import UserLayout from '@/layouts/UserLayout';

const HomePage = () => {
  return (
    <UserLayout>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Typography variant='h4'>
            หน้าหลัก 🏠
          </Typography>
          <Typography variant='body2'>
            ยินดีต้อนรับสู่ระบบดูแลช่วยเหลือนักเรียน
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
            lg: 4
          }}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ marginBottom: 2 }}>
                สถิติรวม
              </Typography>
              <Typography variant='body2'>
                ข้อมูลสถิติการใช้งานระบบ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
            lg: 4
          }}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ marginBottom: 2 }}>
                การแจ้งเตือน
              </Typography>
              <Typography variant='body2'>
                การแจ้งเตือนและข่าวสารสำคัญ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
            lg: 4
          }}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ marginBottom: 2 }}>
                รายงาน
              </Typography>
              <Typography variant='body2'>
                รายงานและสถิติต่างๆ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </UserLayout>
  );
};

export default HomePage;