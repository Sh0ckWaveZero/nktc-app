import {
  BriefcasePlusOutline,
  ChartDonut,
  CogOutline,
  DeleteOutline,
  DotsVertical,
  EyeOutline,
  HumanMaleBoard,
  Laptop,
  PencilOutline,
} from 'mdi-material-ui';
import {
  Badge,
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Fragment, MouseEvent, ReactElement, useCallback, useEffect, useState } from 'react';
import { useClassroomStore, useTeacherStore, useUserStore } from '@/store/index';
import { useDebounce, useEffectOnce } from '@/hooks/userCommon';
import { userRoleType, userStatusType } from '@/@core/utils/types';

import AddTeacherDrawer from '@/views/apps/teacher/list/AddUserDrawer';
import CustomChip from '@/@core/components/mui/chip';
import { DataGrid } from '@mui/x-data-grid';
import DialogEditUserInfo from '@/views/apps/admin/teacher/DialogEditUserInfo';
import IconifyIcon from '@/@core/components/icon';
import Link from 'next/link';
import { LocalStorageService } from '@/services/localStorageService';
import ResetPasswordDialog from '@/views/apps/admin/teacher/ResetPasswordDialog';
import SidebarAddClassroom from '@/views/apps/teacher/list/AddClassroomDrawer';
import TableHeader from '@/views/apps/teacher/list/TableHeader';
import { ThemeColor } from '@/@core/layouts/types';
import bcrypt from 'bcryptjs';
import { generateErrorMessages } from 'utils/event';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../hooks/useAuth';
import DialogDeleteTeacher from '@/views/apps/admin/teacher/DialogDeleteTeacher';
import RenderAvatar from '@/@core/components/avatar';

interface UserRoleType {
  [key: string]: ReactElement;
}

interface TeacherStatusType {
  [key: string]: ThemeColor;
}

interface RowOptionsType {
  row: any;
  handleDelete: (data: any) => void;
  handleEdit: (data: any) => void;
  handleChangePassword: (data: any) => void;
}

// ** Vars
const userRoleObj: UserRoleType = {
  admin: <Laptop fontSize='small' sx={{ mr: 3, color: 'error.main' }} />,
  author: <CogOutline fontSize='small' sx={{ mr: 3, color: 'warning.main' }} />,
  editor: <PencilOutline fontSize='small' sx={{ mr: 3, color: 'success.main' }} />,
  maintainer: <ChartDonut fontSize='small' sx={{ mr: 3, color: 'primary.main' }} />,
  teacher: <HumanMaleBoard fontSize='small' sx={{ mr: 3, color: 'info.main' }} />,
};

interface CellType {
  // row: teachersTypes;
  row: any;
}

const userStatusObj: TeacherStatusType | any = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
  true: 'success',
  false: 'secondary',
};

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: theme.spacing(8),
}));

const localStorageService = new LocalStorageService();

const accessToken = localStorageService.getToken()!;

const RowOptions = ({ row, handleDelete, handleEdit, handleChangePassword }: RowOptionsType) => {
  // ** Hooks

  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const rowOptionsOpen = Boolean(anchorEl);
  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleRowOptionsClose = () => {
    setAnchorEl(null);
  };

  const handleEditRow = () => {
    handleEdit(row);
    handleRowOptionsClose();
  };

  const handleChangePasswordRow = () => {
    handleChangePassword(row);
    handleRowOptionsClose();
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
        slotProps={{
          paper: { sx: { minWidth: '8rem' } },
        }}
      >
        <MenuItem onClick={handleChangePasswordRow}>
          <IconifyIcon icon='mdi:password-check-outline' fontSize='1.3rem' style={{ marginRight: '10px' }} />
          เปลี่ยนรหัสผ่าน
        </MenuItem>

        <MenuItem>
          <EyeOutline fontSize='small' sx={{ mr: 2, color: 'info.main' }} />
          ดู
        </MenuItem>
        <MenuItem onClick={handleEditRow}>
          <PencilOutline fontSize='small' sx={{ mr: 2, color: 'warning.main' }} />
          แก้ไข
        </MenuItem>
        <MenuItem onClick={handleDeleteRow}>
          <DeleteOutline fontSize='small' sx={{ mr: 2, color: 'error.main' }} />
          ลบ
        </MenuItem>
      </Menu>
    </>
  );
};

const TeacherList = () => {
  // ** Local State
  const [value, setValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
  const [addClassroomOpen, setAddClassroomOpen] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const debouncedValue = useDebounce<string>(value, 500);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [openDialogEdit, setOpenDialogEdit] = useState(false);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [teachers, setTeachers] = useState<any>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isAddUser, setIsAddUser] = useState(false);

  // ** Hooks
  const { user } = useAuth();

  const { resetPasswordByAdmin }: any = useUserStore(
    (state) => ({
      resetPasswordByAdmin: state.resetPasswordByAdmin,
    }),
    shallow,
  );
  const { addTeacher, removeTeacher, update, teacherLoading, updateClassroom, fetchTeacher }: any =
    useTeacherStore(
      (state) => ({
        addTeacher: state.addTeacher,
        fetchTeacher: state.fetchTeacher,
        removeTeacher: state.removeTeacher,
        teacherLoading: state.teacherLoading,
        update: state.update,
        updateClassroom: state.updateClassroom,
      }),
      shallow,
    );
  const { classroom, fetchClassroom }: any = useClassroomStore(
    (state) => ({
      classroom: state.classroom,
      fetchClassroom: state.fetchClassroom,
    }),
    shallow,
  );

  useEffectOnce(() => {
    fetchClassroom(accessToken);
  });

  // ** fetch data on page load && when value changes
  useEffect(() => {
    fetchTeacher(accessToken, {
      q: value,
    }).then((res: any) => {
      setTeachers(res || []);
    });

    return () => {
      setCurrentData(null);
      setIsAddUser(false);
      setIsDelete(false);
      setIsEdit(false);
      setTeachers([]);
    };
  }, [debouncedValue, isEdit, isAddUser, isDelete]);

  const defaultValue: any = currentData
    ? classroom.filter((item: any) => currentData.teacherOnClassroom.includes(item.id))
    : [];
  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen);

  const toggleAddClassroomDrawer = () => setAddClassroomOpen(!addClassroomOpen);

  const onSubmittedClassroom = async (event: any, data: any) => {
    event.preventDefault();
    const classrooms = data.map((item: any) => item.id);
    const info = { id: currentData.id, classrooms, teacherInfo: currentData.teacherId };
    toast.promise(updateClassroom(accessToken, info), {
      loading: 'กำลังบันทึก...',
      success: 'บันทึกสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    fetchTeacher(accessToken, {
      q: '',
    });
    toggleAddClassroomDrawer();
  };

  const handleEdit = (data: any) => {
    setCurrentTeacher(data);
    setOpenDialogEdit(true);
  };

  const handleDelete = (data: any) => {
    setCurrentTeacher(data);
    setOpenDialogDelete(true);
  };

  const onHandleEditClose = (): void => {
    setOpenDialogEdit(false);
  };

  const onHandleChangePasswordClose = (): void => {
    setOpenChangePassword(false);
  };

  const handleChangePassword = (data: any) => {
    setCurrentTeacher(data);
    setOpenChangePassword(true);
  };

  const handleEditTeacher = async (data: any) => {
    setOpenDialogEdit(false);
    const body = {
      user: {
        id: user?.id,
      },
      teacher: {
        ...data,
      },
      account: {
        id: currentTeacher?.accountId,
      },
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await update(accessToken, body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });
        setIsEdit(true);
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
  };

  const handleChangePasswordTeacher = async (data: any) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    setOpenChangePassword(false);
    const body = {
      user: {
        id: user?.id,
      },
      teacher: {
        id: data.id,
        password: hashedPassword,
      },
    };
    const toastId = toast.loading('กำลังเปลี่ยนรหัสผ่าน...');
    await resetPasswordByAdmin(accessToken, body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('เปลี่ยนรหัสผ่านสำเร็จ', { id: toastId });
        setIsAddUser(true);
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });

    setIsAddUser(false);
  };

  const onHandleAddTeacher = async (info: any) => {
    setAddUserOpen(false);

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(info.password, salt);

    const { password, fullName, ...rest } = info;
    const [firstName, lastName] = fullName.split(' ');

    const body = {
      user: {
        id: user?.id,
      },
      teacher: {
        ...rest,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'Teacher',
        status: 'true',
      },
    };

    const toastId = toast.loading('กำลังเพิ่มข้อมูลของครู/อาจารย์...');
    await addTeacher(accessToken, body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('เพิ่มข้อมูลสำเร็จ', { id: toastId });
        setIsEdit(true);
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

    const toastId = toast.loading('กำลังลบข้อมูลของครู/อาจารย์...');
    await removeTeacher(accessToken, currentTeacher?.id).then((res: any) => {
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

  const columns: any = [
    {
      flex: 0.25,
      minWidth: 200,
      field: 'fullName',
      headerName: 'ชื่อผู้ใช้ระบบ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { id, title, firstName, lastName, username } = row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RenderAvatar row={row} storedToken={accessToken} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <StyledLink href={`/apps/user/view/${id}`} passHref>
                <Typography
                  noWrap
                  component='p'
                  variant='body2'
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
                >
                  {(title ? title : '') + '' + firstName + ' ' + lastName}
                </Typography>
              </StyledLink>
              <StyledLink href={`/apps/user/view/${id}`} passHref>
                <Typography noWrap component='p' variant='caption' sx={{ textDecoration: 'none' }}>
                  @{username}
                </Typography>
              </StyledLink>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'teacherOnClassroom',
      headerName: 'ครูประจำชั้น',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { teacherOnClassroom, classrooms } = row;
        return (
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='center'
            spacing={3}
            divider={<Divider orientation='vertical' flexItem />}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Fragment>
                <Tooltip
                  title={
                    !isEmpty(teacherOnClassroom.length && !isEmpty(classrooms)) ? (
                      row.classrooms.map((item: any) => {
                        return (
                          <Typography key={item} variant='body2' sx={{ color: 'common.white' }}>
                            {item}
                          </Typography>
                        );
                      })
                    ) : (
                      <Typography variant='body2' sx={{ color: 'common.white' }}>
                        ยังไม่ได้เลือกเป็นปรึกษา
                      </Typography>
                    )
                  }
                >
                  <IconButton
                    aria-label={id}
                    aria-describedby={id}
                    sx={{
                      cursor: 'default',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&:active': {
                        backgroundColor: 'transparent',
                      },
                      '&:disabled': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <Badge
                      badgeContent={row.teacherOnClassroom.length > 0 ? row.teacherOnClassroom.length : '0'}
                      color={row.teacherOnClassroom.length > 0 ? 'error' : 'secondary'}
                      sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15 } }}
                    >
                      <IconifyIcon
                        icon={'codicon:symbol-class'}
                        width={22}
                        height={22}
                        style={{ color: row.teacherOnClassroom.length > 0 ? '#56CA00' : 'rgba(58, 53, 65, 0.68)' }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Fragment>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <IconButton
                onClick={() => {
                  setAddClassroomOpen(true);
                  setCurrentData(row);
                }}
              >
                <Tooltip
                  title={
                    <Typography variant='body2' sx={{ color: 'common.white' }}>
                      เพิ่มห้องที่ปรึกษา
                    </Typography>
                  }
                >
                  <BriefcasePlusOutline fontSize='small' sx={{ mr: 1, color: 'success.main' }} />
                </Tooltip>
              </IconButton>
            </Box>
          </Stack>
        );
      },
    },
    {
      flex: 0.15,
      field: 'role',
      minWidth: 120,
      headerName: 'บทบาท',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {userRoleObj[row.role.toLowerCase()]}
            <Typography
              variant='body2'
              noWrap
              sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
            >
              {userRoleType[row.role] ?? 'ไม่ระบุ'}
            </Typography>
          </Box>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 130,
      headerName: 'ลงชื่อเข้าใช้งานสะสม',
      field: 'totalLogin',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { loginCountByUser } = row;
        return (
          <Typography
            variant='body2'
            noWrap
            sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
          >
            {loginCountByUser.length > 0 ? loginCountByUser.length : 0} วัน
          </Typography>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 80,
      field: 'status',
      headerName: 'สถานะ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        return (
          <CustomChip
            skin='light'
            size='small'
            label={userStatusType[row.status]}
            color={userStatusObj[row.status.toLowerCase()]}
            sx={{ textTransform: 'capitalize' }}
          />
        );
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
      renderCell: ({ row }: CellType) => (
        <RowOptions
          row={row}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleChangePassword={handleChangePassword}
        />
      ),
    },
  ];

  return (
    <Fragment>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='ข้อมูลครู / บุคลากร ทั้งหมด' />
            <TableHeader
              value={value}
              handleFilter={handleFilter}
              toggle={toggleAddUserDrawer}
               data={teachers} 
            />
            <DataGrid
              disableColumnMenu
              autoHeight={true}
              rows={teachers}
              getRowHeight={() => 'auto'}
              columns={columns}
              pageSize={pageSize}
              disableSelectionOnClick
              rowsPerPageOptions={[10, 25, 50]}
              onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
            />
          </Card>
        </Grid>
        {addUserOpen && (
          <AddTeacherDrawer
            open={addUserOpen}
            toggle={toggleAddUserDrawer}
            data={teachers}
            onSubmitForm={onHandleAddTeacher}
          />
        )}
        {addClassroomOpen && (
          <SidebarAddClassroom
            open={addClassroomOpen}
            toggle={toggleAddClassroomDrawer}
            onSubmitted={onSubmittedClassroom}
            defaultValues={defaultValue}
            data={classroom}
            onLoad={teacherLoading}
          />
        )}
      </Grid>
      {openDialogEdit && (
        <DialogEditUserInfo
          show={openDialogEdit}
          data={currentTeacher}
          onClose={onHandleEditClose}
          onSubmitForm={handleEditTeacher}
        />
      )}
      {openChangePassword && (
        <ResetPasswordDialog
          show={openChangePassword}
          data={currentTeacher}
          onClose={onHandleChangePasswordClose}
          onSubmitForm={handleChangePasswordTeacher}
        />
      )}
      {openDialogDelete && (
        <DialogDeleteTeacher
          data={currentTeacher}
          onClose={handleDeleteClose}
          onSubmitted={handleDeleteConfirm}
          open={openDialogDelete}
        />
      )}
    </Fragment>
  );
};

TeacherList.acl = {
  action: 'read',
  subject: 'teacher-list-pages',
};
export default TeacherList;
