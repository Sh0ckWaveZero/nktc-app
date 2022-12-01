// ** MUI Imports
import { FormControl, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Dayjs } from 'dayjs';

// ** Icons Imports
import { SiMicrosoftexcel } from 'react-icons/si';
import CustomDay from './CustomPickersDay';

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
        <FormControl sx={{ mr: 4, mb: 2, width: 340 }} size='medium'>
          <CustomDay selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
