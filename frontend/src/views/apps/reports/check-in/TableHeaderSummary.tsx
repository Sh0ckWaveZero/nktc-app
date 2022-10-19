// ** MUI Imports
import Chip from '@/@core/components/mui/chip';
import { Button, Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { BsPrinter } from 'react-icons/bs';

interface TableHeaderProps {
  value: any;
  defaultValue: any[];
  handleChange: (event: any) => void;
  handleDateChange: (event: Date | null) => void;
  selectedDate: Date | null;
  handleClickPrint: () => void;
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

const TableHeaderSummary = (props: TableHeaderProps) => {
  // ** Props
  const { value, defaultValue, handleChange, handleClickPrint, isDisabled } = props;

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
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
              <Chip label={selected} sx={{ backgroundColor: 'info.main' }} />
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
        color={'primary'}
        startIcon={<BsPrinter />}
        sx={{ mr: 4, mb: 2, height: 65 }}
        variant='contained'
        onClick={handleClickPrint}
      >
        ปริ้นรายงาน
      </Button>
    </Box>
  );
};

export default TableHeaderSummary;
