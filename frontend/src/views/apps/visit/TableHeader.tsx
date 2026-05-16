import Chip from '@/@core/components/mui/chip';
import { Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import Grid from '@mui/material/Grid';

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
  slotProps: {
    paper: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  },
};

const selectedVisit = [
  { label: 'ครั้งที่ 1', value: '1' },
  { label: 'ครั้งที่ 2', value: '2' },
];

const TableHeader = ({ classrooms, defaultValue, handleChange, visitNo, handleVisitNoChange }: TableHeaderProps) => {
  return (
    <Box
      sx={{
        px: { xs: 4, sm: 5 },
        py: { xs: 3, sm: 3.5 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='visit-no-label'>ครั้งการเยี่ยม</InputLabel>
            <Select
              labelId='visit-no-label'
              id='visit-no'
              value={visitNo || '1'}
              label='ครั้งการเยี่ยม'
              onChange={handleVisitNoChange}
              input={<OutlinedInput id='select-multiple-chip-visit-no' label='ครั้งการเยี่ยม' />}
              renderValue={(selected: any) => {
                const label = selectedVisit.find((item) => item.value === selected)?.label;
                return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{label && <Chip label={label} />}</Box>;
              }}
              MenuProps={MenuProps}
            >
              <MenuItem disabled value=''>
                <em>ครั้งการเยี่ยม</em>
              </MenuItem>
              {selectedVisit.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='classroom-select-label'>ห้องเรียน</InputLabel>
            <Select
              labelId='classroom-select-label'
              id='classroom-select'
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
              {classrooms?.map((item: any) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableHeader;
