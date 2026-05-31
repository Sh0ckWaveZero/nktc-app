'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as XLSX from 'xlsx';
import { useClassrooms, useDepartments, useTeachers } from '@/hooks/queries';
import { useAdminVisitSummaryReport, type AdminVisitSummaryRow } from '@/hooks/queries/useVisits';

import { getAdvisorScopeStudentTotal } from './advisor-scope.utils';

const ALL_DEPARTMENTS_VALUE = 'all';

const getRecordedAt = (row: AdminVisitSummaryRow) => row.latestRecordedAt || row.visitDate;

const formatVisitDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const numberFormatter = new Intl.NumberFormat('th-TH');

const formatStudentProgress = (recordedStudentCount: number, totalStudentCount: number) => {
  return `${numberFormatter.format(recordedStudentCount)}/${numberFormatter.format(totalStudentCount)} คน`;
};

const sanitizeFileSegment = (value: string) => {
  return (
    value
      .trim()
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, '_') || 'all_departments'
  );
};

const MobileVisitSummaryCard = ({ row }: { row: AdminVisitSummaryRow }) => {
  const theme = useTheme();

  return (
    <Card
      id={`admin-visit-report-mobile-card-${row.id}`}
      variant='outlined'
      sx={{
        borderRadius: 3,
        borderColor: alpha(theme.palette.primary.main, 0.14),
      }}
    >
      <CardContent id={`admin-visit-report-mobile-card-content-${row.id}`} sx={{ p: 4 }}>
        <Stack id={`admin-visit-report-mobile-card-stack-${row.id}`} spacing={2}>
          <Box
            id={`admin-visit-report-mobile-card-header-${row.id}`}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Box id={`admin-visit-report-mobile-card-teacher-section-${row.id}`}>
              <Typography id={`admin-visit-report-mobile-card-teacher-${row.id}`} variant='h6' sx={{ fontWeight: 700 }}>
                {row.teacherName}
              </Typography>
              <Typography
                id={`admin-visit-report-mobile-card-department-${row.id}`}
                variant='body2'
                color='text.secondary'
              >
                {row.departmentName}
              </Typography>
            </Box>
            <Box
              id={`admin-visit-report-mobile-card-count-badge-${row.id}`}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Typography
                id={`admin-visit-report-mobile-card-count-${row.id}`}
                variant='body2'
                sx={{ fontWeight: 700 }}
              >
                {formatStudentProgress(row.recordedStudentCount, row.studentCount)}
              </Typography>
            </Box>
          </Box>
          <Box id={`admin-visit-report-mobile-card-date-section-${row.id}`}>
            <Typography
              id={`admin-visit-report-mobile-card-date-label-${row.id}`}
              variant='caption'
              color='text.secondary'
            >
              วันที่บันทึกล่าสุด
            </Typography>
            <Typography id={`admin-visit-report-mobile-card-date-${row.id}`} variant='body1' sx={{ fontWeight: 600 }}>
              {formatVisitDate(getRecordedAt(row))}
            </Typography>
          </Box>
          <Box id={`admin-visit-report-mobile-card-classroom-section-${row.id}`}>
            <Typography
              id={`admin-visit-report-mobile-card-classroom-label-${row.id}`}
              variant='caption'
              color='text.secondary'
            >
              ห้องเรียน
            </Typography>
            <Typography
              id={`admin-visit-report-mobile-card-classroom-${row.id}`}
              variant='body1'
              sx={{ fontWeight: 600 }}
            >
              {row.classroomName}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AdminVisitReportPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [departmentFilter, setDepartmentFilter] = useState<string>(ALL_DEPARTMENTS_VALUE);

  const { data: departments = [], isLoading: isDepartmentsLoading } = useDepartments();
  const { data: teachers = [] } = useTeachers({ take: 1000 });

  const reportQueryParams = useMemo(
    () => (departmentFilter === ALL_DEPARTMENTS_VALUE ? undefined : { departmentId: departmentFilter }),
    [departmentFilter],
  );

  const { data: classrooms = [] } = useClassrooms(reportQueryParams);

  const { data = [], isLoading, isFetching, isError, error } = useAdminVisitSummaryReport(reportQueryParams);

  const selectedDepartmentName = useMemo(() => {
    if (departmentFilter === ALL_DEPARTMENTS_VALUE) {
      return 'ทุกแผนก';
    }

    return departments.find((department) => department.id === departmentFilter)?.name || 'ไม่ระบุแผนก';
  }, [departmentFilter, departments]);

  const metrics = useMemo(() => {
    const totalStudents = getAdvisorScopeStudentTotal(teachers, classrooms);
    const uniqueTeachers = new Set(data.map((row) => row.teacherName).filter(Boolean)).size;

    return [
      {
        id: 'admin-visit-report-total-groups',
        label: 'รายการรายงาน',
        value: numberFormatter.format(data.length),
        helper: 'สรุปตามครูที่ปรึกษาและแผนกใน scope ปัจจุบัน',
      },
      {
        id: 'admin-visit-report-total-students',
        label: 'จำนวนนักเรียนรวม',
        value: numberFormatter.format(totalStudents),
        helper: 'อ้างอิงจากครูประจำชั้นในหน้า teacher list',
      },
      {
        id: 'admin-visit-report-total-teachers',
        label: 'ครูที่มีการบันทึก',
        value: numberFormatter.format(uniqueTeachers),
        helper: 'จำนวนครูที่มีข้อมูลในรายงาน',
      },
    ];
  }, [classrooms, data, teachers]);

  const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถโหลดรายงานการเยี่ยมบ้านได้';

  const handleExportExcel = () => {
    if (data.length === 0) {
      return;
    }

    const workbook = XLSX.utils.book_new();
    const exportedAt = new Date();
    const sheetData = [
      ['รายงานการเยี่ยมบ้าน'],
      [`แผนกวิชา: ${selectedDepartmentName}`],
      [
        `วันที่ส่งออก: ${exportedAt.toLocaleDateString('th-TH', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}`,
      ],
      [],
      ['ชื่อครู', 'วันที่บันทึกล่าสุด', 'แผนกวิชา', 'ห้องเรียน', 'จำนวนนักเรียนที่บันทึกแล้ว/ทั้งหมด'],
      ...data.map((row) => [
        row.teacherName,
        formatVisitDate(getRecordedAt(row)),
        row.departmentName,
        row.classroomName,
        formatStudentProgress(row.recordedStudentCount, row.studentCount),
      ]),
    ];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), 'รายงานการเยี่ยมบ้าน');
    XLSX.writeFile(
      workbook,
      `visit_report_${sanitizeFileSegment(selectedDepartmentName)}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <Box id='admin-visit-report-page' sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        id='admin-visit-report-header'
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack id='admin-visit-report-header-stack' spacing={1.5}>
          <Typography id='admin-visit-report-title' variant='h4' sx={{ fontWeight: 800 }}>
            รายงานการเยี่ยมบ้าน
          </Typography>
          <Typography id='admin-visit-report-description' variant='body1' color='text.secondary'>
            สรุปข้อมูลการบันทึกเยี่ยมบ้านของครูที่ปรึกษา โดยแสดงชื่อครู วันที่บันทึกล่าสุด แผนกวิชา
            ห้องเรียนใน scope ปัจจุบัน และจำนวนนักเรียนที่บันทึกแล้วเทียบกับทั้งหมด
          </Typography>
        </Stack>
      </Box>

      <Card id='admin-visit-report-filters-card' variant='outlined' sx={{ borderRadius: 4 }}>
        <CardContent id='admin-visit-report-filters-card-content' sx={{ p: 4 }}>
          <Grid id='admin-visit-report-filters-grid' container spacing={3} sx={{ alignItems: 'flex-end' }}>
            <Grid id='admin-visit-report-department-filter-grid' size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                id='admin-visit-report-department-filter'
                select
                fullWidth
                size='small'
                label='แผนกวิชา'
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                disabled={isDepartmentsLoading}
              >
                <MenuItem id='admin-visit-report-department-option-all' value={ALL_DEPARTMENTS_VALUE}>
                  ทุกแผนก
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem
                    id={`admin-visit-report-department-option-${department.id}`}
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid id='admin-visit-report-export-button-grid' size={{ xs: 12, md: 'auto' }}>
              <Button
                id='admin-visit-report-export-button'
                variant='contained'
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleExportExcel}
                disabled={isLoading || isFetching || data.length === 0}
              >
                Export Excel
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid id='admin-visit-report-metrics-grid' container spacing={3}>
        {metrics.map((metric) => (
          <Grid id={`${metric.id}-grid-item`} key={metric.id} size={{ xs: 12, md: 4 }}>
            <Card
              id={metric.id}
              variant='outlined'
              sx={{
                height: '100%',
                borderRadius: 3,
                borderColor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <CardContent id={`${metric.id}-content`} sx={{ p: 4 }}>
                <Stack id={`${metric.id}-stack`} spacing={1}>
                  <Typography id={`${metric.id}-label`} variant='body2' color='text.secondary'>
                    {metric.label}
                  </Typography>
                  <Typography id={`${metric.id}-value`} variant='h4' sx={{ fontWeight: 800 }}>
                    {metric.value}
                  </Typography>
                  <Typography id={`${metric.id}-helper`} variant='caption' color='text.secondary'>
                    {metric.helper}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card id='admin-visit-report-table-card' variant='outlined' sx={{ borderRadius: 4 }}>
        <CardContent id='admin-visit-report-table-card-content' sx={{ p: { xs: 0, md: 0 } }}>
          {isLoading ? (
            <Box
              id='admin-visit-report-loading-state'
              sx={{
                py: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <CircularProgress id='admin-visit-report-loading-indicator' size={28} />
              <Typography id='admin-visit-report-loading-text' variant='body2' color='text.secondary'>
                กำลังโหลดข้อมูลรายงานการเยี่ยมบ้าน...
              </Typography>
            </Box>
          ) : isError ? (
            <Alert id='admin-visit-report-error-alert' severity='error' sx={{ m: 4 }}>
              {errorMessage}
            </Alert>
          ) : data.length === 0 ? (
            <Alert id='admin-visit-report-empty-alert' severity='info' sx={{ m: 4 }}>
              ยังไม่มีข้อมูลรายงานการเยี่ยมบ้าน
            </Alert>
          ) : isMobile ? (
            <Stack id='admin-visit-report-mobile-list' spacing={2} sx={{ p: 3 }}>
              {data.map((row) => (
                <MobileVisitSummaryCard key={row.id} row={row} />
              ))}
            </Stack>
          ) : (
            <TableContainer id='admin-visit-report-table-container'>
              <Table id='admin-visit-report-table'>
                <TableHead id='admin-visit-report-table-head'>
                  <TableRow id='admin-visit-report-table-head-row'>
                    <TableCell id='admin-visit-report-table-head-teacher' sx={{ fontWeight: 700 }}>
                      ชื่อครู
                    </TableCell>
                    <TableCell id='admin-visit-report-table-head-date' sx={{ fontWeight: 700 }}>
                      วันที่บันทึกล่าสุด
                    </TableCell>
                    <TableCell id='admin-visit-report-table-head-department' sx={{ fontWeight: 700 }}>
                      แผนกวิชา
                    </TableCell>
                    <TableCell id='admin-visit-report-table-head-classroom' sx={{ fontWeight: 700 }}>
                      ห้องเรียน
                    </TableCell>
                    <TableCell id='admin-visit-report-table-head-count' align='right' sx={{ fontWeight: 700 }}>
                      จำนวนนักเรียนที่บันทึกแล้ว/ทั้งหมด
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody id='admin-visit-report-table-body'>
                  {data.map((row) => (
                    <TableRow id={`admin-visit-report-table-row-${row.id}`} key={row.id} hover>
                      <TableCell id={`admin-visit-report-table-row-teacher-${row.id}`} sx={{ fontWeight: 600 }}>
                        {row.teacherName}
                      </TableCell>
                      <TableCell id={`admin-visit-report-table-row-date-${row.id}`}>
                        {formatVisitDate(getRecordedAt(row))}
                      </TableCell>
                      <TableCell id={`admin-visit-report-table-row-department-${row.id}`}>
                        {row.departmentName}
                      </TableCell>
                      <TableCell id={`admin-visit-report-table-row-classroom-${row.id}`}>{row.classroomName}</TableCell>
                      <TableCell id={`admin-visit-report-table-row-count-${row.id}`} align='right'>
                        {formatStudentProgress(row.recordedStudentCount, row.studentCount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminVisitReportPage;
