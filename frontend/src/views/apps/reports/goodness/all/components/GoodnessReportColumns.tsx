import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Typography, Button, Tooltip } from '@mui/material';
import IconifyIcon from '@/@core/components/icon';
import { getStudentName } from '@/utils/student';

interface CellType {
  row: any;
}

interface UseGoodnessReportColumnsProps {
  isMobile: boolean;
  onDetailClick: (info: any) => void;
}

export const useGoodnessReportColumns = ({ isMobile, onDetailClick }: UseGoodnessReportColumnsProps): GridColDef[] => {
  return useMemo(
    () => [
      {
        flex: 0.15,
        minWidth: isMobile ? 120 : 180,
        field: 'studentId',
        headerName: 'รหัสนักเรียน',
        editable: false,
        sortable: false,
        hideSortIcons: true,
        renderCell: ({ row }: CellType) => {
          console.log('studentId column - row:', row);
          console.log('studentId column - row.studentId:', row?.studentId);
          console.log('studentId column - row.student:', row?.student);

          // Get studentId - prioritize student.studentId (actual student ID number)
          const displayStudentId = row?.student?.studentId || row?.studentId || row?.id || '-';
          console.log('studentId column - displayStudentId:', displayStudentId);

          return (
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {displayStudentId}
            </Typography>
          );
        },
      },
      {
        flex: 0.25,
        minWidth: isMobile ? 150 : 220,
        field: 'fullName',
        headerName: 'ชื่อ-นามสกุล',
        editable: false,
        sortable: false,
        hideSortIcons: true,
        renderCell: ({ row }: CellType) => {
          // Pass row.student to getStudentName since data structure is { student: { user: { account } } }
          const fullName = getStudentName(row.student || row);
          return (
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {fullName}
            </Typography>
          );
        },
      },
      {
        flex: 0.25,
        minWidth: isMobile ? 150 : 220,
        field: 'classroomName',
        headerName: 'ชั้นเรียน',
        editable: false,
        sortable: false,
        hideSortIcons: true,
        renderCell: ({ row }: CellType) => {
          // Try to get classroom name, fallback to classroomId or 'ไม่ระบุ'
          const classroomName = row?.student?.classroom?.name || row?.classroom?.name || row?.name || 'ไม่ระบุ';
          return (
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {classroomName}
            </Typography>
          );
        },
      },
      {
        flex: 0.2,
        minWidth: isMobile ? 120 : 180,
        field: 'detail',
        headerName: 'รายละเอียด',
        editable: false,
        sortable: false,
        hideSortIcons: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: CellType) => {
          const { info } = row;

          return (
            <Tooltip title='รายละเอียดความดี' arrow>
              <Button
                id={`goodness-report-detail-button-${row.id || row.studentId}`}
                aria-label='more'
                aria-controls='long-menu'
                aria-haspopup='true'
                onClick={() => {
                  // Pass the entire row object as it contains the goodness record with student data
                  onDetailClick(row);
                }}
                variant='contained'
                startIcon={!isMobile && <IconifyIcon icon={'mdi:timeline-check-outline'} width={18} height={18} />}
                size={isMobile ? 'small' : 'medium'}
                color='success'
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  px: { xs: 1.5, sm: 2.5 },
                  py: { xs: 0.75, sm: 1 },
                  minWidth: { xs: '60px', sm: 'auto' },
                }}
              >
                {isMobile ? 'ดู' : 'รายละเอียด'}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        flex: 0.15,
        minWidth: isMobile ? 80 : 100,
        field: 'score',
        headerName: 'คะแนน',
        editable: false,
        sortable: false,
        hideSortIcons: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: CellType) => {
          const { goodnessScore } = row;
          return (
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {goodnessScore}
            </Typography>
          );
        },
      },
    ],
    [isMobile, onDetailClick],
  );
};
