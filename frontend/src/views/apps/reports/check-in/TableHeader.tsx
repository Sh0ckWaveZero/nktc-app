// ** MUI Imports

// ** Icons Imports
import {
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  useTheme,
  Chip,
} from '@mui/material';
import { ExportVariant } from 'mdi-material-ui';
import { useState } from 'react';
import { RiFileEditLine } from 'react-icons/ri';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
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

const names = [
  '',
  'ปวช.1/1 ช่างยนต์',
  'ปวช.1/2 ช่างยนต์',
  'ปวช.1/3 ช่างยนต์',
  'ปวช.1/4 ช่างยนต์',
  'ปวช.1/5 ช่างยนต์',
  'ปวช.1/6 ช่างยนต์',
];

function getStyles(
  name: string,
  personName: string | any[],
  theme: { typography: { fontWeightRegular: any; fontWeightMedium: any } },
) {
  return {
    fontWeight:
      personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value } = props;

  const theme = useTheme();
  const [personName, setPersonName] = useState([]);

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
      <FormControl sx={{ mr: 4, mb: 2, width: 300 }}>
        <InputLabel id='demo-multiple-name-label'>ห้องเรียน</InputLabel>
        <Select
          labelId='demo-multiple-name-label'
          id='demo-multiple-name'
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput id='select-multiple-chip' label='ห้องเรียน' />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {names.map((name, index) => (
            <MenuItem key={index} value={name} style={getStyles(name, personName, theme)}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button startIcon={<RiFileEditLine />} sx={{ mb: 2, height: 56 }} variant='contained'>
        บันทึกการเช็คชื่อ
      </Button>
    </Box>
  );
};

export default TableHeader;
