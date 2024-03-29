// ** MUI Imports
import { FormControl, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import th from 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
// ** Icons Imports
import { SiMicrosoftexcel } from 'react-icons/si';

dayjs.extend(buddhistEra);

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
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={th}>
            <DatePicker
              label='เลือกวันที่'
              value={selectedDate}
              inputFormat='DD MMMM BBBB'
              minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
              maxDate={dayjs(new Date())}
              onChange={(newDate) => handleSelectedDate(newDate)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  inputProps={{
                    ...params.inputProps,
                    placeholder: 'วัน เดือน ปี',
                  }}
                />
              )}
              disableMaskedInput
            />
          </LocalizationProvider>
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
