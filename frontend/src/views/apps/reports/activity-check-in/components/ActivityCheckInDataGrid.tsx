'use client';

import { Box, Typography, Chip, Paper, CircularProgress } from '@mui/material';
import RenderAvatar from '@/@core/components/avatar';
import {
  CheckboxStyled,
  TableContainerCustom,
  TableCustom,
  TableHeadCustom,
  TableBodyCustom,
  TableHeaderRowCustom,
  TableRowCustom,
  TableCellHeaderCustom,
  TableCellCustom,
  TablePaginationCustom,
} from '@/@core/components/mui/table';

interface ActivityCheckInDataGridProps {
  students: any[];
  loading: boolean;
  pageSize: number;
  currentPage: number;
  isPresentCheckAll: boolean;
  isAbsentCheckAll: boolean;
  isPresentCheck: any[];
  isAbsentCheck: any[];
  hasSavedCheckIn: boolean;
  onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
  onCellClick: (params: { field: string; row: any }) => void;
  onColumnHeaderClick: (params: { field: string }) => void;
}

// Column configuration for activity check-in (only present and absent)
const CHECKBOX_COLUMNS = [
  {
    field: 'present',
    label: 'เข้าร่วม',
    color: 'success' as const,
    status: 'เข้าร่วม',
    statusColor: 'success' as const,
  },
  {
    field: 'absent',
    label: 'ไม่เข้าร่วม',
    color: 'error' as const,
    status: 'ไม่เข้าร่วม',
    statusColor: 'error' as const,
  },
] as const;

// Total columns: ชื่อ-สกุล (1) + checkbox columns (2) + สถานะ (1) = 4
const TOTAL_COLUMNS = 1 + CHECKBOX_COLUMNS.length + 1;

const ActivityCheckInDataGrid = ({
  students,
  loading,
  pageSize,
  currentPage,
  isPresentCheckAll,
  isAbsentCheckAll,
  isPresentCheck,
  isAbsentCheck,
  hasSavedCheckIn,
  onPaginationModelChange,
  onCellClick,
  onColumnHeaderClick,
}: ActivityCheckInDataGridProps) => {
  // Map check states
  const checkStates = {
    present: { checkAll: isPresentCheckAll, checks: isPresentCheck },
    absent: { checkAll: isAbsentCheckAll, checks: isAbsentCheck },
  };

  const getStudentStatus = (studentId: any) => {
    for (const column of CHECKBOX_COLUMNS) {
      if (checkStates[column.field as keyof typeof checkStates].checks.includes(studentId)) {
        return { status: column.status, color: column.statusColor };
      }
    }
    return { status: 'ยังไม่เช็ค', color: 'default' as const };
  };

  // Ensure pageSize is always one of the valid options
  const validPageSizeOptions = [5, 10, 25, 50, 100];
  const validPageSize = validPageSizeOptions.includes(pageSize)
    ? pageSize
    : validPageSizeOptions.find((size) => size >= pageSize) || validPageSizeOptions[validPageSizeOptions.length - 1];

  // Calculate paginated data
  const startIndex = currentPage * validPageSize;
  const endIndex = startIndex + validPageSize;
  const paginatedStudents = students.slice(startIndex, endIndex);

  // Check if there are no students
  const isEmpty = students.length === 0;

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange({ page: newPage, pageSize: validPageSize });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPaginationModelChange({ page: 0, pageSize: newPageSize });
  };

  // Handle cell click
  const handleCellClick = (field: string, row: any) => {
    onCellClick({ field, row });
  };

  // Handle column header click
  const handleHeaderClick = (field: string) => {
    onColumnHeaderClick({ field });
  };

  return (
    <Box
      id='activity-checkin-students-datagrid'
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TableContainerCustom id='activity-checkin-students-table-container' component={Paper}>
        <TableCustom id='activity-checkin-students-table' stickyHeader size='small'>
          <TableHeadCustom id='activity-checkin-students-table-head'>
            <TableHeaderRowCustom id='activity-checkin-students-table-header-row'>
              {/* ชื่อ-สกุล Column */}
              <TableCellHeaderCustom
                id='activity-checkin-students-table-header-cell-fullname'
                sx={{
      minWidth: 220,
                }}
              >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'text.primary',
          }}
        >
          ชื่อ-สกุล
        </Typography>
              </TableCellHeaderCustom>

              {/* Checkbox Columns */}
              {CHECKBOX_COLUMNS.map((column) => {
                const state = checkStates[column.field as keyof typeof checkStates];
                const isAllChecked = state.checks.length === students.length;

                return (
                  <TableCellHeaderCustom
                    key={column.field}
                    id={`activity-checkin-students-table-header-cell-${column.field}`}
                    align='right'
                    sx={{
                      minWidth: 110,
                      cursor: hasSavedCheckIn ? 'default' : 'pointer',
                    }}
                    onClick={() => !hasSavedCheckIn && handleHeaderClick(column.field)}
                  >
                    <Box
                      id={`activity-checkin-${column.field}-header`}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'text.primary',
                        }}
                      >
                        {column.label}
                      </Typography>
                      <CheckboxStyled
                        id={`activity-checkin-${column.field}-select-all`}
                        color={column.color}
                        checked={state.checkAll || false}
                        indeterminate={!isAllChecked && state.checkAll}
                        disabled={hasSavedCheckIn}
                      />
                    </Box>
                  </TableCellHeaderCustom>
                );
              })}

              {/* สถานะ Column */}
              <TableCellHeaderCustom
                id='activity-checkin-students-table-header-cell-status'
                align='center'
                sx={{
                  minWidth: 110,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'text.primary',
                  }}
                >
                  สถานะ
                </Typography>
              </TableCellHeaderCustom>
            </TableHeaderRowCustom>
          </TableHeadCustom>
          <TableBodyCustom id='activity-checkin-students-table-body'>
            {loading ? (
              <TableRowCustom id='activity-checkin-students-table-loading-row'>
                <TableCellCustom
                  id='activity-checkin-students-table-loading-cell'
                  colSpan={TOTAL_COLUMNS}
                  align='center'
                  sx={{ height: 400 }}
                >
                  <CircularProgress />
                </TableCellCustom>
              </TableRowCustom>
            ) : paginatedStudents.length === 0 ? (
              <TableRowCustom id='activity-checkin-students-table-empty-row'>
                <TableCellCustom
                  id='activity-checkin-students-table-empty-cell'
                  colSpan={TOTAL_COLUMNS}
                  align='center'
                  sx={{ height: 400 }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    ไม่พบข้อมูลนักเรียน
                  </Typography>
                </TableCellCustom>
              </TableRowCustom>
            ) : (
              paginatedStudents.map((row: any, index: number) => {
                const { status, color } = getStudentStatus(row.id);
                const isLastRow = index === paginatedStudents.length - 1;

        return (
                  <TableRowCustom
                    key={row.id}
                    id={`activity-checkin-students-table-row-${row.id}`}
                  >
                    {/* ชื่อ-สกุล Cell */}
                    <TableCellCustom
                      id={`activity-checkin-students-table-cell-fullname-${row.id}`}
                      isLastRow={isLastRow}
                      sx={{
                        minWidth: 220,
                        ...(isLastRow && { borderBottom: 'none' }),
                      }}
                    >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={row} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                            noWrap
                variant='body1'
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary', 
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                }}
              >
                {row?.title + '' + row?.firstName + ' ' + row?.lastName}
              </Typography>
              <Typography
                            noWrap
                variant='body2'
                sx={{
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                }}
              >
                @{row?.studentId}
              </Typography>
            </Box>
          </Box>
                    </TableCellCustom>

                    {/* Checkbox Cells */}
                    {CHECKBOX_COLUMNS.map((column) => {
                      const state = checkStates[column.field as keyof typeof checkStates];

                      return (
                        <TableCellCustom
                          key={column.field}
                          id={`activity-checkin-students-table-cell-${column.field}-${row.id}`}
                          align='right'
                          isLastRow={isLastRow}
                          sx={{
      minWidth: 110,
                            cursor: hasSavedCheckIn || row.status === 'internship' ? 'default' : 'pointer',
                            paddingRight: 2.85,
                            ...(isLastRow && { borderBottom: 'none' }),
                          }}
                          onClick={() => !hasSavedCheckIn && row.status !== 'internship' && handleCellClick(column.field, row)}
                        >
          <CheckboxStyled
                            id={`activity-checkin-${column.field}-${row.id}`}
                            color={column.color}
                            checked={state.checks.includes(row.id) || false}
                            disabled={hasSavedCheckIn || row.status === 'internship'}
                            sx={{ padding: '4px' }}
                          />
                        </TableCellCustom>
                      );
                    })}

                    {/* สถานะ Cell */}
                    <TableCellCustom
                      id={`activity-checkin-students-table-cell-status-${row.id}`}
                      align='center'
                      isLastRow={isLastRow}
            sx={{
      minWidth: 110,
                        ...(isLastRow && { borderBottom: 'none' }),
                      }}
                    >
          <Chip
            id={`activity-checkin-status-${row.id}`}
            label={status}
            color={color as any}
            size='small'
            sx={{
              fontSize: '0.8125rem',
              height: 'auto',
              '& .MuiChip-label': {
                px: 1,
                py: 0.5,
              },
            }}
          />
                    </TableCellCustom>
                  </TableRowCustom>
                );
              })
            )}
          </TableBodyCustom>
        </TableCustom>
      </TableContainerCustom>

      {/* Pagination */}
      <TablePaginationCustom
        id='activity-checkin-students-table-pagination'
        component='div'
        count={students.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={validPageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={isEmpty ? [] : validPageSizeOptions}
        labelRowsPerPage={isEmpty ? '' : 'แสดง:'}
        labelDisplayedRows={({ from, to, count }) => {
          return `${from}-${to} จากทั้งหมด ${count}`;
        }}
      />
    </Box>
  );
};

export default ActivityCheckInDataGrid;
