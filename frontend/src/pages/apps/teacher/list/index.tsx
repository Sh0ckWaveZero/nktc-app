import {
  AccountBoxMultipleOutline,
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
  CircularProgress,
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
import { useClassroomStore, useTeacherStore } from '@/store/index';
import { useDebounce, useEffectOnce } from '@/hooks/userCommon';
import { userRoleType, userStatusType } from '@/@core/utils/types';

import AddUserDrawer from '@/views/apps/teacher/list/AddUserDrawer';
import CustomAvatar from '@/@core/components/mui/avatar';
import CustomChip from '@/@core/components/mui/chip';
import { DataGrid } from '@mui/x-data-grid';
import Link from 'next/link';
import { LocalStorageService } from '@/services/localStorageService';
import SidebarAddClassroom from '@/views/apps/teacher/list/AddClassroomDrawer';
import TableHeader from '@/views/apps/teacher/list/TableHeader';
import { ThemeColor } from '@/@core/layouts/types';
import { getInitials } from '@/@core/utils/get-initials';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import toast from 'react-hot-toast';
import useGetImage from '@/hooks/useGetImage';

interface UserRoleType {
  [key: string]: ReactElement;
}

interface TeacherStatusType {
  [key: string]: ThemeColor;
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
};

// ** Styled component for the link for the avatar with image
const AvatarWithImageLink = styled(Link)(({ theme }) => ({
  marginRight: theme.spacing(3),
}));

// ** Styled component for the link for the avatar without image
const AvatarWithoutImageLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  marginRight: theme.spacing(3),
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: theme.spacing(8),
}));

const localStorageService = new LocalStorageService();

const accessToken = localStorageService.getToken()!;

// ** renders client column
const renderClient = (row: any) => {
  if (row?.avatar.length) {
    const { isLoading, image } = useGetImage(row?.avatar, accessToken);
    return isLoading ? (
      <CircularProgress />
    ) : (
      <AvatarWithImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar src={image as string} sx={{ mr: 3, width: 40, height: 40 }} />
      </AvatarWithImageLink>
    );
  } else {
    return (
      <AvatarWithoutImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar
          skin='light'
          color={row?.avatarColor || 'primary'}
          sx={{ mr: 3, width: 40, height: 40, fontSize: '.875rem' }}
        >
          {getInitials(row.firstName + ' ' + row.lastName)}
        </CustomAvatar>
      </AvatarWithoutImageLink>
    );
  }
};

const RowOptions = ({ id }: { id: number | string }) => {
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

  const handleDelete = () => {
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
        <MenuItem>
          <EyeOutline fontSize='small' sx={{ mr: 2, color: 'info.main' }} />
          ดู
        </MenuItem>
        <MenuItem onClick={handleRowOptionsClose}>
          <PencilOutline fontSize='small' sx={{ mr: 2, color: 'warning.main' }} />
          แก้ไข
        </MenuItem>
        <MenuItem onClick={handleDelete}>
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

  // ** Hooks


  const { teacher, fetchTeacher, updateClassroom, teacherLoading }: any = useTeacherStore(
    (state) => ({
      teacher: state.teacher,
      teacherLoading: state.teacherLoading,
      fetchTeacher: state.fetchTeacher,
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
    });
  }, [debouncedValue]);

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
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <StyledLink href={`/apps/user/view/${id}`} passHref>
                <Typography
                  noWrap
                  component='p'
                  variant='body2'
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
                >
                  {title + '' + firstName + ' ' + lastName}
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack direction='row' divider={<Divider orientation='vertical' flexItem />} spacing={2}>
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
                          ยังไม่ลงทะเบียนห้องที่ปรึกษา
                        </Typography>
                      )
                    }
                  >
                    <IconButton aria-label={id} aria-describedby={id}>
                      <Badge
                        badgeContent={row.teacherOnClassroom.length > 0 ? row.teacherOnClassroom.length : '0'}
                        color={row.teacherOnClassroom.length > 0 ? 'primary' : 'error'}
                        sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15 } }}
                      >
                        <AccountBoxMultipleOutline
                          fontSize='small'
                          sx={{ color: row.teacherOnClassroom.length > 0 ? 'warning.main' : 'error.main' }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Fragment>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <IconButton
                  sx={{ mb: 2 }}
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
          </Box>
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
        return (
          <Typography
            variant='body2'
            noWrap
            sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
          >
            {row.totalLogin ?? '0 '} วัน
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
      renderCell: ({ row }: CellType) => <RowOptions id={row.id} />,
    },
  ];

  return (
    <Fragment>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='ข้อมูลครู / บุคลากร ทั้งหมด' />
            <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
            <DataGrid
              disableColumnMenu
              autoHeight={true}
              rows={teacher}
              getRowHeight={() => 'auto'}
              columns={columns}
              pageSize={pageSize}
              disableSelectionOnClick
              rowsPerPageOptions={[10, 25, 50]}
              onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
            />
          </Card>
        </Grid>

        <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} />
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
    </Fragment>
  );
};

TeacherList.acl = {
  action: 'read',
  subject: 'teacher-list-pages',
};
export default TeacherList;
