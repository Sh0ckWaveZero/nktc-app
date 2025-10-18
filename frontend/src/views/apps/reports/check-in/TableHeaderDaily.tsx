// ** MUI Imports
import Chip from '@/@core/components/mui/chip';
import { Button, Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { BsXCircle } from 'react-icons/bs';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

interface TableHeaderProps {
  value: any;
  defaultValue: any[];
  handleChange: (event: any) => void;
  handleDateChange: (event: Date | null) => void;
  selectedDate: Date | null;
  handleClickOpen: () => void;
  isDisabled: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const TableHeaderDaily = (props: TableHeaderProps) => {
  // ** Props
  const { value, defaultValue, handleChange, selectedDate, handleDateChange, handleClickOpen, isDisabled } = props;

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
      <ThaiDatePicker
        label='เลือกวันที่'
        value={selectedDate}
        onChange={handleDateChange}
        format='dd-MM-yyyy'
        minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
        maxDate={new Date()}
        placeholder='วัน/เดือน/ปี (พ.ศ.)'
        sx={{
          mr: 4,
          mb: 2,
          width: 300,
          '& .MuiInputBase-input': {
            fontSize: '0.813rem',
            height: '2rem',
          },
          '& .MuiInputLabel-root': {
            padding: '0.4rem 0 0 0',
          },
        }}
      />
      <FormControl sx={{ mr: 4, mb: 2, width: 300 }}>
        <InputLabel id='demo-multiple-name-label'>ห้องเรียน</InputLabel>
        <Select
          labelId='demo-multiple-name-label'
          id='demo-multiple-name'
          displayEmpty
          value={defaultValue ?? []}
          onChange={handleChange}
          input={<OutlinedInput id='select-multiple-chip' label='ห้องเรียน' />}
          renderValue={(selected: any) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip label={selected} />
            </Box>
          )}
          MenuProps={MenuProps}
        >
          <MenuItem disabled value=''>
            <em>ห้องเรียน</em>
          </MenuItem>

          {value.map((item: any) => (
            <MenuItem key={item.id} value={item.name}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        disabled={isDisabled}
        color={'error'}
        startIcon={<BsXCircle />}
        sx={{ mr: 4, mb: 2, height: 65 }}
        variant='contained'
        onClick={handleClickOpen}
      >
        ลบข้อมูลการเช็คชื่อของวันนี้
      </Button>
    </Box>
  );
};

export default TableHeaderDaily;
