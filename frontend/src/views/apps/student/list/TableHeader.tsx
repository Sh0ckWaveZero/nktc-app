// ** MUI Imports
import { isEmpty } from '@/@core/utils/utils';
import { Autocomplete, FormControl, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// ** Icons Imports
import ExportVariant from 'mdi-material-ui/ExportVariant';
import Link from 'next/link';
import Icon from '@/@core/components/icon';

interface TableHeaderProps {
  value: string;
  classrooms: any;
  onHandleChange: (event: any, value: any) => void;
  loading: boolean;
  defaultClassroom: any;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { value, classrooms, onHandleChange, loading, defaultClassroom } = props;

  return (
    <Grid
      container
      spacing={5}
      sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}
    >
      <Grid item xs={12} sm={6}>
        <Button
          sx={{ mr: 4, mb: 2, height: 56 }}
          disabled
          color='secondary'
          variant='outlined'
          startIcon={<ExportVariant fontSize='small' />}
        >
          ดาวน์โหลด
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        {/* // Align right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl fullWidth sx={{ width: '70%', mr: 2 }}>
            <Autocomplete
              id='checkboxes-tags-classroom'
              limitTags={15}
              value={defaultClassroom}
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
              filterSelectedOptions
              groupBy={(option: any) => option.department?.name}
              noOptionsText='ไม่พบข้อมูล'
            />
          </FormControl>
          <FormControl>
            <Link href='/apps/student/add' passHref>
              <Button
                color='primary'
                variant='contained'
                startIcon={<Icon icon='line-md:account-add' />}
                sx={{ mr: 2, height: 56 }}
              >
                เพิ่มนักเรียน
              </Button>
            </Link>
          </FormControl>
        </Box>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
