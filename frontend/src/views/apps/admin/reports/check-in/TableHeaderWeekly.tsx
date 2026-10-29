// ** MUI Imports
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { isWithinInterval } from 'date-fns';
import { FaFileExcel } from 'react-icons/fa';

import { formatThaiShortDate } from '@/@core/utils/thai-calendar';

import type { AcademicWeek } from '@/utils/academic-calendar';

import CustomDay from './CustomPickersDay';

interface TableHeaderProps {
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
  academicWeeks?: readonly AcademicWeek[];
  activityType?: string;
  handleActivityTypeChange?: (event: any) => void;
  activityTypes?: { value: string; label: string }[];
  onExport?: () => void | Promise<void>;
  isExportDisabled?: boolean;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    selectedDate,
    handleSelectedDate,
    academicWeeks,
    activityType,
    handleActivityTypeChange,
    activityTypes,
    onExport,
    isExportDisabled,
  } = props;

  // ** Hooks
  const theme = useTheme();

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Button
        sx={{
          mr: 4,
          mb: 2,
          height: 55,
          borderColor: 'success.main',
          color: 'secondary.main',
          '&:hover': { borderColor: 'success.dark', color: 'secondary.dark' },
        }}
        color='secondary'
        variant='outlined'
        id='admin-checkin-weekly-download-button'
        startIcon={<FaFileExcel fontSize='small' color={theme.palette.success.dark} />}
        onClick={() => void onExport?.()}
        disabled={onExport ? isExportDisabled : false}
      >
        ดาวน์โหลด
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        {activityTypes && handleActivityTypeChange && (
          <FormControl sx={{ mr: 4, mb: 2, width: 300 }} size='medium'>
            <InputLabel id='admin-checkin-weekly-activity-type-label'>ประเภทกิจกรรม</InputLabel>
            <Select
              labelId='admin-checkin-weekly-activity-type-label'
              id='admin-checkin-weekly-activity-type-select'
              value={activityType || ''}
              onChange={handleActivityTypeChange}
              input={<OutlinedInput id='admin-checkin-weekly-activity-type-input' label='ประเภทกิจกรรม' />}
            >
              {activityTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl sx={{ mr: 4, mb: 2, width: 340 }} size='medium'>
          {academicWeeks ? (
            <TextField
              id='admin-checkin-academic-week-select'
              select
              fullWidth
              label='เลือกสัปดาห์'
              value={
                academicWeeks.find((week: AcademicWeek): boolean =>
                  Boolean(selectedDate && isWithinInterval(selectedDate, week)),
                )?.number ?? ''
              }
              onChange={(event): void => {
                const week: AcademicWeek | undefined = academicWeeks.find(
                  (entry: AcademicWeek): boolean => entry.number === Number(event.target.value),
                );
                if (week) handleSelectedDate(week.start);
              }}
            >
              {academicWeeks.map((week: AcademicWeek) => (
                <MenuItem key={week.number} value={week.number}>
                  {`สัปดาห์ที่ ${week.number} (${formatThaiShortDate(week.start)} - ${formatThaiShortDate(week.end)})`}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <CustomDay selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
          )}
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
