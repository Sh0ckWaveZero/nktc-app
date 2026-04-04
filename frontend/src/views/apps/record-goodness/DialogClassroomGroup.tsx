// Vercel best practice: Import directly from component files to avoid loading entire library (bundle-barrel-imports)
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createFilterOptions } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { ChangeEvent, startTransition, useCallback, useMemo, useState } from 'react';
import { ViewTransition } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';
import { getStudentName } from '@/utils/student';
import { useClassroomSelection } from '@/hooks/features/goodness';
import { StyledClassroomDialog } from './DialogClassroomGroup.styles';

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

// Define columns outside component to avoid recreation on each render (Vercel best practice: rerender-hoist-jsx)
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
      const studentId = row?.studentId || row?.student?.studentId || row?.username;
      return (
        <Typography noWrap variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
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
      const studentName = getStudentName(row);

      return (
        <Typography noWrap variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
          {studentName}
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
      const classroomName = row?.classroom?.name || row?.student?.classroom?.name || '-';

      return (
        <Typography noWrap variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
          {classroomName}
        </Typography>
      );
    },
  },
];

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
  const [localSelection, setLocalSelection] = useState<string[]>([]);

  // Use custom hook to get global selection (for preserving other classrooms)
  const { rowSelectionModel } = useClassroomSelection({
    studentsList,
    selectClassrooms,
    onSelectionModelChange,
  });

  // Get IDs of students from current classroom only
  const currentClassroomIds = useMemo(() => {
    if (!studentsList || !Array.isArray(studentsList)) return new Set<string>();
    return new Set(studentsList.filter(s => s?.id).map(s => String(s.id)));
  }, [studentsList]);

  // Sync local selection with current classroom selection from global state
  React.useEffect(() => {
    const currentRoomSelected = Array.from(rowSelectionModel.ids).filter(id => currentClassroomIds.has(id));
    setLocalSelection(currentRoomSelected);
  }, [rowSelectionModel.ids, currentClassroomIds]);

  // Count selected students from current classroom
  const currentClassroomSelectedCount = useMemo(() => {
    return localSelection.length;
  }, [localSelection]);

  // Memoize rows to prevent undefined errors
  const rows = useMemo(() => {
    if (!studentsList || !Array.isArray(studentsList) || !defaultClassroom) {
      return [];
    }

    const seen = new Set<string>();
    return studentsList
      .filter((row) => row?.id != null && !seen.has(row.id) && seen.add(row.id))
      .map((row, index) => ({
        ...row,
        id: String(row.id || `${defaultClassroom.id}-${index}`),
      }));
  }, [defaultClassroom, studentsList]);

  // Handle selection changes - updates both local state and global state
  const handleSelectionChange = useCallback((newSelection: any) => {
    let idArray: string[];

    // Handle both 'include' and 'exclude' types
    if (Array.isArray(newSelection)) {
      idArray = newSelection.map((id) => String(id));
    } else if (typeof newSelection === 'object' && 'ids' in newSelection) {
      if (newSelection.type === 'exclude') {
        // 'exclude' with empty ids = select all
        idArray = rows.map(row => row.id);
      } else {
        // 'include' type
        idArray = Array.from(newSelection.ids || []).map((id) => String(id));
      }
    } else {
      idArray = [];
    }

    // Update local state for DataGrid
    setLocalSelection(idArray);

    // Preserve selections from other classrooms
    const otherRoomsSelected = Array.isArray(selectClassrooms)
      ? selectClassrooms.filter((s: any) => {
          if (!s || !s.id) return false;
          return !currentClassroomIds.has(String(s.id));
        })
      : [];

    const currentRoomStudents = Array.isArray(studentsList)
      ? studentsList.filter((s) => s && s.id && idArray.includes(String(s.id)))
      : [];

    onSelectionModelChange([...otherRoomsSelected, ...currentRoomStudents]);
  }, [currentClassroomIds, selectClassrooms, studentsList, rows, onSelectionModelChange]);

  // Sort classrooms by department name to prevent duplicate headers in Autocomplete groupBy
  const sortedClassrooms = useMemo(() => {
    if (!Array.isArray(classrooms)) return [];
    return [...classrooms].sort((a, b) => {
      const deptA = a?.department?.name ?? '';
      const deptB = b?.department?.name ?? '';
      return deptA.localeCompare(deptB, 'th');
    });
  }, [classrooms]);

  return (
    <StyledClassroomDialog
      onClose={handleCloseSelectStudents}
      aria-labelledby='dialog-classroom-group-title'
      open={openSelectClassroom}
      fullWidth
      maxWidth={'sm'}
    >
      {onCloseClassroom ? (
        <IconButton
          id='dialog-classroom-group-close-button'
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
      <DialogTitle id='dialog-classroom-group-title'>
        เพิ่มรายชื่อตามห้องเรียน
        {defaultClassroom ? `- ${defaultClassroom.name}` : ''}
      </DialogTitle>
      <DialogContent>
        <FormControl
          id='dialog-classroom-group-classroom-form'
          fullWidth
          sx={{
            my: 2,
          }}
        >
          <Autocomplete
            id='dialog-classroom-group-classroom-select'
            limitTags={15}
            value={defaultClassroom}
            options={sortedClassrooms}
            onChange={(_, newValue: any) => {
              startTransition(() => {
                onHandleClassroomChange(_, newValue);
              });
            }}
            filterOptions={filterOptions}
            getOptionLabel={(option: any) => option?.name ?? ''}
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(props, option) => {
              // eslint-disable-next-line react/prop-types
              const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
              return (
                <li key={key} {...rest}>
                  {option.name}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={isEmpty(classrooms) && classroomLoading}
                label='ค้นหาห้องเรียน'
                placeholder='ค้นหาห้องเรียน'
              />
            )}
            groupBy={(option: any) => option?.department?.name}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
        <ViewTransition enter='fade-in' exit='fade-out' default='none'>
          {!defaultClassroom || !Array.isArray(studentsList) || studentsList.length === 0 ? (
            <Box
              id='dialog-classroom-group-empty-state'
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300,
                my: 2,
              }}
            >
              <Typography
                id='dialog-classroom-group-empty-message'
                variant='body2'
                color='text.secondary'
              >
                กรุณาเลือกห้องเรียนเพื่อแสดงรายชื่อนักเรียน
              </Typography>
            </Box>
          ) : (
            <Box id='dialog-classroom-group-content'>
              <Box
                id='dialog-classroom-group-selection-controls'
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  gap: 2,
                }}
              >
                <Typography
                  id='dialog-classroom-group-selection-count'
                  variant='body2'
                  color='text.secondary'
                >
                  เลือกแล้ว {currentClassroomSelectedCount} คน
                </Typography>
                <Box id='dialog-classroom-group-selection-buttons' sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    id='dialog-classroom-group-select-all-button'
                    size='small'
                    variant='outlined'
                    color='primary'
                    onClick={() => {
                      const allIds = rows.map(row => row.id);
                      handleSelectionChange({ type: 'include', ids: new Set(allIds) });
                    }}
                    disabled={rows.length === 0}
                  >
                    เลือกทั้งหมด
                  </Button>
                  <Button
                    id='dialog-classroom-group-clear-selection-button'
                    size='small'
                    variant='outlined'
                    color='secondary'
                    onClick={() => {
                      handleSelectionChange({ type: 'include', ids: new Set() });
                    }}
                    disabled={currentClassroomSelectedCount === 0}
                  >
                    ยกเลิกการเลือก
                  </Button>
                </Box>
              </Box>
              <DataGrid
              key={`datagrid-${defaultClassroom?.id || 'none'}`}
              autoHeight
              checkboxSelection
              columns={columns}
              rows={rows}
              disableColumnMenu
              loading={studentLoading}
              getRowId={(row) => String(row.id)}
              getRowHeight={() => 'auto'}
              paginationModel={{ pageSize: pageSize, page: 0 }}
              pageSizeOptions={[10, 20, 50, 100]}
              onPaginationModelChange={(model) => setPageSize(model.pageSize)}
              rowSelectionModel={{ type: 'include' as const, ids: new Set(localSelection) }}
              onRowSelectionModelChange={handleSelectionChange}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              slotProps={{
                pagination: {
                  labelRowsPerPage: 'แสดง:',
                },
                baseSelect: {
                  onClick: (e) => {
                    // Prevent default and handle select all
                    e.stopPropagation();
                    const allIds = rows.map(row => row.id);
                    handleSelectionChange(allIds);
                  },
                },
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
            </Box>
          )}
        </ViewTransition>
      </DialogContent>
      <DialogActions
        id='dialog-classroom-group-actions'
        sx={{
          my: 2,
        }}
      >
        <Tooltip title='เพิ่มรายชื่อของนักเรียนตามชั้นเรียนสำหรับแสดงในตาราง' arrow describeChild>
          <span>
            <Button
              id='dialog-classroom-group-add-button'
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
    </StyledClassroomDialog>
  );
}
