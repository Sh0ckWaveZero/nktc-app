'use client';

import { Box, styled, Container, Checkbox, Typography, Chip, CheckboxProps } from '@mui/material';
import { DataGrid, GridColDef, GridCellParams, GridEventListener, gridClasses } from '@mui/x-data-grid';
import Icon from '@/@core/components/icon';
import RenderAvatar from '@/@core/components/avatar';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';

const CheckboxStyled = styled(Checkbox)<CheckboxProps>(() => ({
  padding: '0 0 0 4px',
}));

interface CheckInDataGridProps {
  students: any[];
  loading: boolean;
  pageSize: number;
  currentPage: number;
  isPresentCheckAll: boolean;
  isAbsentCheckAll: boolean;
  isLateCheckAll: boolean;
  isLeaveCheckAll: boolean;
  isInternshipCheckAll: boolean;
  isPresentCheck: any[];
  isAbsentCheck: any[];
  isLateCheck: any[];
  isLeaveCheck: any[];
  isInternshipCheck: any[];
  onPaginationModelChange: (model: any) => void;
  onCellClick: GridEventListener<'cellClick'>;
  onColumnHeaderClick: GridEventListener<'columnHeaderClick'>;
  storedToken: string;
}

const DataGridCustom = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.internship`]: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    '&:hover, &.Mui-hovered': {
      backgroundColor: theme.palette.primary.main + '20',
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main + '20' + theme.palette.action.selectedOpacity,
      '&:hover, &.Mui-hovered': {
        backgroundColor:
          theme.palette.primary.main + '20' + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        '@media (hover: none)': {
          backgroundColor: theme.palette.primary.main + '20' + theme.palette.action.selectedOpacity,
        },
      },
    },
  },
}));

const CheckInDataGrid = ({
  students,
  loading,
  pageSize,
  currentPage,
  isPresentCheckAll,
  isAbsentCheckAll,
  isLateCheckAll,
  isLeaveCheckAll,
  isInternshipCheckAll,
  isPresentCheck,
  isAbsentCheck,
  isLateCheck,
  isLeaveCheck,
  isInternshipCheck,
  onPaginationModelChange,
  onCellClick,
  onColumnHeaderClick,
  storedToken,
}: CheckInDataGridProps) => {
  const getStudentStatus = (studentId: any) => {
    if (isPresentCheck.includes(studentId)) return { status: 'มาเรียน', color: 'success' as const };
    if (isAbsentCheck.includes(studentId)) return { status: 'ขาดเรียน', color: 'error' as const };
    if (isLateCheck.includes(studentId)) return { status: 'มาสาย', color: 'warning' as const };
    if (isLeaveCheck.includes(studentId)) return { status: 'ลา', color: 'info' as const };
    if (isInternshipCheck.includes(studentId)) return { status: 'ฝึกงาน', color: 'secondary' as const };
    return { status: 'ยังไม่เช็ค', color: 'default' as const };
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 220,
      field: 'fullName',
      headerName: 'ชื่อ-สกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: any) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={row} storedToken={storedToken} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                variant='body2'
                sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
              >
                {row?.title + '' + row?.firstName + ' ' + row?.lastName}
              </Typography>
              <Typography
                noWrap
                variant='caption'
                sx={{
                  textDecoration: 'none',
                }}
              >
                @{row?.studentId}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'present',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center' as any,
      renderHeader: () => (
        <Container
          id='checkin-present-header'
          className='MuiDataGrid-columnHeaderTitle'
          sx={{ display: 'flex', textAlign: 'center' }}
        >
          {'เข้าร่วม'}
          <CheckboxStyled
            id='checkin-present-select-all'
            color='success'
            checked={isPresentCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isPresentCheck.length === students.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          id={`checkin-present-${params.id}`}
          color='success'
          checked={isPresentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'absent',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center' as any,
      renderHeader: () => (
        <Container
          id='checkin-absent-header'
          className='MuiDataGrid-columnHeaderTitle'
          sx={{ display: 'flex', textAlign: 'start' }}
        >
          {'ไม่เข้าร่วม'}
          <CheckboxStyled
            id='checkin-absent-select-all'
            color='error'
            checked={isAbsentCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isAbsentCheck.length === students.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          id={`checkin-absent-${params.id}`}
          color='error'
          checked={isAbsentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'leave',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center' as any,
      renderHeader: () => (
        <Container
          id='checkin-leave-header'
          className='MuiDataGrid-columnHeaderTitle'
          sx={{ display: 'flex', textAlign: 'center' }}
        >
          {'ลา'}
          <CheckboxStyled
            id='checkin-leave-select-all'
            color='info'
            checked={isLeaveCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isLeaveCheck.length === students.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          id={`checkin-leave-${params.id}`}
          color='info'
          checked={isLeaveCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'late',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center' as any,
      renderHeader: () => (
        <Container
          id='checkin-late-header'
          className='MuiDataGrid-columnHeaderTitle'
          sx={{ display: 'flex', textAlign: 'center' }}
        >
          {'สาย'}
          <CheckboxStyled
            id='checkin-late-select-all'
            color='warning'
            checked={isLateCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isLateCheck.length === students.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          id={`checkin-late-${params.id}`}
          color='warning'
          checked={isLateCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'internship',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center' as any,
      renderHeader: () => (
        <Container
          id='checkin-internship-header'
          className='MuiDataGrid-columnHeaderTitle'
          sx={{ display: 'flex', textAlign: 'center' }}
        >
          {'ฝึกงาน'}
          <CheckboxStyled
            id='checkin-internship-select-all'
            color='secondary'
            checked={isInternshipCheckAll || false}
            icon={<Icon fontSize='1.5rem' icon={'material-symbols:check-box-outline-blank'} />}
            checkedIcon={
              <Icon
                fontSize='1.5rem'
                icon={
                  isInternshipCheck.length === students.length
                    ? 'material-symbols:check-box-rounded'
                    : 'material-symbols:indeterminate-check-box-rounded'
                }
              />
            }
          />
        </Container>
      ),
      renderCell: (params: GridCellParams) => (
        <Checkbox
          id={`checkin-internship-${params.id}`}
          color='secondary'
          checked={isInternshipCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
        />
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'status',
      headerName: 'สถานะ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: any) => {
        const { status, color } = getStudentStatus(row.id);
        return (
          <Chip
            id={`checkin-status-${row.id}`}
            label={status}
            color={color as any}
            size='small'
            sx={{
              fontSize: '0.75rem',
              height: 'auto',
              '& .MuiChip-label': {
                px: 1,
                py: 0.5,
              },
            }}
          />
        );
      },
    },
  ];

  return (
    <div id='checkin-students-datagrid'>
      <DataGridCustom
        columns={columns}
        rows={students}
        disableColumnMenu
        loading={loading}
        rowHeight={50}
        pagination
        paginationModel={{ page: currentPage, pageSize: pageSize }}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        onCellClick={onCellClick}
        onColumnHeaderClick={onColumnHeaderClick}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
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
    </div>
  );
};

export default CheckInDataGrid;
