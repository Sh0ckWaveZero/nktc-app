// ** MUI Imports
import Chip from '@/@core/components/mui/chip';
import { Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';

// ** Icons Imports

interface TableHeaderProps {
  classrooms: any;
  defaultValue: any;
  handleChange: (event: any) => void;
  visitNo: any;
  handleVisitNoChange: (event: any) => void;
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

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { classrooms, defaultValue, handleChange, visitNo, handleVisitNoChange } = props;

  // ** Vars
  const selectedVisit = [
    {
      label: 'ครั้งที่ 1',
      value: '1',
    },
    {
      label: 'ครั้งที่ 2',
      value: '2',
    },
  ];

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
      <FormControl sx={{ mr: 4, mb: 2, width: 300 }}>
        <InputLabel id='visit-no'>ครั้งการเยี่ยม</InputLabel>
        <Select
          labelId='visit-no-label'
          id='visit-no'
          value={visitNo || '1'}
          label='ครั้งการเยี่ยม'
          onChange={handleVisitNoChange}
          input={<OutlinedInput id='select-multiple-chip-visit-no' label='ครั้งการเยี่ยม' />}
          renderValue={(selected: any) => {
            const label = selectedVisit.map((item: any) => {
              if (item.value === selected) {
                return item.label;
              }
            });
            return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{label && <Chip label={label} />}</Box>;
          }}
          MenuProps={MenuProps}
        >
          <MenuItem disabled value=''>
            <em>ครั้งการเยี่ยม</em>
          </MenuItem>
          {selectedVisit.map((item: any) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ mr: 4, mb: 2, width: 300 }}>
        <InputLabel id='demo-multiple-name-label'>ห้องเรียน</InputLabel>
        <Select
          labelId='demo-multiple-name-label'
          id='demo-multiple-name'
          displayEmpty
          defaultValue={defaultValue || ''}
          value={defaultValue || ''}
          onChange={handleChange}
          input={<OutlinedInput id='select-multiple-chip' label='ห้องเรียน' />}
          renderValue={(selected: any) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected && <Chip label={selected} />}</Box>
          )}
          MenuProps={MenuProps}
        >
          <MenuItem disabled value=''>
            <em>ห้องเรียน</em>
          </MenuItem>

          {classrooms
            ? classrooms.map((item: any) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))
            : null}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TableHeader;
