import { Autocomplete, Button, FormControl, TextField, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';

import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';

interface TableHeaderProps {
  classroomLoading: boolean;
  classrooms: any;
  datePickLabel: string;
  defaultClassroom: any;
  fullName: string;
  loadingStudents: boolean;
  onChangeDate: (date: Date | null) => void;
  onClear: () => void;
  onHandleChangeStudent: (event: any, value: any) => void;
  onHandleClassroomChange: (event: any, value: any) => void;
  onSearch: () => void;
  onSearchChange: (event: any, value: any, reason: any) => void;
  selectDate: Date | null;
  students: any;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    classroomLoading,
    classrooms,
    datePickLabel,
    defaultClassroom,
    fullName,
    loadingStudents,
    onChangeDate,
    onClear,
    onHandleChangeStudent,
    onHandleClassroomChange,
    onSearch,
    onSearchChange,
    selectDate,
    students,
  } = props;

  return (
    <Grid
      container
      spacing={2}
      sx={{
        p: 5,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
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
            renderOption={(props, option, { selected }: any) => (
              <li {...props}>{`${option?.title}${option?.fullName} `}</li>
            )}
            renderInput={(params) => {
              const { InputProps, InputLabelProps, ...otherParams } = params;
              return (
                <TextField
                  {...otherParams}
                  label='ชื่อ-สกุล นักเรียน'
                  placeholder='เลือกชื่อ-สกุล นักเรียน'
                  slotProps={{
                    input: {
                      ...InputProps,
                      ref: undefined,
                    },
                    inputLabel: {
                      ...InputLabelProps,
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
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <FormControl fullWidth>
          <Autocomplete
            id='classroom'
            limitTags={15}
            value={defaultClassroom}
            options={classrooms}
            onChange={(_, newValue: any) => onHandleClassroomChange(_, newValue)}
            getOptionLabel={(option: any) => option?.name ?? ''}
            isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
            renderOption={(props, option, { selected }: any) => <li {...props}>{option.name}</li>}
            renderInput={(params) => {
              const { InputProps, InputLabelProps, ...otherParams } = params;
              return (
                <TextField
                  error={isEmpty(classrooms) && classroomLoading}
                  helperText={isEmpty(classrooms) && classroomLoading ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
                  {...otherParams}
                  label='ห้องเรียน'
                  placeholder='เลือกห้องเรียน'
                  slotProps={{
                    input: {
                      ...InputProps,
                      ref: undefined,
                    },
                    inputLabel: {
                      ...InputLabelProps,
                      shrink: true,
                    },
                  }}
                />
              );
            }}
            groupBy={(option: any) => option.department?.name}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <FormControl fullWidth>
          <ThaiDatePicker
            label={datePickLabel}
            value={selectDate}
            onChange={onChangeDate}
            format='dd/MM/yyyy'
            minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
            maxDate={new Date()}
            placeholder='วัน/เดือน/ปี (พ.ศ.)'
          />
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 2,
        }}
      >
        <FormControl fullWidth>
          <Tooltip title='ค้นหา' arrow>
            <span>
              <Button
                fullWidth
                size='large'
                color='primary'
                variant='contained'
                startIcon={<Icon icon='icon-park-outline:people-search-one' />}
                sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                disabled={isEmpty(fullName) && isEmpty(selectDate) && isEmpty(defaultClassroom)}
                onClick={onSearch}
              >
                ค้นหา
              </Button>
            </span>
          </Tooltip>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 1,
        }}
      >
        <FormControl fullWidth>
          <Tooltip title='ล้างข้อมูลค้นหา' arrow>
            <span>
              <Button
                fullWidth
                size='large'
                color='warning'
                variant='contained'
                startIcon={<Icon icon='carbon:clean' />}
                sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                disabled={isEmpty(fullName) && isEmpty(selectDate) && isEmpty(defaultClassroom)}
                onClick={onClear}
              ></Button>
            </span>
          </Tooltip>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
