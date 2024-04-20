import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { FormControl, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FcCalendar } from 'react-icons/fc';

import { SiMicrosoftexcel } from 'react-icons/si';
import newAdapter from 'utils/newAdapter';
import th from 'dayjs/locale/th';

interface TableHeaderProps {
  value: any;
  selectedDate: Dayjs | null;
  handleSelectedDate: (newDate: Dayjs | null) => any;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { value, selectedDate, handleSelectedDate } = props;

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
        startIcon={<SiMicrosoftexcel fontSize='small' color={theme.palette.success.dark} />}
      >
        ดาวน์โหลด
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ mr: 4, mb: 2, width: 250 }} size='medium'>
          <LocalizationProvider dateAdapter={newAdapter} adapterLocale={th as any}>
            <DatePicker
              label='เลือกวันที่'
              format='DD MMMM YYYY'
              value={selectedDate}
              disableFuture
              onChange={(newDate) => handleSelectedDate(newDate)}
              minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
              maxDate={dayjs(new Date())}
              slotProps={{
                textField: {
                  inputProps: {
                    placeholder: 'วัน เดือน ปี',
                  },
                },
              }}
              slots={{
                openPickerIcon: () => <FcCalendar />,
              }}
            />
          </LocalizationProvider>
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
