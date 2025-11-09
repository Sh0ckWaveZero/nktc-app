import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Typography, Button, Tooltip } from '@mui/material';
import IconifyIcon from '@/@core/components/icon';

interface CellType {
  row: any;
}

interface UseGoodnessReportColumnsProps {
  isMobile: boolean;
  onDetailClick: (info: any) => void;
}

export const useGoodnessReportColumns = ({ isMobile, onDetailClick }: UseGoodnessReportColumnsProps): GridColDef[] => {
  return useMemo(() => [
    {
      flex: 0.15,
      minWidth: isMobile ? 120 : 180,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { studentId } = row;
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
            {studentId}
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
        const { title = '', firstName = '' } = row;
        const fullName = `${title}${firstName}`.trim();
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
        const { name } = row;
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
            {name}
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
              onClick={() => onDetailClick(info)}
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
  ], [isMobile, onDetailClick]);
};

