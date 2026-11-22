'use client';

import { MenuItem, TextField } from '@mui/material';

import { useAcademicYear } from '@/context/academic-year-context';
import type { ReactElement } from 'react';

const AcademicYearSwitcher = (): ReactElement => {
  const { academicYear, activeAcademicYear, years, selectYear } = useAcademicYear();
  return (
    <TextField
      id='global-academic-year'
      select
      size='small'
      label='ปีการศึกษา'
      value={academicYear}
      onChange={(event): void => {
        const year = Number(event.target.value);
        selectYear(year === activeAcademicYear ? null : year);
      }}
      sx={{ width: { xs: 132, sm: 195 }, flexShrink: 0 }}
    >
      {years.map((year) => (
        <MenuItem key={year.academicYear} value={year.academicYear}>
          {year.academicYear} · {year.academicYear === activeAcademicYear ? 'ใช้งาน' : 'ย้อนหลัง'}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default AcademicYearSwitcher;
