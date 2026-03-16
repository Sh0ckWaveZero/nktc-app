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
  createFilterOptions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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

interface Classroom {
  id: string;
  name: string;
  [key: string]: any;
}

interface Student {
  id: string;
  studentId: string;
  fullName?: string;
  title?: string;
  account?: {
    title?: string;
    firstName?: string;
    lastName?: string;
  };
  classroom?: {
    name: string;
  };
  [key: string]: any;
}

type Props = {
  classroomLoading: boolean;
  classrooms: Classroom[];
  defaultClassroom: Classroom | null;
  handleCloseSelectStudents: () => void;
  onAddClassroom: () => void;
  onCloseClassroom: () => void;
  onHandleClassroomChange: (event: ChangeEvent<any>, value: Classroom | null) => void;
  onSelectionModelChange: (newSelection: any) => void;
  openSelectClassroom: boolean;
  selectClassrooms: any;
  studentLoading: boolean;
  studentsList: Student[];
};

// Create filter options outside component to avoid recreation on each render
const filterOptions = createFilterOptions<any>({
  matchFrom: 'any',
  stringify: (option: any) => option?.name || '',
});

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
  studentsList,
}: Props) {
  const [pageSize, setPageSize] = useState(10);


  const columns: GridColDef[] = [
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        // Support both API structures
        const studentId = row?.studentId || row?.student?.studentId || row?.username;
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
        // Support both API structures
        const fullName = row?.fullName;
        const title = row?.title;
        const account = row?.account;
        
        // Priority: Direct fields -> Account fields
        const displayTitle = title || account?.title || '';
        const displayName = fullName || (account?.firstName ? `${account.firstName} ${account.lastName}` : '');
        
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {displayTitle}{displayName}
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'classroom',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        // Support both API structures
        const classroomName = row?.classroom?.name || row?.student?.classroom?.name || '-';
        
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {classroomName}
          </Typography>
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
            options={Array.isArray(classrooms) ? classrooms : []}
            onChange={(_, newValue: any) => onHandleClassroomChange(_, newValue)}
            filterOptions={filterOptions}
            getOptionLabel={(option: any) => option?.name ?? ''}
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(props, option) => <li {...props}>{option.name}</li>}
            renderInput={(params: any) => (
              <TextField
                {...params}
                error={isEmpty(classrooms) && classroomLoading}
                label='ค้นหาห้องเรียน'
                placeholder='ค้นหาห้องเรียน'
                slotProps={{
                  input: {
                    ...params.InputProps,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}
            groupBy={(option: any) => option?.department?.name}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
        <DataGrid
          autoHeight
          checkboxSelection
          columns={columns}
          rows={
            defaultClassroom && Array.isArray(studentsList) 
              ? studentsList.filter((v, i, a) => v.id && a.findIndex(t => t.id === v.id) === i) 
              : []
          }
          disableColumnMenu
          loading={studentLoading}
          getRowId={(row) => row.id}
          keepNonExistentRowsSelected
          getRowHeight={() => 'auto'}
          initialState={{
            pagination: {
              paginationModel: { pageSize: pageSize, page: 0 },
            },
          }}
          pageSizeOptions={[pageSize, 10, 20, 50, 100]}
          onPaginationModelChange={(model) => setPageSize(model.pageSize)}
          rowSelectionModel={
            Array.isArray(selectClassrooms)
              ? selectClassrooms
                  .filter((s: any) => s && s.id) // Filter out null/undefined items and items without id
                  .map((s: any) => s.id)
              : ([] as any)
          }
          onRowSelectionModelChange={(ids) => {
            // Safety check: ensure ids exists and is valid
            if (ids == null) {
              onSelectionModelChange([]);
              return;
            }

            // Handle different possible formats of ids parameter
            let idArray: any[] = [];
            if (Array.isArray(ids)) {
              idArray = ids;
            } else if (typeof ids === 'object' && 'ids' in ids) {
              idArray = (ids as any).ids || [];
            }

            // Ensure we have a valid array
            if (!Array.isArray(idArray)) {
              idArray = [];
            }

            // Filter out null/undefined values from the array
            const validIds = idArray.filter((id) => id != null);

            // If no valid selections, keep only students from other classrooms
            if (validIds.length === 0) {
              const otherRoomsSelected = Array.isArray(selectClassrooms)
                ? selectClassrooms.filter((s: any) => {
                    if (!s || !s.id) return false;
                    if (!Array.isArray(studentsList)) return true;
                    return !studentsList.some((sl) => sl && sl.id === s.id);
                  })
                : [];
              onSelectionModelChange(otherRoomsSelected);
              return;
            }

            // Create Set from valid IDs - now we're guaranteed to have an array
            const selectedIDs = new Set(validIds);

            // 1. Get selected students from current view (current classroom)
            const currentRoomSelected = Array.isArray(studentsList)
              ? studentsList.filter((s) => s && s.id && selectedIDs.has(s.id))
              : [];

            // 2. Keep students selected from OTHER classrooms (not in current list)
            const otherRoomsSelected = Array.isArray(selectClassrooms)
              ? selectClassrooms.filter((s: any) => {
                  if (!s || !s.id) return false;
                  if (!Array.isArray(studentsList)) return true;
                  return !studentsList.some((sl) => sl && sl.id === s.id);
                })
              : [];

            // 3. Combine and send to parent
            onSelectionModelChange([...otherRoomsSelected, ...currentRoomSelected]);
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{
            minHeight: 300,
            my: 2,
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              maxHeight: 'none !important',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              lineHeight: 'unset !important',
              maxHeight: 'none !important',
              overflow: 'visible',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            },
            '& .MuiDataGrid-renderingZone': {
              maxHeight: 'none !important',
            },
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
