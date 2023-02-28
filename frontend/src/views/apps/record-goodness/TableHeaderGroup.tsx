import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { ChangeEvent, Fragment, useState } from 'react';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';

interface CellType {
  row: any;
}

interface TableHeaderProps {

  classroomLoading: boolean;
  classrooms: any;
  defaultClassroom: any;
  handleCloseSelectStudents: () => void;
  onAddClassroom: () => void;
  onAddStudents: () => void;
  onCloseClassroom: () => void;
  onHandleClassroomChange: (event: ChangeEvent<{}>, value: any) => void;
  onOpenClassroom: () => void;
  onOpenGoodnessDetail: () => void;
  onOpenSelectStudents: () => void;
  onSearchStudents: (event: ChangeEvent<{}>, value: any, reason: any) => void;
  onSelectionModelChange: (newSelection: any) => void;
  onSelectStudents: (event: ChangeEvent<{}>, value: any) => void;
  openClassroom: boolean;
  openSelectClassroom: boolean;
  openSelectStudents: boolean;
  selectClassrooms: any;
  studentLoading: boolean;
  students: any;
  studentsList: any;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(5),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3),
  },
}));

const icon = <MdCheckBoxOutlineBlank />;
const checkedIcon = <MdCheckBox />;

const TableHeaderGroup = (props: TableHeaderProps) => {
  // ** Props
  const {
    classroomLoading,
    classrooms,
    defaultClassroom,
    handleCloseSelectStudents,
    onAddClassroom,
    onAddStudents,
    onCloseClassroom,
    onHandleClassroomChange,
    onOpenClassroom,
    onOpenGoodnessDetail,
    onOpenSelectStudents,
    onSearchStudents,
    onSelectionModelChange,
    onSelectStudents,
    openClassroom,
    openSelectClassroom,
    openSelectStudents,
    selectClassrooms,
    studentLoading,
    students,
    studentsList,
  } = props;

  const [pageSize, setPageSize] = useState(students.length > 0 ? students.length : 10);

  const columns: GridColumns = [
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { studentId } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {studentId}
          </Typography>
        );
      },
    },
    {
      flex: 0.17,
      minWidth: 150,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { title, fullName } = row;

        const studentName = title + fullName;
        return (
          <Tooltip title={studentName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {studentName}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'classroomName',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { classroom } = row;
        return (
          <Tooltip title={classroom?.name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {classroom?.name}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Fragment>
      <Grid
        container
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Grid item xs={12} sm={6}>
          <Grid
            container
            spacing={2}
            sx={{
              p: 5,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Tooltip title='เพิ่มรายชื่อนักเรียนมากกว่าหนึ่ง' arrow>
                  <span>
                    <Button
                      fullWidth
                      size='large'
                      color='primary'
                      variant='contained'
                      startIcon={<Icon icon='fluent:people-community-add-20-filled' />}
                      sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                      onClick={onOpenSelectStudents}
                    >
                      เพิ่มชื่อ
                    </Button>
                  </span>
                </Tooltip>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Tooltip title='เพิ่มรายชื่อรายชั้นเรียน' arrow>
                  <span>
                    <Button
                      fullWidth
                      size='large'
                      color='warning'
                      variant='contained'
                      startIcon={<Icon icon='mdi:google-classroom' />}
                      sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                      onClick={onOpenClassroom}
                    >
                      เพิ่มชั้นเรียน
                    </Button>
                  </span>
                </Tooltip>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid
            container
            sx={{
              p: 5,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <Tooltip title='เพิ่มรายละเอียดต่าง ๆ ในการบันทึกความดี' arrow>
                  <span>
                    <Button
                      fullWidth
                      size='large'
                      color='success'
                      variant='contained'
                      startIcon={<Icon icon='mdi:star-plus-outline' />}
                      sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
                      disabled={isEmpty(students)}
                      onClick={onOpenGoodnessDetail}
                    >
                      เพิ่มรายละเอียด
                    </Button>
                  </span>
                </Tooltip>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <BootstrapDialog
        onClose={handleCloseSelectStudents}
        aria-labelledby='บรรทึกความดี'
        open={openSelectStudents}
        fullWidth
        maxWidth={'sm'}
      >
        {handleCloseSelectStudents ? (
          <IconButton
            aria-label='close'
            onClick={handleCloseSelectStudents}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
        <DialogTitle id='บรรทึกความดี'>เพิ่มรายชื่อนักเรียน</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 2 }}>
            <Autocomplete
              id='checkboxes-tags-classroom'
              multiple
              limitTags={20}
              options={studentsList}
              onChange={onSelectStudents}
              onInputChange={onSearchStudents}
              loading={studentLoading}
              getOptionLabel={(option: any) => `${option?.title}${option?.fullName} `}
              isOptionEqualToValue={(option: any, value: any) => option === value}
              renderOption={(props, option, { selected }) => (
                <li key={option?.id} {...props}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                  {`${option?.title}${option?.fullName} `}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label='รายชื่อนักเรียน' placeholder='เพิ่มรายชื่อนักเรียน' />
              )}
              disableCloseOnSelect
              filterSelectedOptions
              groupBy={(option: any) => option.department?.name}
              noOptionsText='ไม่พบข้อมูล'
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ my: 2 }}>
          <Tooltip title='เพิ่มรายชื่อนักเรียนสำหรับแสดงในตาราง' arrow>
            <span>
              <Button
                fullWidth
                size='medium'
                color='primary'
                variant='contained'
                startIcon={<Icon icon='fluent:people-community-add-20-filled' />}
                onClick={onAddStudents}
              >
                เพิ่มรายชื่อ
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </BootstrapDialog>

      <BootstrapDialog
        onClose={handleCloseSelectStudents}
        aria-labelledby='บรรทึกความดี'
        open={openSelectClassroom}
        fullWidth
        maxWidth={'sm'}
      >
        {onCloseClassroom ? (
          <IconButton
            aria-label='close'
            onClick={onCloseClassroom}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
        <DialogTitle id='บรรทึกความดี'>เพิ่มรายชื่อตามห้องเรียน</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 2 }}>
            <Autocomplete
              id='classroom'
              limitTags={15}
              value={defaultClassroom}
              options={classrooms}
              onChange={(_, newValue: any) => onHandleClassroomChange(_, newValue)}
              getOptionLabel={(option: any) => option?.name ?? ''}
              isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
              renderOption={(props, option) => (
                <li key={option.classroomId} {...props}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  error={isEmpty(classrooms) && classroomLoading}
                  helperText={isEmpty(classrooms) && classroomLoading ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
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
          <DataGrid
            checkboxSelection
            autoHeight
            columns={columns}
            rows={defaultClassroom ? studentsList : []}
            disableColumnMenu
            loading={studentLoading}
            rowsPerPageOptions={[pageSize, 10, 20, 50, 100]}
            onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
            onSelectionModelChange={onSelectionModelChange}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{ my: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ my: 2 }}>
          <Tooltip title='เพิ่มรายชื่อของนักเรียนตามชั้นเรียนสำหรับแสดงในตาราง' arrow>
            <span>
              <Button
                fullWidth
                size='medium'
                color='warning'
                variant='contained'
                startIcon={<Icon icon='mdi:google-classroom' />}
                disabled={isEmpty(selectClassrooms)}
                onClick={() => onAddClassroom()}
              >
                เพิ่มรายชื่อ
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </BootstrapDialog>
    </Fragment>
  );
};

export default TableHeaderGroup;
