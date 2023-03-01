import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import React, { ChangeEvent, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(5),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3),
  },
}));

interface CellType {
  row: any;
}

type Props = {
  classroomLoading: boolean;
  classrooms: any;
  defaultClassroom: any;
  handleCloseSelectStudents: () => void;
  onAddClassroom: () => void;
  onCloseClassroom: () => void;
  onHandleClassroomChange: (event: ChangeEvent<{}>, value: any) => void;
  onSelectionModelChange: (newSelection: any) => void;
  openSelectClassroom: boolean;
  selectClassrooms: any;
  studentLoading: boolean;
  students: any;
  studentsList: any;
};

export default function DialogClassroomGoodnessGroup({
  classroomLoading,
  classrooms,
  defaultClassroom,
  handleCloseSelectStudents,
  onAddClassroom,
  onCloseClassroom,
  onHandleClassroomChange,
  onSelectionModelChange,
  openSelectClassroom,
  selectClassrooms,
  studentLoading,
  students,
  studentsList,
}: Props) {
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
        <FormControl
          fullWidth
          sx={{
            my: 2,
          }}
        >
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
          sx={{
            my: 2,
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          my: 2,
        }}
      >
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
  );
}
