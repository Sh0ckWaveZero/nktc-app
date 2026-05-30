// ** MUI Imports
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ** Icons Imports
import { FaFileExcel } from 'react-icons/fa';
import CustomDay from './CustomPickersDay';

interface TableHeaderProps {
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
  activityType?: string;
  handleActivityTypeChange?: (event: any) => void;
  activityTypes?: { value: string; label: string }[];
  onExport?: () => void | Promise<void>;
  isExportDisabled?: boolean;
}

const TableHeader = (props: TableHeaderProps) => {
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
        id='admin-checkin-weekly-download-button'
        startIcon={<FaFileExcel fontSize='small' color={theme.palette.success.dark} />}
        onClick={() => void onExport?.()}
        disabled={Boolean(onExport) ? isExportDisabled : false}
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
          <CustomDay selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
