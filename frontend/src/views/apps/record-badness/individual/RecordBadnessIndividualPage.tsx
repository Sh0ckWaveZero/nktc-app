'use client';

import { Avatar, Box, Button, Card, CardHeader, Typography, Paper, CircularProgress } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';

import { AccountEditOutline } from 'mdi-material-ui';
import DialogAddCard from '@/views/apps/record-badness/DialogAddCard';
import Grid from '@mui/material/Grid';
import { HiOutlineThumbDown } from 'react-icons/hi';
import Link from 'next/link';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/record-goodness/TableHeader';
import { TableEmptyState } from '@/@core/components/check-in/CustomNoRowsOverlay';
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
import { isEmpty } from '@/@core/utils/utils';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { useStudentsSearch } from '@/hooks/queries/useStudents';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { toast } from 'react-toastify';

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const RecordBadnessIndividualPage = () => {
  // ** Hooks
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ** State
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [searchParams, setSearchParams] = useState<{ fullName?: string; studentId?: string } | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // ** React Query - Manual search trigger
  const {
    data: allStudents = [],
    isLoading: loadingStudent,
    error: studentsError,
  } = useStudentsSearch(searchParams || undefined, {
    enabled: !!searchParams && !!(searchParams.fullName || searchParams.studentId),
  });

  // ** Filter students by teacher's classrooms (if not admin)
  const students = useMemo(() => {
    if (allStudents.length === 0) {
      return [];
    }

    const role = user?.role?.toLowerCase();
    const teacherOnClassroom = user?.teacherOnClassroom;

    if (role === 'admin') {
      return allStudents;
    }

    if (teacherOnClassroom && Array.isArray(teacherOnClassroom) && teacherOnClassroom.length > 0) {
      return allStudents.filter((student: any) => {
        const studentClassroomId = student?.classroomId ?? student?.student?.classroomId;
        return studentClassroomId && teacherOnClassroom.includes(studentClassroomId);
      });
    }

    return [];
  }, [allStudents, user]);

  // ** Handle search errors
  useEffect(() => {
    if (studentsError) {
      toast.error('เกิดข้อผิดพลาดในการค้นหานักเรียน');
    }
  }, [studentsError]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOnSearch = () => {
    if (!fullName && !studentId) {
      toast.error('กรุณากรอกชื่อหรือรหัสนักเรียน');
      return;
    }

    if (user?.role?.toLowerCase() !== 'admin' && (!user?.teacherOnClassroom || user.teacherOnClassroom.length === 0)) {
      toast.error('คุณยังไม่มีห้องเรียนที่รับผิดชอบ กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    const params = { fullName: fullName || undefined, studentId: studentId || undefined };
    setSearchParams(params);
    setCurrentPage(0);
    if (searchParams) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.search(searchParams),
      });
    }
  };

  const onClearSearch = () => {
    setFullName('');
    setStudentId('');
    setSearchParams(null);
    selectedStudent && setSelectedStudent(null);
    setCurrentPage(0);
  };

  // ** Pagination logic
  const validPageSizeOptions = [10, 25, 50];
  const validPageSize = validPageSizeOptions.includes(pageSize)
    ? pageSize
    : validPageSizeOptions.find((size) => size >= pageSize) || validPageSizeOptions[validPageSizeOptions.length - 1];

  const startIndex = currentPage * validPageSize;
  const endIndex = startIndex + validPageSize;
  const paginatedStudents = students.slice(startIndex, endIndex);
  const isStudentsEmpty = students.length === 0;

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <HiOutlineThumbDown />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`บันทึกพฤติกรรมที่ไม่เหมาะสม ${students?.length ?? 0} คน`}
            />
            {students && (
              <TableHeader
                fullName={fullName}
                id={studentId}
                onChangeFullName={(e: any) => setFullName(e.target.value)}
                onChangeId={(e: any) => setStudentId(e.target.value)}
                onSearch={handleOnSearch}
                onClear={onClearSearch}
              />
            )}
            <Box
              id='record-badness-individual-datagrid'
              sx={{
                width: '100%',
                height: '100%',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <TableContainerCustom id='record-badness-individual-table-container' component={Paper}>
                <TableCustom id='record-badness-individual-table' stickyHeader size='small'>
                  <TableHeadCustom id='record-badness-individual-table-head'>
                    <TableHeaderRowCustom id='record-badness-individual-table-header-row'>
                      <TableCellHeaderCustom
                        id='record-badness-individual-table-header-cell-fullname'
                        sx={{ minWidth: 230 }}
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
                        id='record-badness-individual-table-header-cell-classroom'
                        sx={{ minWidth: 300 }}
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
                        id='record-badness-individual-table-header-cell-latest'
                        sx={{ minWidth: 200 }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            color: 'text.primary',
                          }}
                        >
                          บันทึกพฤติกรรมที่ไม่เหมาะสมล่าสุด
                        </Typography>
                      </TableCellHeaderCustom>
                      <TableCellHeaderCustom
                        id='record-badness-individual-table-header-cell-action'
                        align='center'
                        sx={{ minWidth: 150 }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            color: 'text.primary',
                          }}
                        >
                          บันทึก
                        </Typography>
                      </TableCellHeaderCustom>
                    </TableHeaderRowCustom>
                  </TableHeadCustom>
                  <TableBodyCustom id='record-badness-individual-table-body'>
                    {loadingStudent ? (
                      <TableRowCustom id='record-badness-individual-table-loading-row'>
                        <TableCellCustom
                          id='record-badness-individual-table-loading-cell'
                          colSpan={4}
                          align='center'
                          sx={{ height: 400 }}
                        >
                          <CircularProgress />
                        </TableCellCustom>
                      </TableRowCustom>
                    ) : paginatedStudents.length === 0 ? (
                      <TableRowCustom id='record-badness-individual-table-empty-row'>
                        <TableCellCustom
                          id='record-badness-individual-table-empty-cell'
                          colSpan={4}
                          align='center'
                          sx={{ height: 400 }}
                        >
                          <TableEmptyState text='ไม่พบข้อมูลนักเรียน' />
                        </TableCellCustom>
                      </TableRowCustom>
                    ) : (
                      paginatedStudents.map((row: any, index: number) => {
                        const { id, user: studentUser, classroom, badnessIndividual } = row;
                        const account = studentUser?.account;
                        const username = studentUser?.username;
                        const isLastRow = index === paginatedStudents.length - 1;
                        const badnessIndividualLatest = isEmpty(badnessIndividual)
                          ? '-'
                          : new Date(badnessIndividual[0]?.createdAt).toLocaleString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });

                        return (
                          <TableRowCustom
                            key={id}
                            id={`record-badness-individual-table-row-${id}`}
                          >
                            <TableCellCustom
                              id={`record-badness-individual-table-cell-fullname-${id}`}
                              isLastRow={isLastRow}
                              sx={{
                                minWidth: 230,
                                ...(isLastRow && { borderBottom: 'none' }),
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <RenderAvatar row={{ ...row, account }} />
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                                  <LinkStyled href={`/apps/student/view/${id}`} passHref>
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
                                      {account?.title + '' + account?.firstName + ' ' + account?.lastName}
                                    </Typography>
                                  </LinkStyled>
                                  <LinkStyled href={`/apps/student/view/${id}`} passHref>
                                    <Typography
                                      noWrap
                                      variant='body2'
                                      sx={{
                                        textDecoration: 'none',
                                        fontSize: '0.8125rem',
                                        color: 'text.secondary',
                                      }}
                                    >
                                      @{username}
                                    </Typography>
                                  </LinkStyled>
                                </Box>
                              </Box>
                            </TableCellCustom>
                            <TableCellCustom
                              id={`record-badness-individual-table-cell-classroom-${id}`}
                              isLastRow={isLastRow}
                              sx={{
                                minWidth: 300,
                                ...(isLastRow && { borderBottom: 'none' }),
                              }}
                            >
                              <Typography noWrap variant='body2'>
                                {classroom?.name || '-'}
                              </Typography>
                            </TableCellCustom>
                            <TableCellCustom
                              id={`record-badness-individual-table-cell-latest-${id}`}
                              isLastRow={isLastRow}
                              sx={{
                                minWidth: 200,
                                ...(isLastRow && { borderBottom: 'none' }),
                              }}
                            >
                              <Typography noWrap variant='body2'>
                                {badnessIndividualLatest}
                              </Typography>
                            </TableCellCustom>
                            <TableCellCustom
                              id={`record-badness-individual-table-cell-action-${id}`}
                              align='center'
                              isLastRow={isLastRow}
                              sx={{
                                minWidth: 150,
                                ...(isLastRow && { borderBottom: 'none' }),
                              }}
                            >
                              <Button
                                color='error'
                                variant='contained'
                                size='small'
                                onClick={() => {
                                  setSelectedStudent({
                                    ...row,
                                    account: row.user?.account,
                                    username: row.user?.username,
                                    student: {
                                      id: row.id,
                                      classroomId: row.classroomId ?? row.classroom?.id,
                                      classroom: row.classroom,
                                    },
                                  });
                                  setOpenDialog(true);
                                }}
                                startIcon={<AccountEditOutline fontSize='small' />}
                              >
                                บันทึก
                              </Button>
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
                id='record-badness-individual-table-pagination'
                component='div'
                count={students.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={validPageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={isStudentsEmpty ? [] : validPageSizeOptions}
                labelRowsPerPage={isStudentsEmpty ? '' : 'แสดง:'}
                labelDisplayedRows={({ from, to, count }) => {
                  return `${from}-${to} จากทั้งหมด ${count}`;
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
      {openDialog && (
        <DialogAddCard
          show={openDialog}
          data={selectedStudent}
          handleClose={handleCloseDialog}
          user={user}
          handleOnSearch={handleOnSearch}
        />
      )}
    </React.Fragment>
  );
};

export default RecordBadnessIndividualPage;
