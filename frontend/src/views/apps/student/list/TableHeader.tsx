// ** MUI Imports
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';
import { Autocomplete, FormControl, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
// ** Icons Imports
import ExportVariant from 'mdi-material-ui/ExportVariant';
import Link from 'next/link';

interface TableHeaderProps {
  classrooms: any;
  onHandleChange: (event: any, value: any) => void;
  loading: boolean;
  defaultClassroom: any;
  fullName: string;
  loadingStudents: boolean;
  onHandleChangeStudent: (event: any, value: any) => void;

  onSearchChange: (event: any, value: any, reason: any) => void;
  students: any;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    classrooms = [],
    onHandleChange,
    loading,
    defaultClassroom,
    fullName,
    loadingStudents,
    onHandleChangeStudent,
    onSearchChange,
    students = [],
  } = props;

  return (
    <Grid
      container
      spacing={2}
      flexDirection='row'
      flexWrap='wrap'
      alignContent='center'
      justifyContent='space-between'
      sx={{
        p: 5,
      }}
    >
      <Grid item xs={12} sm={12} md={12} lg={2} xl={1}>
        <Button
          fullWidth
          sx={{
            mr: 4,
            mb: 2,
            height: 56,
          }}
          disabled
          color='secondary'
          variant='outlined'
          startIcon={<ExportVariant fontSize='small' />}
        >
          ดาวน์โหลด
        </Button>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={10} xl={11}>
        <Grid container direction='row' justifyContent='flex-end' alignItems='center' spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={4} xl={1}>
            <FormControl fullWidth>
              <Autocomplete
                id='studentName'
                limitTags={20}
                value={fullName}
                options={students}
                loading={loadingStudents}
                onInputChange={onSearchChange}
                onChange={(_, newValue: any) => onHandleChangeStudent(_, newValue)}
                getOptionLabel={(option: any) => option.fullName || ''}
                isOptionEqualToValue={(option: any, value: any) => option.fullName === value?.fullName}
                renderOption={(props, option) => (
                  <li key={option?.id} {...props}>
                    {`${option?.title}${option?.fullName} `}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label='ชื่อ-สกุล นักเรียน' placeholder='เลือกชื่อ-สกุล นักเรียน' />
                )}
                noOptionsText='ไม่พบข้อมูล'
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={5} xl={8}>
            <FormControl fullWidth>
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
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={2} xl={1}>
            <FormControl fullWidth>
              <LinkStyled href='/apps/student/add' passHref>
                <Button
                  fullWidth
                  color='primary'
                  variant='contained'
                  startIcon={<Icon icon='line-md:account-add' />}
                  sx={{ height: 56 }}
                >
                  เพิ่มนักเรียน
                </Button>
              </LinkStyled>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
