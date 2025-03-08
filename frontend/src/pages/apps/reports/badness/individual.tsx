import {
  Avatar,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  IconButton,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import IconifyIcon from '@/@core/components/icon';
import { badnessIndividualStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Grid from '@mui/material/Grid2';
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

const ReportStudentBadness = () => {
  // ** Hooks
  const { user }: any = useAuth();
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;
  const ability = useContext(AbilityContext);

  const { fetchBadnessIndividualById }: any = badnessIndividualStore(
    (state: any) => ({
      fetchBadnessIndividualById: state.fetchBadnessIndividualById,
    }),
    shallow,
  );

  // ** Local State
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);
  const [total, setTotal] = useState(0);

  const searchWithParams = async (params: any) => {
    try {
      setLoading(true);

      const response = await fetchBadnessIndividualById(storedToken, {
        studentId: user?.student?.id,
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
  }, [page, pageSize, sortModel]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onHandleChangePage = useCallback((newPage: any) => {
    setPage(0);
    setPageSize(newPage);
  }, []);

  const columns: GridColDef[] = [
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
      field: 'fullName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: () => {
        const account = user?.account || {};
        const studentName = account.title + '' + account.firstName + ' ' + account.lastName;
        return (
          <Tooltip title={studentName} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {studentName}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'classroomName',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: () => {
        const classroom = user?.student?.classroom;
        return (
          <Tooltip title={classroom?.name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {classroom?.name}
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
      renderCell: ({ row }: CellType) => {
        const { badnessDetail } = row;

        return (
          <Tooltip title={badnessDetail} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {badnessDetail}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 80,
      field: 'score',
      headerName: 'คะแนน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { badnessScore } = row;
        return (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {badnessScore}
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'image',
      headerName: 'รูปภาพ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { image, badnessDetail } = row;
        const { isLoading, image: badnessImage } = useGetImage(image, storedToken);

        return isLoading ? (
          <CircularProgress />
        ) : badnessImage ? (
          <div
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              setCurrentImage(badnessImage);
              handleClickOpen();
            }}
          >
            <img src={badnessImage as any} alt={badnessDetail || 'บันทึกความดี'} width='150' height='200' />
          </div>
        ) : (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            ไม่มีรูปภาพ
          </Typography>
        );
      },
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'createDate',
      headerName: 'วันที่บันทึก',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { goodDate, createdAt } = row;
        return (
          <Tooltip
            title={new Date(goodDate || createdAt).toLocaleTimeString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            arrow
          >
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {
                  new Date(goodDate || createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) /* แสดงวันที่เป็นภาษาไทย */
                }
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  const handlePaginationModelChange = (paginationModel: any) => {
    setPage(paginationModel.page);
    onHandleChangePage(paginationModel.pageSize);
  };

  return (
    ability?.can('read', 'student-badness-report') &&
    user?.role !== 'Admin' && (
      <Fragment>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <IconifyIcon icon={'fluent:people-error-24-regular'} />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`Report ความประพฤติ`}
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
                paginationModel={{ page, pageSize }}
                pageSizeOptions={[10, 20, 50, 100]}
                onPaginationModelChange={(paginationModel) => handlePaginationModelChange(paginationModel)}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <BootstrapDialog onClose={handleClose} aria-labelledby='บรรทึกความดี' open={open}>
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
          <img src={currentImage as any} alt='ความประพฤติ' width='100%' height='100%' />
        </BootstrapDialog>
      </Fragment>
    )
  );
};

ReportStudentBadness.acl = {
  action: 'read',
  subject: 'student-badness-report',
};

export default ReportStudentBadness;
