import { Box, FormControl } from '@mui/material';

import CustomDay from '../../admin/reports/check-in/CustomPickersDay';

interface TableHeaderProps {
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
}

const StudentTableHeader = ({ selectedDate, handleSelectedDate }: TableHeaderProps) => (
  <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <FormControl sx={{ mr: 4, mb: 2, width: 340 }} size='medium'>
        <CustomDay selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
      </FormControl>
    </Box>
  </Box>
);

export default StudentTableHeader;
