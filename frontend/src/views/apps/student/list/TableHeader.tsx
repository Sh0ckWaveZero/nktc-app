// ** MUI Imports
import Icon from '@/@core/components/icon';
// import { isEmpty } from '@/@core/utils/utils';
import { Autocomplete, FormControl, IconButton, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { Close } from '@mui/icons-material';

interface TableHeaderProps {
  classrooms: any;
  defaultClassroom: any;
  fullName: string;
  loading: boolean;
  loadingStudents: boolean;
  onHandleChange: (event: any, value: any) => void;
  onHandleChangeStudent: (event: any, value: any) => void;
  onHandleStudentId: (value: string) => void;
  onSearchChange: (event: any, value: any, reason: any) => void;
  studentId: string;
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
    defaultClassroom,
    fullName,
    loading,
    loadingStudents,
    onHandleChange,
    onHandleChangeStudent,
    onHandleStudentId,
    onSearchChange,
    studentId,
    students = [],
  } = props;

  return (
    <Grid
      id='student-list-table-header'
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
      <Grid
        id='student-list-student-id-filter'
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 2,
        }}
      >
        <FormControl id='student-id-form-control' fullWidth>
          <TextField
            id='studentId'
            fullWidth
            label='รหัสนักเรียน'
            placeholder='รหัสนักเรียน'
            value={studentId}
            onChange={(e) => onHandleStudentId(e.target.value)}
            slotProps={{
              input: {
                endAdornment: studentId && (
                  <InputAdornment position='end'>
                    <IconButton
                      id='clear-student-id-button'
                      size='small'
                      edge='end'
                      onClick={() => onHandleStudentId('')}
                      aria-label='clear student id'
                    >
                      <Close fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              height: 56,
            }}
          />
        </FormControl>
      </Grid>
      <Grid
        id='student-list-student-name-filter'
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 4,
        }}
      >
        <FormControl id='student-name-form-control' fullWidth>
          <Autocomplete
            id='studentName'
            fullWidth
            disablePortal={false}
            value={fullName || null}
            options={students}
            loading={loadingStudents}
            onInputChange={onSearchChange}
            onChange={(_, newValue: any) => onHandleChangeStudent(_, newValue)}
            getOptionLabel={(option: any) => {
              if (typeof option === 'string') return option;
              // Handle different data structures
              if (option?.fullName) {
                return `${option?.title || ''}${option.fullName}`;
              }
              // Handle API response structure: account.title + account.firstName + account.lastName
              if (option?.account) {
                const { title = '', firstName = '', lastName = '' } = option.account;
                return `${title}${firstName} ${lastName}`.trim();
              }
              return '';
            }}
            isOptionEqualToValue={(option: any, value: any) => {
              if (!option || !value) return false;
              return option.id === value.id;
            }}
            renderInput={(params: any) => {
              return (
                <TextField
                  id='student-name-input'
                  {...params}
                  label='ชื่อ-สกุล นักเรียน'
                  placeholder='เลือกชื่อ-สกุล นักเรียน'
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              );
            }}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
      </Grid>
      <Grid
        id='student-list-classroom-filter'
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 4,
        }}
      >
        <FormControl id='classroom-form-control' fullWidth>
          <Autocomplete
            id='classroom'
            fullWidth
            disablePortal={false}
            value={defaultClassroom || null}
            options={classrooms}
            loading={loading}
            onChange={(_, newValue: any) => onHandleChange(_, newValue)}
            getOptionLabel={(option: any) => option?.name ?? ''}
            isOptionEqualToValue={(option: any, value: any) => {
              if (!option || !value) return false;
              return option.id === value.id;
            }}
            groupBy={(option: any) => option.department?.name}
            renderInput={(params: any) => {
              return (
                <TextField
                  id='classroom-input'
                  {...params}
                  label='ห้องเรียน'
                  placeholder='เลือกห้องเรียน'
                  error={(!classrooms || classrooms.length === 0) && !loading}
                  helperText={(!classrooms || classrooms.length === 0) && !loading ? 'ไม่พบข้อมูลห้องเรียน' : ''}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              );
            }}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
      </Grid>
      <Grid
        id='student-list-add-button-container'
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 2,
        }}
      >
        <FormControl id='add-student-form-control' fullWidth>
          <LinkStyled href='/apps/student/add' passHref>
            <Button
              id='add-student-button'
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
  );
};

export default TableHeader;
