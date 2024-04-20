import { Box, Button, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';

import { BsXCircle } from 'react-icons/bs';
import Chip from '@/@core/components/mui/chip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FcCalendar } from 'react-icons/fc';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import newAdapter from 'utils/newAdapter';
import th from 'date-fns/locale/th';

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
      <FormControl sx={{ mr: 4, mb: 2, width: 300 }} size='medium'>
        <LocalizationProvider dateAdapter={newAdapter} adapterLocale={th as any}>
          <DatePicker
            label='เลือกวันที่'
            format='dd-MM-yyyy'
            value={selectedDate}
            disableFuture
            onChange={(newDate) => handleDateChange(newDate)}
            minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            maxDate={new Date()}
            slotProps={{
              textField: {
                inputProps: {
                  placeholder: 'วัน เดือน ปี',
                },
                sx: {
                  '& .MuiInputBase-input': {
                    fontSize: '0.813rem',
                    height: '2rem',
                  },
                  '& .MuiInputLabel-root': {
                    padding: '0.4rem 0 0 0',
                  },
                },
              },
            }}
            slots={{
              openPickerIcon: () => <FcCalendar />,
            }}
          />
        </LocalizationProvider>
      </FormControl>
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
