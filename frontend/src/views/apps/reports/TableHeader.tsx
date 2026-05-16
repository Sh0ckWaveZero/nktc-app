import Chip from '@/@core/components/mui/chip';
import { Box, Button, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import Grid from '@mui/material/Grid';
import { RiFileEditLine } from 'react-icons/ri';

interface TableHeaderProps {
  value: any;
  defaultValue: any[];
  handleChange: (event: any) => void;
  handleSubmit: (event: any) => void;
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

const TableHeader = ({ value, defaultValue, handleChange, handleSubmit }: TableHeaderProps) => {
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
              {value?.map((item: any) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 'auto' }}>
          <Button
            fullWidth
            variant='contained'
            disableElevation
            startIcon={<RiFileEditLine />}
            onClick={handleSubmit}
          >
            บันทึกการเช็คชื่อ
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableHeader;
