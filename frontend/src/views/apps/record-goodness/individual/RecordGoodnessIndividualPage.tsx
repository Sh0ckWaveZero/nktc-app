'use client';

import { Avatar, Box, Button, Card, CardHeader, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { Fragment, useState, useEffect, useMemo } from 'react';

import { AccountEditOutline } from 'mdi-material-ui';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import DialogAddCard from '@/views/apps/record-goodness/DialogAddCard';
import Grid from '@mui/material/Grid';
import { HiOutlineStar } from 'react-icons/hi';
import Link from 'next/link';
import RenderAvatar from '@/@core/components/avatar';
import TableHeader from '@/views/apps/record-goodness/TableHeader';
import { isEmpty } from '@/@core/utils/utils';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';
import { useStudentsSearch } from '@/hooks/queries/useStudents';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { toast } from 'react-toastify';

interface CellType {
  row: any;
}

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const RecordGoodnessIndividualPage = () => {
  // ** Hooks
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ** State
  const [pageSize, setPageSize] = useState<number>(10);
  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [searchParams, setSearchParams] = useState<{ fullName?: string; studentId?: string } | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // ** React Query - Manual search trigger
  // Only enable query when searchParams is set (after clicking search button)
  // Hook handles response wrapper extraction and always returns an array
  const {
    data: allStudents = [],
    isLoading: loadingStudent,
    error: studentsError,
  } = useStudentsSearch(searchParams || undefined, {
    enabled: !!searchParams && !!(searchParams.fullName || searchParams.studentId),
  });

  // ** Filter students by teacher's classrooms (if not admin)
  const students = useMemo(() => {
    // Return empty array if no students
    if (allStudents.length === 0) {
      return [];
    }
    
    // Admin can see all students
    if (user?.role?.toLowerCase() === 'admin') {
      return allStudents;
    }

    // Teacher can only see students from their classrooms
    if (user?.teacherOnClassroom && Array.isArray(user.teacherOnClassroom) && user.teacherOnClassroom.length > 0) {
      return allStudents.filter((student: any) => {
        const studentClassroomId = student?.student?.classroomId;
        return studentClassroomId && user.teacherOnClassroom.includes(studentClassroomId);
      });
    }

    // If teacher has no classrooms, return empty array
    return [];
  }, [allStudents, user?.role, user?.teacherOnClassroom]);

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

    // Check if teacher has classrooms assigned
    if (user?.role?.toLowerCase() !== 'admin' && (!user?.teacherOnClassroom || user.teacherOnClassroom.length === 0)) {
      toast.error('คุณยังไม่มีห้องเรียนที่รับผิดชอบ กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    const params = { fullName: fullName || undefined, studentId: studentId || undefined };
    setSearchParams(params);
    // If searchParams already exists, invalidate to refetch (for DialogAddCard callback)
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
  };

  const defaultColumns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 230,
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { id, account, username } = row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={row} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <LinkStyled href={`/apps/student/view/${id}`} passHref>
                <Typography
                  noWrap
                  variant='body2'
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
                >
                  {account?.title + '' + account?.firstName + ' ' + account?.lastName}
                </Typography>
              </LinkStyled>
              <LinkStyled href={`/apps/student/view/${id}`} passHref>
                <Typography noWrap variant='caption' sx={{ textDecoration: 'none' }}>
                  @{username}
                </Typography>
              </LinkStyled>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.3,
      field: 'classroom',
      minWidth: 300,
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { student } = row;
        return (
          <Typography noWrap variant='body2'>
            {student?.classroom?.name}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 120,
      sortable: false,
      field: 'recordGoodnessIndividualLatest',
      headerName: 'บันทึกความดีล่าสุด',
      align: 'left',
      renderCell: ({ row }: CellType) => {
        const { student } = row;
        const goodnessIndividualLatest = isEmpty(student?.goodnessIndividual)
          ? '-'
          : new Date(student?.goodnessIndividual[0]?.createdAt).toLocaleString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
        return (
          <Typography noWrap variant='body2'>
            {goodnessIndividualLatest}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'recordGoodnessIndividual',
      headerName: 'บันทึกความดี',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        return (
          <Button
            color='success'
            variant='contained'
            onClick={() => {
              setSelectedStudent(row);
              setOpenDialog(true);
            }}
            startIcon={<AccountEditOutline fontSize='small' />}
          >
            เพิ่ม
          </Button>
        );
      },
    },
  ];

  return (
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
              title={`บันทึกความดี ${students?.length ?? 0} คน`}
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
            <DataGrid
              rows={students}
              columns={defaultColumns}
              loading={loadingStudent}
              disableRowSelectionOnClick
              disableColumnMenu
              getRowHeight={() => 'auto'}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: pageSize, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              onPaginationModelChange={(model) => setPageSize(model.pageSize)}
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

export default RecordGoodnessIndividualPage;
