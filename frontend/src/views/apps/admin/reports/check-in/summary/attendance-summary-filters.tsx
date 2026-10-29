import { CalendarMonthOutlined, RefreshOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { parseISO } from 'date-fns';
import Link from 'next/link';

import { formatThaiDate } from '@/@core/utils/thai-calendar';

import type { ReactElement } from 'react';
import type { useAttendanceSummary } from '@/hooks/use-attendance-summary';
import type { AcademicTerm } from '@/types/apps/academic-calendar';

interface AttendanceSummaryFiltersProps {
  state: ReturnType<typeof useAttendanceSummary>;
}

const AttendanceSummaryFilters = ({ state }: AttendanceSummaryFiltersProps): ReactElement => (
  <Card>
    <CardContent>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: { sm: 'flex-start' } }}
      >
        <TextField
          id='attendance-summary-year'
          select
          label='ปีการศึกษา'
          value={state.academicYear ?? ''}
          onChange={(event): void => state.handleYearChange(Number(event.target.value))}
          helperText='ปีที่ตั้งค่าไว้ในปฏิทินการศึกษา'
          sx={{ width: { xs: '100%', sm: 230 } }}
        >
          {state.years.map((year) => (
            <MenuItem key={year.academicYear} value={year.academicYear}>
              {year.academicYear}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id='attendance-summary-term'
          select
          label='ภาคเรียน'
          value={state.selectedTerm}
          onChange={(event): void => state.handleTermChange(Number(event.target.value) as AcademicTerm)}
          sx={{ width: { xs: '100%', sm: 280 } }}
        >
          {state.selectedYear?.terms.map((term) => (
            <MenuItem key={term.term} value={term.term}>
              {term.name}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant='outlined'
          startIcon={<RefreshOutlined />}
          disabled={state.summaryQuery.isFetching || state.optionsQuery.isFetching}
          onClick={() => void Promise.all([state.optionsQuery.refetch(), state.summaryQuery.refetch()])}
        >
          อัปเดตข้อมูล
        </Button>
        <Button component={Link} href='/apps/calendar' startIcon={<CalendarMonthOutlined />}>
          ปฏิทินการศึกษา
        </Button>
      </Stack>
      {state.selectedPeriod && (
        <Stack direction='row' spacing={1.5} useFlexGap sx={{ mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            color='primary'
            variant='outlined'
            label={`เปิดเทอม ${formatThaiDate(parseISO(state.selectedPeriod.startDate))}`}
          />
          <Typography variant='body2' color='text.secondary'>
            ถึง {formatThaiDate(parseISO(state.selectedPeriod.endDate))} · อ้างอิงรอบสัปดาห์ในปฏิทิน
          </Typography>
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default AttendanceSummaryFilters;
