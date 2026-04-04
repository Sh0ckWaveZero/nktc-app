'use client';

import { Avatar, Box, Button, Card, CardHeader, Paper, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useContext, useDeferredValue, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import { TableEmptyState } from '@/@core/components/check-in/CustomNoRowsOverlay';
import DialogAddGroup from '@/views/apps/record-goodness/DialogAddGroup';
import DialogClassroomGoodnessGroup from '@/views/apps/record-goodness/DialogClassroomGroup';
import DialogStudentGroup from '@/views/apps/record-goodness/DialogStudentsGroup';
import Grid from '@mui/material/Grid';
import { HiOutlineStar } from 'react-icons/hi';
import Icon from '@/@core/components/icon';
import TableHeaderGroup from '@/views/apps/record-goodness/TableHeaderGroup';
import {
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
import { useAuth } from '@/hooks/useAuth';
import { useClassrooms, useStudents } from '@/hooks/queries';
import { toast } from 'react-toastify';
import { getStudentName, getStudentId, getStudentClassroom } from '@/utils/student';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}


const RecordGoodnessGroupPage = () => {
  // ** Hooks
  const auth = useAuth();
  const ability = useContext(AbilityContext);

  // ** Local State
  const [students, setStudents] = useState<any>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [defaultClassroom, setDefaultClassroom] = useState<any>(null);
  const [selectStudents, setSelectStudents] = useState<any>([]);
  const [searchValue, setSearchValue] = useState<any>(undefined);
  const deferredValue = useDeferredValue(searchValue);
  const [openSelectStudents, setOpenSelectStudents] = useState(false);
  const [openGoodnessDetail, setOpenGoodnessDetail] = useState(false);
  const [openSelectClassroom, setOpenSelectClassroom] = useState(false);
  const [selectClassrooms, setSelectClassrooms] = useState<any>([]);

  // React Query hooks
  const { data: classrooms = [], isLoading: classroomLoading, error: classroomError } = useClassrooms();
  const { data: studentsList = [], isLoading: studentLoading, error: studentsError } = useStudents(deferredValue);

  // Extract actual data arrays from API responses
  // API returns: { success, statusCode, message, data: [...], meta }
  const classroomsArray = React.useMemo(() => {
    return Array.isArray(classrooms)
      ? classrooms
      : (classrooms as any)?.data || [];
  }, [classrooms]);

  const studentsArray = React.useMemo(() => {
    return Array.isArray(studentsList) 
      ? studentsList 
      : (studentsList as any)?.data || [];
  }, [studentsList]);

  // Show error toast if queries fail
  if (classroomError) {
    toast.error('เกิดข้อผิดพลาดในการโหลดห้องเรียน');
  }
  if (studentsError) {
    toast.error((studentsError as any)?.message || 'เกิดข้อผิดพลาดในการค้นหานักเรียน');
  }

  const onSelectStudents = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setSelectStudents(newValue);
    },
    [setSelectStudents],
  );

  const onSearchStudents = useCallback((_event: any, value: any, _reason: any) => {
    // Call API on every input change for server-side filtering
    if (!value || value.trim() === '') {
      setSearchValue(undefined);
    } else {
      setSearchValue({ fullName: value });
    }
  }, []);

  const handleCloseSelectStudents = () => {
    setOpenSelectStudents(false);
  };

  const onHandleClassroomChange = useCallback(
    (e: any, newValue: any) => {
      e.preventDefault();
      setDefaultClassroom(newValue);
      setSearchValue({ classroomId: newValue?.id });
    },
    [setDefaultClassroom],
  );

  const handleAddStudents = useCallback(() => {
    handleCloseSelectStudents();
const selectedIds = selectStudents.map((student: any) => student.id);
    const uniqueStudents = students.filter((student: any) => !selectedIds.includes(student.id));
    setStudents([...uniqueStudents, ...selectStudents]);
  }, [students, selectStudents]);

  const handleDeleteStudent = useCallback(
    (id: any) => {
      const newStudents = students.filter((student: any) => student.id !== id);
      setStudents(newStudents);
    },
    [students],
  );

  const onOpenSelectStudents = () => {
    setOpenSelectStudents(true);
  };

  const onOpenSelectClassroom = () => {
    setOpenSelectClassroom(true);
  };

  const handleCloseClassroom = () => {
    setOpenSelectClassroom(false);
  };

  const onOpenGoodnessDetail = () => {
    setOpenGoodnessDetail(true);
  };

  const handleCloseGoodnessDetail = () => {
    setOpenGoodnessDetail(false);
  };

  const onSelectionModelChange = useCallback(
    (newSelection: any) => {
      setSelectClassrooms(newSelection);
    },
    [setSelectClassrooms],
  );

  const onAddClassroom = useCallback(() => {
    handleCloseClassroom();
    setDefaultClassroom(null);

    const validSelectedStudents = Array.isArray(selectClassrooms) 
      ? selectClassrooms.filter((s: any) => s && s.id) 
      : [];
      
    const selectedIds = validSelectedStudents.map((student: any) => student.id);
    
    const currentStudents = Array.isArray(students) ? students : [];
    const uniqueStudents = currentStudents.filter((student: any) => student && !selectedIds.includes(student.id));

    setStudents([...uniqueStudents, ...validSelectedStudents]);
    setSearchValue({ classroomId: null });
  }, [students, selectClassrooms]);

  const handleSusses = useCallback(() => {
    setStudents([]);
    setDefaultClassroom(null);
    setSearchValue({ fullName: null });
    setCurrentPage(0);
  }, []);

  // ** Pagination logic
  const validPageSizeOptions = [10, 20, 50, 100];
  const validPageSize = validPageSizeOptions.includes(pageSize)
    ? pageSize
    : validPageSizeOptions.find((size) => size >= pageSize) || validPageSizeOptions[validPageSizeOptions.length - 1];

  const startIndex = currentPage * validPageSize;
  const endIndex = startIndex + validPageSize;
  const paginatedStudents = students.slice(startIndex, endIndex);
  const isEmpty = students.length === 0;

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

  return (
    ability?.can('read', 'report-goodness-page') &&
    auth?.user?.role !== 'Admin' && (
      <React.Fragment>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <HiOutlineStar />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`บันทึกการทำความดีแบบกลุ่ม ${students.length} คน`}
              />
              <TableHeaderGroup
                onOpenClassroom={onOpenSelectClassroom}
                onOpenGoodnessDetail={onOpenGoodnessDetail}
                onOpenSelectStudents={onOpenSelectStudents}
                students={students}
                tooltipName='เพิ่มรายละเอียดต่าง ๆ ในการบันทึกความดี'
              />
              <Box
                id='record-goodness-group-datagrid'
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <TableContainerCustom id='record-goodness-group-table-container' component={Paper}>
                  <TableCustom id='record-goodness-group-table' stickyHeader size='small'>
                    <TableHeadCustom id='record-goodness-group-table-head'>
                      <TableHeaderRowCustom id='record-goodness-group-table-header-row'>
                        <TableCellHeaderCustom
                          id='record-goodness-group-table-header-cell-studentId'
                          sx={{ minWidth: 160 }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: 'text.primary',
                            }}
                          >
                            รหัสนักเรียน
                          </Typography>
                        </TableCellHeaderCustom>
                        <TableCellHeaderCustom
                          id='record-goodness-group-table-header-cell-fullName'
                          sx={{ minWidth: 150 }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: 'text.primary',
                            }}
                          >
                            ชื่อ-นามสกุล
                          </Typography>
                        </TableCellHeaderCustom>
                        <TableCellHeaderCustom
                          id='record-goodness-group-table-header-cell-classroom'
                          sx={{ minWidth: 160 }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: 'text.primary',
                            }}
                          >
                            ชั้นเรียน
                          </Typography>
                        </TableCellHeaderCustom>
                        <TableCellHeaderCustom
                          id='record-goodness-group-table-header-cell-action'
                          align='center'
                          sx={{ minWidth: 100 }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: 'text.primary',
                            }}
                          >
                            ดำเนินการ
                          </Typography>
                        </TableCellHeaderCustom>
                      </TableHeaderRowCustom>
                    </TableHeadCustom>
                    <TableBodyCustom id='record-goodness-group-table-body'>
                      {paginatedStudents.length === 0 ? (
                        <TableRowCustom id='record-goodness-group-table-empty-row'>
                          <TableCellCustom
                            id='record-goodness-group-table-empty-cell'
                            colSpan={4}
                            align='center'
                            sx={{ height: 400 }}
                          >
                            <TableEmptyState text='ไม่พบข้อมูลนักเรียน' />
                          </TableCellCustom>
                        </TableRowCustom>
                      ) : (
                        paginatedStudents.map((row: any, index: number) => {
                          const { id } = row;
                          const studentName = getStudentName(row);
                          const studentId = getStudentId(row);
                          const classroom = getStudentClassroom(row);
                          const isLastRow = index === paginatedStudents.length - 1;

                          return (
                            <TableRowCustom key={id} id={`record-goodness-group-table-row-${id}`}>
                              <TableCellCustom
                                id={`record-goodness-group-table-cell-studentId-${id}`}
                                isLastRow={isLastRow}
                                sx={{
                                  minWidth: 160,
                                  ...(isLastRow && { borderBottom: 'none' }),
                                }}
                              >
                                <Typography
                                  noWrap
                                  variant='body2'
                                  sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
                                >
                                  {studentId}
                                </Typography>
                              </TableCellCustom>
                              <TableCellCustom
                                id={`record-goodness-group-table-cell-fullName-${id}`}
                                isLastRow={isLastRow}
                                sx={{
                                  minWidth: 150,
                                  ...(isLastRow && { borderBottom: 'none' }),
                                }}
                              >
                                <Tooltip title={studentName} arrow>
                                  <Typography
                                    noWrap
                                    variant='body2'
                                    sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
                                  >
                                    {studentName}
                                  </Typography>
                                </Tooltip>
                              </TableCellCustom>
                              <TableCellCustom
                                id={`record-goodness-group-table-cell-classroom-${id}`}
                                isLastRow={isLastRow}
                                sx={{
                                  minWidth: 160,
                                  ...(isLastRow && { borderBottom: 'none' }),
                                }}
                              >
                                <Tooltip title={classroom?.name} arrow>
                                  <Typography
                                    noWrap
                                    variant='body2'
                                    sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
                                  >
                                    {classroom?.name || '-'}
                                  </Typography>
                                </Tooltip>
                              </TableCellCustom>
                              <TableCellCustom
                                id={`record-goodness-group-table-cell-action-${id}`}
                                align='center'
                                isLastRow={isLastRow}
                                sx={{
                                  minWidth: 100,
                                  ...(isLastRow && { borderBottom: 'none' }),
                                }}
                              >
                                <Tooltip title='นำรายชื่อออกเฉพาะแถวที่เลือก' arrow>
                                  <Button
                                    startIcon={<Icon icon='line-md:account-remove' />}
                                    variant='contained'
                                    color='error'
                                    size='small'
                                    onClick={() => {
                                      handleDeleteStudent(id);
                                      // Reset to first page if current page becomes empty
                                      if (paginatedStudents.length === 1 && currentPage > 0) {
                                        setCurrentPage(currentPage - 1);
                                      }
                                    }}
                                  >
                                    นำรายชื่อออก
                                  </Button>
                                </Tooltip>
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
                  id='record-goodness-group-table-pagination'
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
            </Card>
          </Grid>
        </Grid>

        <DialogStudentGroup
          handleCloseSelectStudents={handleCloseSelectStudents}
          onAddStudents={handleAddStudents}
          onSearchStudents={onSearchStudents}
          onSelectStudents={onSelectStudents}
          openSelectStudents={openSelectStudents}
          studentLoading={studentLoading}
          studentsList={studentsArray}
        />
        <DialogClassroomGoodnessGroup
          classroomLoading={classroomLoading}
          classrooms={classroomsArray}
          defaultClassroom={defaultClassroom}
          handleCloseSelectStudents={handleCloseSelectStudents}
          onAddClassroom={onAddClassroom}
          onCloseClassroom={handleCloseClassroom}
          onHandleClassroomChange={onHandleClassroomChange}
          onSelectionModelChange={onSelectionModelChange}
          openSelectClassroom={openSelectClassroom}
          selectClassrooms={selectClassrooms}
          studentLoading={studentLoading}
          studentsList={studentsArray}
        />
        <DialogAddGroup
          onOpen={openGoodnessDetail}
          data={students}
          handleClose={handleCloseGoodnessDetail}
          auth={auth}
          handleSusses={handleSusses}
        />
      </React.Fragment>
    )
  );
};

export default RecordGoodnessGroupPage;
