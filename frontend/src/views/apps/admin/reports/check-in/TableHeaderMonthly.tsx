// ** MUI Imports
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

// ** Icons Imports
import { FaFileExcel } from 'react-icons/fa';

interface TableHeaderProps {
  value?: any;
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
}

const TableHeaderMonthly = (props: TableHeaderProps) => {
  // ** Props
  const { selectedDate, handleSelectedDate } = props;

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
        startIcon={<FaFileExcel fontSize='small' color={theme.palette.success.dark} />}
      >
        ดาวน์โหลด
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <ThaiDatePicker
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
