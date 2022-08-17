// ** MUI Imports

// ** Icons Imports
import { Button, TextField, Box } from '@mui/material';
import { ExportVariant } from 'mdi-material-ui';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value } = props;

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Button sx={{ mr: 4, mb: 2 }} color='secondary' variant='outlined' startIcon={<ExportVariant fontSize='small' />}>
        ดาวน์โหลดข้อมูล
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          value={value}
          sx={{ mr: 4, mb: 2 }}
          placeholder='ค้นหาครู/บุคลากร'
          onChange={(e) => handleFilter(e.target.value)}
        />

        <Button sx={{ mb: 2 }} onClick={toggle} variant='contained'>
          เพิ่มครู/บุคลากร
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
