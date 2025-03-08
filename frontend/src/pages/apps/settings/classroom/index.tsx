import { alpha, Card, CardHeader, IconButton, Menu, MenuItem, styled, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DeleteOutline, DotsVertical } from 'mdi-material-ui';
import { Fragment, MouseEvent, useCallback, useEffect, useState } from 'react';

import AddClassroomDrawer from '@/views/apps/settings/classroom/AddClassroomDrawer';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import DialogDeleteClassroom from '@/views/apps/settings/classroom/DialogDeleteClassroom';
import TableHeader from '@/views/apps/settings/classroom/TableHeader';
import { generateErrorMessages } from 'utils/event';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../hooks/useAuth';
import { useClassroomStore } from '@/store/index';
import { useDebounce } from '@/hooks/userCommon';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface RowOptionsType {
  row: any;
  handleDelete: (data: any) => void;
}

interface CellType {
  row: any;
}

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[100],
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },
}));

const RowOptions = ({ row, handleDelete }: RowOptionsType) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const rowOptionsOpen = Boolean(anchorEl);
  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleRowOptionsClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteRow = () => {
    handleDelete(row);
    handleRowOptionsClose();
  };

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <DotsVertical />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem onClick={handleDeleteRow}>
          <DeleteOutline fontSize='small' sx={{ mr: 2, color: 'error.main' }} />
          ลบ
        </MenuItem>
      </Menu>
    </>
  );
};

const ClassroomList = () => {
  const useLocal = useLocalStorage();
  const accessToken = useLocal.getToken()!;
  // ** Local State
  const [value, setValue] = useState<string>('');

  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
  const debouncedValue = useDebounce<string>(value, 500);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isAddUser, setIsAddUser] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ** Hooks
  const { user } = useAuth();

  const { createClassroom, fetchClassrooms, removeClassrooms }: any = useClassroomStore(
    (state) => ({
      classroom: state.classroom,
      createClassroom: state.createClassroom,
      fetchClassrooms: state.fetchClassrooms,
      removeClassrooms: state.removeClassrooms,
    }),
    shallow,
  );

  const searchWithParams = async (params: any) => {
    try {
      setLoading(true);

      const response = await fetchClassrooms(accessToken, {
        name: debouncedValue,
        ...params,
      });

      setClassrooms(response?.data || []);
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
    };
    searchWithParams(params);
  }, [debouncedValue, isEdit, isAddUser, isDelete, page, pageSize]);

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const toggleAddClassroomDrawer = () => setAddUserOpen(!addUserOpen);

  const handleDelete = (data: any) => {
    setCurrentClassroom(data);
    setOpenDialogDelete(true);
  };

  const onHandleAddClassroom = async (info: any) => {
    setAddUserOpen(false);
    setIsAddUser(false);
    const body = {
      ...info,
      createdBy: user?.id,
      updatedBy: user?.id,
    };
    const toastId = toast.loading('กำลังเพิ่มข้อมูลขอห้องเรียน...');
    await createClassroom(accessToken, body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('เพิ่มข้อมูลสำเร็จ', { id: toastId });
        setIsAddUser(true);
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
  };

  const handleDeleteClose = () => {
    setOpenDialogDelete(false);
  };

  const handleDeleteConfirm = async () => {
    setOpenDialogDelete(false);

    const toastId = toast.loading('กำลังลบข้อมูลขอห้องเรียน...');
    await removeClassrooms(accessToken, currentClassroom?.id).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('ลบข้อมูลสำเร็จ', { id: toastId });
        setIsDelete(true);
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
  };

  const onHandleChangePage = useCallback((newPage: any) => {
    setPageSize(newPage);
  }, []);

  const columns: any = [
    {
      flex: 0.1,
      minWidth: 50,
      field: 'classroomId',
      headerName: 'รหัสห้องเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { classroomId } = row;
        return <Typography variant='body2'>{classroomId}</Typography>;
      },
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'name',
      headerName: 'ชื่อห้องเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { name } = row;
        return <Typography variant='body2'>{name}</Typography>;
      },
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'level',
      headerName: 'ระดับชั้น',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { level } = row;
        return <Typography variant='body2'>{level?.levelName}</Typography>;
      },
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'department',
      headerName: 'แผนก',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { department } = row;
        return <Typography variant='body2'>{department?.name}</Typography>;
      },
    },
    {
      flex: 0.15,
      minWidth: 90,
      sortable: false,
      field: 'actions',
      headerName: 'การดำเนินการอื่น ๆ',
      editable: false,
      hideSortIcons: true,
      align: 'right',
      renderCell: ({ row }: CellType) => <RowOptions row={row} handleDelete={handleDelete} />,
    },
  ];

  const handlePaginationModelChange = (paginationModel: any) => {
    const { page, pageSize } = paginationModel;
    setPage(page);
    setPageSize(pageSize);
    onHandleChangePage(pageSize);
  };

  return (
    <Fragment>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='รายชื่อห้องเรียน' />
            <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddClassroomDrawer} />
            <StripedDataGrid
              disableColumnMenu
              autoHeight={true}
              rows={classrooms}
              getRowHeight={() => 'auto'}
              columns={columns}
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
              getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
            />
          </Card>
        </Grid>
        {addUserOpen && (
          <AddClassroomDrawer
            open={addUserOpen}
            toggle={toggleAddClassroomDrawer}
            onSubmitForm={onHandleAddClassroom}
          />
        )}
      </Grid>
      {openDialogDelete && (
        <DialogDeleteClassroom
          data={currentClassroom}
          onClose={handleDeleteClose}
          onSubmitted={handleDeleteConfirm}
          open={openDialogDelete}
        />
      )}
    </Fragment>
  );
};

ClassroomList.acl = {
  action: 'manage',
  subject: 'settings-classroom-list-pages',
};
export default ClassroomList;
