// ** MUI Imports
import Chip from '@/@core/components/mui/chip';
import { Button, Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select, useMediaQuery, useTheme } from '@mui/material';

// ** Icons Imports
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
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { value, defaultValue, handleChange, handleSubmit } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      p: isMobile ? 3 : 5,
      pb: 3,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: isMobile ? 2 : 4
    }}>
      <FormControl sx={{
        mb: 2,
        width: isMobile ? '100%' : 300,
        maxWidth: isMobile ? 'none' : 300
      }}>
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
          size={isMobile ? 'small' : 'medium'}
        >
          <MenuItem disabled value=''>
            <em>ห้องเรียน</em>
          </MenuItem>

          {value
            ? value.map((item: any) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))
            : null}
        </Select>
      </FormControl>
      <Button
        startIcon={<RiFileEditLine />}
        sx={{
          mb: 2,
          height: isMobile ? 48 : 56,
          fontSize: isMobile ? '0.875rem' : '1rem',
          minWidth: isMobile ? 'auto' : 200
        }}
        variant='contained'
        onClick={handleSubmit}
        size={isMobile ? 'small' : 'medium'}
        fullWidth={isMobile}
      >
        บันทึกการเช็คชื่อ
      </Button>
    </Box>
  );
};

export default TableHeader;
