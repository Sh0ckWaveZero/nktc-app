'use client';

import { Alert, Button } from '@mui/material';

import { useAcademicYear } from '@/context/academic-year-context';
import type { ReactElement } from 'react';

const AcademicYearBanner = (): ReactElement | null => {
  const { academicYear, activeAcademicYear, isHistorical, selectYear } = useAcademicYear();
  if (!isHistorical) return null;
  return (
    <Alert
      severity='info'
      sx={{ mb: 5, '& .MuiAlert-message': { minWidth: 0 }, flexWrap: 'wrap' }}
      action={
        <Button color='inherit' onClick={(): void => selectYear(null)}>
          กลับปี {activeAcademicYear}
        </Button>
      }
    >
      กำลังดูปีการศึกษา {academicYear} · บันทึกเช็คชื่อ กิจกรรม เยี่ยมบ้าน และคะแนนของปีนี้เปิดดูได้อย่างเดียว
    </Alert>
  );
};

export default AcademicYearBanner;
