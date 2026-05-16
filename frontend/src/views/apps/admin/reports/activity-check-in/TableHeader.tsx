import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { FaFileExcel } from 'react-icons/fa';

interface TableHeaderProps {
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
}

const TableHeader = ({ selectedDate, handleSelectedDate }: TableHeaderProps) => {
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
        startIcon={<FaFileExcel fontSize='small' color={theme.palette.success.dark} />}
      >
        ดาวน์โหลด
      </Button>

      <ThaiDatePicker
        label='เลือกวันที่'
        value={selectedDate}
        onChange={handleSelectedDate}
        format='dd MMMM yyyy'
        minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
        maxDate={new Date()}
        placeholder='วัน เดือน ปี (พ.ศ.)'
        sx={{ width: 250 }}
      />
    </Box>
  );
};

export default TableHeader;
