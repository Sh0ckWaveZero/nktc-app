// ** MUI Imports
import { FormControl, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import thLocale from 'date-fns/locale/th';

// ** Icons Imports
import ExportVariant from 'mdi-material-ui/ExportVariant';
import { SiMicrosoftexcel } from 'react-icons/si';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
  selectedDate: Date | null;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value, selectedDate } = props;

  // ** Hooks
  const theme = useTheme();

  function handleDateChange(newDate: Date | null): void {
    throw new Error('Function not implemented.');
  }

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
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
            <DatePicker
              label='เลือกวันที่'
              value={selectedDate}
              inputFormat='dd-MM-yyyy'
              minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              maxDate={new Date()}
              onChange={(newDate) => handleDateChange(newDate)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  inputProps={{
                    ...params.inputProps,
                    placeholder: 'วัน/เดือน/ปี',
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
