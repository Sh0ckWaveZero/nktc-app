// ** MUI Imports
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

// ** Icons Imports
import { FaFileExcel } from 'react-icons/fa';

interface TableHeaderProps {
  value?: any;
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
  activityType?: string;
  handleActivityTypeChange?: (event: any) => void;
  activityTypes?: { value: string; label: string }[];
  onExport?: () => void | Promise<void>;
  isExportDisabled?: boolean;
}

const TableHeaderMonthly = (props: TableHeaderProps) => {
  // ** Props
  const { selectedDate, handleSelectedDate, activityType, handleActivityTypeChange, activityTypes, onExport, isExportDisabled } = props;

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
        id='admin-checkin-monthly-download-button'
        startIcon={<FaFileExcel fontSize='small' color={theme.palette.success.dark} />}
        onClick={() => void onExport?.()}
        disabled={onExport ? isExportDisabled : false}
      >
        ดาวน์โหลด
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        {activityTypes && handleActivityTypeChange && (
          <FormControl sx={{ mr: 4, mb: 2, width: 300 }}>
            <InputLabel id='admin-checkin-monthly-activity-type-label'>ประเภทกิจกรรม</InputLabel>
            <Select
              labelId='admin-checkin-monthly-activity-type-label'
              id='admin-checkin-monthly-activity-type-select'
              value={activityType || ''}
              onChange={handleActivityTypeChange}
              input={<OutlinedInput id='admin-checkin-monthly-activity-type-input' label='ประเภทกิจกรรม' />}
            >
              {activityTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <ThaiDatePicker
          id='admin-checkin-monthly-date-picker'
          label='เลือกเดือน'
          value={selectedDate}
          onChange={handleSelectedDate}
          format='MMMM yyyy'
          views={['month', 'year']}
          minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
          maxDate={new Date()}
          placeholder='เดือน ปี (พ.ศ.)'
          sx={{ mr: 4, mb: 2, width: 250 }}
        />
      </Box>
    </Box>
  );
};

export default TableHeaderMonthly;
