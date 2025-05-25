import { Box, Button, TextField } from '@mui/material';
import { Plus } from 'mdi-material-ui';

interface TableHeaderProps {
  value: string;
  handleFilter: (val: string) => void;
  handleAddProgram: () => void;
}

/**
 * ส่วนหัวของตารางสำหรับจัดการสาขาวิชา
 * @param value - ค่าการค้นหา
 * @param handleFilter - ฟังก์ชันสำหรับจัดการการค้นหา
 * @param handleAddProgram - ฟังก์ชันสำหรับเพิ่มสาขาวิชาใหม่
 */
const TableHeader = ({ value, handleFilter, handleAddProgram }: TableHeaderProps) => {
  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <TextField
        size='small'
        value={value}
        sx={{ mr: 6, mb: 2 }}
        placeholder='ค้นหาสาขาวิชา...'
        onChange={(e) => handleFilter(e.target.value)}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          sx={{ mb: 2 }}
          onClick={handleAddProgram}
          variant='contained'
          startIcon={<Plus fontSize='small' />}
        >
          เพิ่มสาขาวิชา
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
