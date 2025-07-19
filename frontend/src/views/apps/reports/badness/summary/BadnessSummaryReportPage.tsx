'use client';

// ** MUI Components
import { Typography, Card, CardContent, Container } from '@mui/material';

const BadnessSummaryReportPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Badness Summary Report
          </Typography>
          <Typography variant='body2'>
            หน้านี้จะพัฒนาในอนาคต
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BadnessSummaryReportPage;