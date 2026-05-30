import { Box, Button, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { useTheme } from '@mui/material';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
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

const TableHeader = ({
  selectedDate,
  handleSelectedDate,
  activityType,
  handleActivityTypeChange,
  activityTypes,
  onExport,
  isExportDisabled,
}: TableHeaderProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: { xs: 4, sm: 5 },
        py: { xs: 3, sm: 3.5 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Button
        variant='outlined'
        color='success'
        id='admin-checkin-download-button'
        startIcon={<FaFileExcel fontSize='small' color={theme.palette.success.dark} />}
        onClick={() => void onExport?.()}
        disabled={Boolean(onExport) ? isExportDisabled : false}
      >
        ดาวน์โหลด
      </Button>

      {activityTypes && handleActivityTypeChange && (
        <FormControl sx={{ width: 250 }}>
          <InputLabel id='admin-checkin-activity-type-label'>ประเภทกิจกรรม</InputLabel>
          <Select
            labelId='admin-checkin-activity-type-label'
            id='admin-checkin-activity-type-select'
            value={activityType || ''}
            onChange={handleActivityTypeChange}
            input={<OutlinedInput id='admin-checkin-activity-type-input' label='ประเภทกิจกรรม' />}
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
        id='admin-checkin-date-picker'
        label='เลือกวันที่'
        value={selectedDate}
        onChange={handleSelectedDate}
        format='dd/MM/yyyy'
        minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
        maxDate={new Date()}
        placeholder='วัน เดือน ปี (พ.ศ.)'
        sx={{ width: 250 }}
      />
    </Box>
  );
};

export default TableHeader;
