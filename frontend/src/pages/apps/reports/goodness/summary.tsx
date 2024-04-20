import {
  Avatar,
  Card,
  CardHeader,
  Dialog,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  styled,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import IconifyIcon from '@/@core/components/icon';
import { goodnessIndividualStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import TimelineGoodness from '@/views/apps/student/view/TimelineGoodness';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CellType {
  row: any;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const StudentGoodnessSummaryReport = () => {
  // ** Hooks
  const { user }: any = useAuth();
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;
  const ability = useContext(AbilityContext);

  const { deleteGoodnessIndividualById, summary }: any = goodnessIndividualStore(
    (state: any) => ({
      summary: state.summary,
      deleteGoodnessIndividualById: state.deleteGoodnessIndividualById,
    }),
    shallow,
  );

  // ** Local State
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);
  const [total, setTotal] = useState(0);
  const [info, setInfo] = useState<any>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [goodnessId, setGoodnessId] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);

  const searchWithParams = async (params: any) => {
    try {
      setLoading(true);

      const response = await summary(storedToken, {
        ...params,
      });

      setData(response?.data);
      setTotal(response?.total);
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      skip: page === 0 ? 0 : page * pageSize,
      take: pageSize,
      sort: sortModel,
    };
    searchWithParams(params);
  }, [page, pageSize, sortModel, isDeleted]);

  const handleClickOpen = (info: any) => {
    setOpen(true);
    setInfo(info);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onHandleChangePage = useCallback((newPage: any) => {
    setPage(0);
    setPageSize(newPage);
  }, []);

  const onDeletedGoodness = (id: string): void => {
    handleClose();
    setOpenConfirm(true);
    setGoodnessId(id);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirm = () => {
    const toastId = toast.loading('กำลังบันทึกลบข้อมูลความดี...');
    deleteGoodnessIndividualById(storedToken, goodnessId).then((res: any) => {
      if (res?.status === 204) {
        setIsDeleted(true);
        toast.success('ลบข้อมูลความดีสำเร็จ', { id: toastId });
      } else {
        toast.error(res?.response?.data.error || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
    setIsDeleted(false);
    setOpenConfirm(false);
  };

  const columns: GridColDef[] = [
    {
      flex: 0.05,
      minWidth: 60,
      field: 'runningNumber',
      headerName: 'ลำดับ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'right',
      renderCell: ({ row }: CellType) => {
        const { runningNumber } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {runningNumber}
          </Typography>
        );
      },
    },
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
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
      field: 'firstName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { firstName } = row;
        return (
          <Tooltip title={firstName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {firstName}
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
      renderCell: ({ row }: CellType) => {
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
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { info } = row;
        return (
          <Tooltip title={'รายละเอียด'} arrow>
            <span>
              <Button
                aria-label='more'
                aria-controls='long-menu'
                aria-haspopup='true'
                onClick={() => handleClickOpen(info)}
                variant='contained'
                startIcon={<IconifyIcon icon={'mdi:timeline-check-outline'} width={20} height={20} />}
                size='medium'
                color='success'
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
      field: 'score',
      headerName: 'คะแนนรวม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { goodnessScore } = row;
        return (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {goodnessScore}
          </Typography>
        );
      },
    },
  ];

  const handlePaginationModelChange = (paginationModel: any) => {
    const { page, pageSize } = paginationModel;
    setPage(page);
    setPageSize(pageSize);
    onHandleChangePage(pageSize);
  };

  return (
    ability?.can('read', 'student-goodness-summary-report') && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <IconifyIcon icon={'game-icons:trophy'} />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`เรียงลำดับ คะแนนตามความดี`}
              />
              <DataGrid
                autoHeight
                columns={columns}
                rows={data ?? []}
                disableColumnMenu
                loading={loading}
                pagination
                paginationMode='server'
                rowCount={total}
                pageSizeOptions={[10, 20, 50, 100]}
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(paginationModel) => handlePaginationModelChange(paginationModel)}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <BootstrapDialog fullWidth maxWidth='xs' onClose={handleClose} aria-labelledby='บรรทึกความดี' open={open}>
          {handleClose ? (
            <IconButton
              aria-label='close'
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
          <TimelineGoodness info={info} user={user} onDeleted={onDeletedGoodness} />
        </BootstrapDialog>
        <BootstrapDialog
          fullWidth
          maxWidth='xs'
          onClose={handleCloseConfirm}
          aria-labelledby='บรรทึกความดี'
          open={openConfirm}
        >
          {handleCloseConfirm ? (
            <IconButton
              aria-label='close'
              onClick={handleCloseConfirm}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
          <DialogTitle id='alert-dialog-title-goodness'>ยืนยันการลบบันทึกความดี</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-delete-goodness' p={5}>
              {`คุณต้องการลบข้อมูลการการบันทึกความดีนี้ ใช่หรือไม่?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-goodness-dense'>
            <Button color='secondary' onClick={handleCloseConfirm}>
              ยกเลิก
            </Button>
            <Button variant='contained' color='error' onClick={handleConfirm}>
              ยืนยัน
            </Button>
          </DialogActions>
        </BootstrapDialog>
      </Fragment>
    )
  );
};

StudentGoodnessSummaryReport.acl = {
  action: 'read',
  subject: 'student-goodness-summary-report',
};

export default StudentGoodnessSummaryReport;
