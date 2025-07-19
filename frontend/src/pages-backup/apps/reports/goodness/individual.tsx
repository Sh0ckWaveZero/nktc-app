import {
  Avatar,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import IconifyIcon from '@/@core/components/icon';
import { LocalStorageService } from '@/services/localStorageService';
import { goodnessIndividualStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';

interface CellType {
  row: any;
}

const localStorageService = new LocalStorageService();

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

const ReportStudentGoodness = () => {
  // ** Hooks
  const { user }: any = useAuth();
  const storedToken = localStorageService.getToken()!;
  const ability = useContext(AbilityContext);

  const { fetchGoodnessIndividualById }: any = goodnessIndividualStore(
    (state: any) => ({
      fetchGoodnessIndividualById: state.fetchGoodnessIndividualById,
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

      const response = await fetchGoodnessIndividualById(storedToken, {
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

  const columns: GridColumns = [
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
        const { goodnessDetail } = row;

        return (
          <Tooltip title={goodnessDetail} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {goodnessDetail}
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
        const { goodnessScore } = row;
        return (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {goodnessScore}
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
        const { image, goodnessDetail } = row;
        const { isLoading, image: goodnessImage } = useGetImage(image, storedToken);

        return isLoading ? (
          <CircularProgress />
        ) : goodnessImage ? (
          <div
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              setCurrentImage(goodnessImage);
              handleClickOpen();
            }}
          >
            <img src={goodnessImage as any} alt={goodnessDetail || 'บันทึกความดี'} width='150' height='200' />
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

  return (ability?.can('read', 'student-goodness-report') &&
  user?.role !== 'Admin' && (<Fragment>
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <IconifyIcon icon={'humbleicons:bulb'} />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`Report ความดี`}
          />

          <DataGrid
            autoHeight
            columns={columns}
            rows={data ?? []}
            disableColumnMenu
            loading={loading}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            pagination
            paginationMode='server'
            pageSize={pageSize}
            rowCount={total}
            onPageChange={(params: any) => setPage(params)}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onPageSizeChange={(newPageSize: number) => onHandleChangePage(newPageSize)}
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
      <img src={currentImage as any} alt='บันทึกความดี' width='100%' height='100%' />
    </BootstrapDialog>
  </Fragment>));
};

ReportStudentGoodness.acl = {
  action: 'read',
  subject: 'student-goodness-report',
};

export default ReportStudentGoodness;
