// ** MUI Imports
import { isEmpty } from '@/@core/utils/utils';
import { Autocomplete, FormControl } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// ** Icons Imports
import ExportVariant from 'mdi-material-ui/ExportVariant';

interface TableHeaderProps {
  value: string;
  classrooms: any;
  onHandleChange: (event: any, value: any) => void;
  loading: boolean;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { value, classrooms, onHandleChange, loading } = props;

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Button sx={{ mr: 4, mb: 2 }} disabled color='secondary' variant='outlined' startIcon={<ExportVariant fontSize='small' />}>
        ดาวน์โหลด
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: 370 }}>
        <FormControl fullWidth sx={{ mb: 6 }}>
          <Autocomplete
            id='checkboxes-tags-classroom'
            limitTags={15}
            options={classrooms}
            onChange={(_, newValue: any) => onHandleChange(_, newValue)}
            getOptionLabel={(option: any) => option?.name ?? ''}
            isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
            renderOption={(props, option) => (
              <li key={option.classroomId} {...props}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                error={isEmpty(classrooms) && loading}
                helperText={isEmpty(classrooms) && loading ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
                {...params}
                label='ห้องเรียน'
                placeholder='เลือกห้องเรียน'
              />
            )}
            disableCloseOnSelect
            filterSelectedOptions
            groupBy={(option: any) => option.program?.name}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
      </Box>
    </Box>
  );
};

export default TableHeader;
