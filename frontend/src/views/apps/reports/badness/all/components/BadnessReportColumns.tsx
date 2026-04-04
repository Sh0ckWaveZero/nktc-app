import { GridColDef } from '@mui/x-data-grid';
import { Button, Tooltip, Typography } from '@mui/material';
import Icon from '@/@core/components/icon';

interface UseBadnessReportColumnsProps {
  isMobile: boolean;
  onDetailClick: (info: any) => void;
}

export const useBadnessReportColumns = ({ isMobile, onDetailClick }: UseBadnessReportColumnsProps): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: any) => {
        const { studentId } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
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
      renderCell: ({ row }: any) => {
        const { fullName } = row;
        return (
          <Tooltip title={fullName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {fullName}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'name',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: any) => {
        const { name } = row;
        return (
          <Tooltip title={name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {name}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'detail',
      headerName: 'รายละเอียด',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: any) => {
        const { info } = row;
        return (
          <Tooltip title={'รายละเอียด'} arrow>
            <span>
              <Button
                aria-label='more'
                aria-controls='long-menu'
                aria-haspopup='true'
                onClick={() => onDetailClick(info)}
                variant='contained'
                startIcon={<Icon icon={'mdi:timeline-check-outline'} width={20} height={20} />}
                size='medium'
                color='error'
                sx={{ color: 'text.secondary' }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                  รายละเอียด
                </Typography>
              </Button>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 80,
      field: 'badnessScore',
      headerName: 'คะแนนรวม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: any) => {
        const { badnessScore } = row;
        return (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {badnessScore}
          </Typography>
        );
      },
    },
  ];

  return columns;
};
