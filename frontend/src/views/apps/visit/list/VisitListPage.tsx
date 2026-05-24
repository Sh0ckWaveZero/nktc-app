'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import HomeOutline from 'mdi-material-ui/HomeOutline';
import PencilOutline from 'mdi-material-ui/PencilOutline';
import EyeOutline from 'mdi-material-ui/EyeOutline';
import AppListDataGrid from '@/@core/components/data-grid/AppListDataGrid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { AppListCard, AppListCardHeader, type ListSummaryItem } from '@/@core/components/list-page';
import TableHeader from '@/views/apps/visit/list/TableHeader';
import VisitDetailDialog from '@/views/apps/visit/list/VisitDetailDialog';
import VisitFormDialog from '@/views/apps/visit/list/VisitFormDialog';
import { useAuth } from '@/hooks/useAuth';
import { type TeacherVisitStudentRow, useTeacherVisitStudents } from '@/hooks/queries/useVisits';
import { sortStudentsByStudentId } from '@/utils/student-sort';

// ── Utilities ─────────────────────────────────────────────────────────────────

const getAdvisorClassroomId = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  const classroom = value as { id?: unknown; classroomId?: unknown };
  const classroomId = classroom.id ?? classroom.classroomId;
  return typeof classroomId === 'string' ? classroomId : null;
};

const getNameInitials = (fullName: string) => {
  const segments = fullName.trim().split(/\s+/).filter(Boolean);
  if (segments.length === 0) return '?';
  return segments
    .slice(0, 2)
    .map((segment) => segment.charAt(0))
    .join('')
    .toUpperCase();
};

const formatVisitDate = (value: string | Date | null) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Cell components ───────────────────────────────────────────────────────────

const VisitStatusChip = memo(({ row }: { row: TeacherVisitStudentRow }) => {
  const isRecorded = row.visitStatus === 'recorded';
  return (
    <Chip
      id={`visit-status-chip-${row.id}`}
      size='small'
      color={isRecorded ? 'success' : 'warning'}
      label={isRecorded ? 'บันทึกแล้ว' : 'ยังไม่บันทึก'}
      variant={isRecorded ? 'filled' : 'outlined'}
      sx={{ fontWeight: 700 }}
    />
  );
});

VisitStatusChip.displayName = 'VisitStatusChip';

const VisitImagePreviewCell = memo(({ row }: { row: TeacherVisitStudentRow }) => {
  if (!row.images.filter(Boolean).length) {
    return (
      <Chip
        id={`visit-images-empty-chip-${row.id}`}
        size='small'
        label='ยังไม่มีรูป'
        variant='outlined'
        color='default'
      />
    );
  }
  return (
    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
      {row.images.filter(Boolean).slice(0, 3).map((image, index) => (
        <Box
          key={`${row.id}-image-${index}`}
          component='img'
          src={image}
          alt={`visit-${row.studentId}-${index + 1}`}
          sx={{
            width: 48,
            height: 36,
            borderRadius: 1.5,
            objectFit: 'cover',
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.common.black, 0.12)}`,
          }}
        />
      ))}
    </Stack>
  );
});

VisitImagePreviewCell.displayName = 'VisitImagePreviewCell';

// ── Page ──────────────────────────────────────────────────────────────────────

const VisitListPage = () => {
  const theme = useTheme();
  const isTabletDown = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, loading, isInitialized } = useAuth();

  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [visitStatusFilter, setVisitStatusFilter] = useState<'all' | 'recorded' | 'pending'>('all');
  const [detailRow, setDetailRow] = useState<TeacherVisitStudentRow | null>(null);
  const [selectedRow, setSelectedRow] = useState<TeacherVisitStudentRow | null>(null);

  const handleClassroomChange = useCallback((value: { id: string; name: string } | null) => {
    setSelectedClassroomId(value?.id ?? null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleVisitStatusChange = useCallback((value: 'all' | 'recorded' | 'pending') => {
    setVisitStatusFilter(value);
  }, []);

  const handleOpenDetail = useCallback((row: TeacherVisitStudentRow) => {
    setDetailRow(row);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailRow(null);
  }, []);

  const handleDetailRecord = useCallback(() => {
    setSelectedRow(detailRow);
    setDetailRow(null);
  }, [detailRow]);

  const handleOpenRecord = useCallback((row: TeacherVisitStudentRow) => {
    setSelectedRow(row);
  }, []);

  const handleCloseRecord = useCallback(() => {
    setSelectedRow(null);
  }, []);

  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const advisorClassroomIds = useMemo(() => {
    const teacherOnClassroom = Array.isArray(user?.teacherOnClassroom) ? user.teacherOnClassroom : [];
    return teacherOnClassroom
      .map(getAdvisorClassroomId)
      .filter((classroomId): classroomId is string => Boolean(classroomId));
  }, [user?.teacherOnClassroom]);
  const hasAdvisorClassrooms = advisorClassroomIds.length > 0;

  const {
    data: advisorStudents = [],
    isLoading,
    isFetching,
  } = useTeacherVisitStudents(undefined, {
    enabled: Boolean(isInitialized && !loading && isTeacher),
    advisorClassroomIds,
  });

  const classroomOptions = useMemo(() => {
    const classroomMap = new Map<string, { id: string; name: string }>();
    advisorStudents.forEach((student) => {
      if (student.classroomId && !classroomMap.has(student.classroomId)) {
        classroomMap.set(student.classroomId, { id: student.classroomId, name: student.classroomName });
      }
    });
    return Array.from(classroomMap.values()).sort((l, r) => l.name.localeCompare(r.name, 'th'));
  }, [advisorStudents]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return sortStudentsByStudentId(advisorStudents).filter((row) => {
      const matchesClassroom = selectedClassroomId ? row.classroomId === selectedClassroomId : true;
      const matchesSearch =
        !normalizedSearch ||
        [row.studentId, row.fullName, row.classroomName].some((value) =>
          value?.toLowerCase().includes(normalizedSearch),
        );
      const matchesStatus =
        visitStatusFilter === 'all' ||
        (visitStatusFilter === 'recorded' && row.visitStatus === 'recorded') ||
        (visitStatusFilter === 'pending' && row.visitStatus !== 'recorded');
      return matchesClassroom && matchesSearch && matchesStatus;
    });
  }, [advisorStudents, searchValue, selectedClassroomId, visitStatusFilter]);

  const summaryItems = useMemo<ListSummaryItem[]>(() => {
    const recordedCount = filteredRows.filter((row) => row.visitStatus === 'recorded').length;
    const pendingCount = filteredRows.length - recordedCount;
    const classroomCount = new Set(filteredRows.map((row) => row.classroomId).filter(Boolean)).size;
    return [
      { label: 'ห้องที่ดูแล', value: classroomCount, color: 'info' },
      { label: 'บันทึกแล้ว', value: recordedCount, color: 'success' },
      { label: 'รอบันทึก', value: pendingCount, color: 'warning' },
    ];
  }, [filteredRows]);

  const getActionIconSx = useCallback(
    (color: 'info' | 'warning' | 'primary') => ({
      width: 32,
      height: 32,
      borderRadius: 1.5,
      border: (theme: Theme) => `1px solid ${alpha(theme.palette[color].main, 0.24)}`,
      backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.12),
      color: `${color}.dark`,
      transition: 'all 160ms ease',
      '&:hover': {
        backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.2),
      },
    }),
    [],
  );

  const columns = useMemo<GridColDef<TeacherVisitStudentRow>[]>(
    () => [
      {
        flex: 0.12,
        minWidth: 130,
        field: 'studentId',
        headerName: 'รหัสนักเรียน',
        sortable: false,
      },
      {
        flex: 0.24,
        minWidth: 250,
        field: 'fullName',
        headerName: 'ชื่อ-นามสกุล',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Stack direction='row' spacing={1.75} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Avatar
              id={`visit-student-avatar-${row.id}`}
              sx={{
                width: 40,
                height: 40,
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.14),
                color: 'primary.main',
                fontWeight: 800,
              }}
            >
              {getNameInitials(row.fullName)}
            </Avatar>
            <Typography noWrap variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {row.fullName}
            </Typography>
          </Stack>
        ),
      },
      {
        flex: 0.16,
        minWidth: 170,
        field: 'classroomName',
        headerName: 'ห้องเรียน',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.25,
              py: 0.35,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
              maxWidth: '100%',
            }}
          >
            <Typography noWrap variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {row.classroomName}
            </Typography>
          </Box>
        ),
      },
      {
        flex: 0.14,
        minWidth: 150,
        field: 'visitStatus',
        headerName: 'สถานะบันทึก',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => <VisitStatusChip row={row} />,
      },
      {
        flex: 0.14,
        minWidth: 160,
        field: 'visitDate',
        headerName: 'วันที่เยี่ยมบ้าน',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Typography
            variant='body2'
            sx={{ color: row.visitDate ? 'text.primary' : 'text.secondary', fontWeight: row.visitDate ? 600 : 500 }}
          >
            {formatVisitDate(row.visitDate)}
          </Typography>
        ),
      },
      {
        flex: 0.14,
        minWidth: 170,
        field: 'images',
        headerName: 'รูปภาพ',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => <VisitImagePreviewCell row={row} />,
      },
      {
        flex: 0.14,
        minWidth: 160,
        field: 'actions',
        headerName: 'การดำเนินการ',
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Stack
            id={`visit-actions-${row.id}`}
            direction='row'
            sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75, width: '100%' }}
          >
            <Tooltip title='ดูข้อมูล'>
              <IconButton
                id={`visit-view-button-${row.id}`}
                sx={getActionIconSx('info')}
                onClick={() => handleOpenDetail(row)}
              >
                <EyeOutline fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.visitId ? 'แก้ไขบันทึก' : 'บันทึกเยี่ยมบ้าน'}>
              <IconButton
                id={`visit-action-button-${row.id}`}
                sx={getActionIconSx(row.visitId ? 'warning' : 'primary')}
                onClick={() => handleOpenRecord(row)}
              >
                {row.visitId ? <PencilOutline fontSize='small' /> : <HomeOutline fontSize='small' />}
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [getActionIconSx, handleOpenDetail, handleOpenRecord],
  );

  return (
    <Grid container spacing={{ xs: 3, md: 5 }} id='visit-list-page-container'>
      <Grid size={12}>
        <AppListCard id='visit-list-card'>
          <AppListCardHeader
            id='visit-list-header'
            icon={<HomeOutline />}
            title='เยี่ยมบ้านนักเรียน'
            count={filteredRows.length}
            countUnit='คน'
            description='แสดงเฉพาะนักเรียนในห้องที่คุณได้รับมอบหมายเป็นครูที่ปรึกษาจากหน้าตั้งค่าบัญชี และบันทึกผลการเยี่ยมบ้านได้จากตารางเดียว'
            summaryItems={summaryItems}
          />

          {!isTeacher ? (
            <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
              <Alert severity='info' id='visit-list-role-alert'>
                หน้านี้สำหรับครูที่ปรึกษาเท่านั้น
              </Alert>
            </Box>
          ) : !hasAdvisorClassrooms ? (
            <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
              <Alert severity='warning' id='visit-list-classroom-alert'>
                ยังไม่พบห้องที่คุณเป็นครูที่ปรึกษาในหน้าตั้งค่าบัญชี กรุณาตรวจสอบหัวข้อครูที่ปรึกษาระดับชั้นก่อนใช้งานหน้านี้
              </Alert>
            </Box>
          ) : (
            <>
              <TableHeader
                classroomOptions={classroomOptions}
                selectedClassroomId={selectedClassroomId}
                searchValue={searchValue}
                visitStatusFilter={visitStatusFilter}
                onClassroomChange={handleClassroomChange}
                onSearchChange={handleSearchChange}
                onVisitStatusChange={handleVisitStatusChange}
              />

              <Box id='visit-list-datagrid-container' sx={{ px: { xs: 1.5, sm: 2.5, lg: 3 }, pb: { xs: 2.5, sm: 3.5 } }}>
                <AppListDataGrid
                  autoHeight
                  rows={filteredRows}
                  columns={columns as GridColDef[]}
                  loading={isLoading || isFetching}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  getRowHeight={() => 'auto'}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: isTabletDown ? 10 : 25, page: 0 },
                    },
                  }}
                  slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                  }}
                  localeText={{
                    noRowsLabel: 'ไม่พบข้อมูลนักเรียนที่อยู่ในความดูแล',
                  }}
                  sx={{
                    '& .MuiDataGrid-main': { minHeight: 420 },
                    '& .MuiDataGrid-cell': { px: isTabletDown ? 1.5 : 2.5, py: 1.75 },
                    '& .MuiDataGrid-columnHeader': { px: isTabletDown ? 1.5 : 2.5 },
                  }}
                />
              </Box>
            </>
          )}
        </AppListCard>
      </Grid>

      <VisitDetailDialog
        open={Boolean(detailRow)}
        row={detailRow}
        onClose={handleCloseDetail}
        onRecord={handleDetailRecord}
      />

      <VisitFormDialog
        open={Boolean(selectedRow)}
        row={selectedRow}
        onClose={handleCloseRecord}
      />
    </Grid>
  );
};

export default VisitListPage;
