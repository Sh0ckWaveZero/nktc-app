// ** React Imports
import { useState, useEffect, MouseEvent, useCallback, ReactElement } from 'react';

// ** Next Import
import Link from 'next/link';

// ** MUI Imports
import {
  IconButton,
  MenuItem,
  Typography,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Box,
  Card,
  Grid,
  Menu,
  List,
  Divider,
  Stack,
  Paper,
  Popover,
  Button,
  Badge,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';

// ** Icons Imports
import {
  Laptop,
  CogOutline,
  PencilOutline,
  ChartDonut,
  AccountOutline,
  DotsVertical,
  EyeOutline,
  DeleteOutline,
  HumanMaleBoard,
  BriefcasePlusOutline,
  AccountBoxMultipleOutline,
} from 'mdi-material-ui';

// ** Store Imports
import { useTeacherStore } from '../../../../store';

// ** Custom Components Imports
import CustomChip from '@/@core/components/mui/chip';
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';

// ** Types Imports
import { ThemeColor } from '@/@core/layouts/types';
import { teachersTypes } from '@/types/apps/teacherTypes';

// ** Custom Components Imports
import TableHeader from '@/views/apps/teacher/list/TableHeader';
import AddUserDrawer from '@/views/apps/teacher/list/AddUserDrawer';
import { userRoleType, userStatusType } from '@/@core/utils/types';
import auth from '@/configs/auth';
import { useDebounce } from '@/hooks/userCommon';
import SidebarAddClassroom from '@/views/apps/teacher/list/AddClassroomDrawer';

type Teacher = {
  id: number;
  name: string;
  fullName: string;
  classroomTeacher: string; //ครูประจำชั้น
  numberOfTeachingHours: number;
  numberOfLoginHours: number;
  report: string;
  classSchedule: string;
  status: string;
  role: string;
  avatar: string;
  color: ThemeColor;
};

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

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    fontSize: '0.65rem',
  },
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

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

// ** renders client column
const renderClient = (row: any) => {
  if (row.avatar.length) {
    return (
      <AvatarWithImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 30, height: 30 }} />
      </AvatarWithImageLink>
    );
  } else {
    return (
      <AvatarWithoutImageLink href={`/apps/user/view/${row.id}`}>
        <CustomAvatar
          skin='light'
          color={row.avatarColor || 'primary'}
          sx={{ mr: 3, width: 30, height: 30, fontSize: '.875rem' }}
        >
          {getInitials(row.firstName + ' ' + row.lastName)}
        </CustomAvatar>
      </AvatarWithoutImageLink>
    );
  }
};

// ** Styled component for the link inside menu
const MenuItemLink = styled('a')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  padding: theme.spacing(1.5, 4),
  color: theme.palette.text.primary,
}));

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
    // dispatch(deleteUser(id));
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
        <MenuItem sx={{ p: 0 }}>
          <Link href={`/apps/user/view/${id}`} passHref>
            <MenuItemLink>
              <EyeOutline fontSize='small' sx={{ mr: 2, color: 'info.main' }} />
              ดู
            </MenuItemLink>
          </Link>
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
  const [role, setRole] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
  const [addClassroomOpen, setAddClassroomOpen] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const debouncedValue = useDebounce<string>(value, 500);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // ** Hooks
  const fetch = useTeacherStore((state: any) => state.fetchTeacher);
  const teacher = useTeacherStore((state: any) => state.teacher);

  useEffect(() => {
    fetch({
      role,
      status,
      q: value,
      currentPlan: plan,
    });
  }, [plan, role, status, debouncedValue]);

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const handleRoleChange = useCallback((e: SelectChangeEvent) => {
    setRole(e.target.value);
  }, []);

  const handlePlanChange = useCallback((e: SelectChangeEvent) => {
    setPlan(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: SelectChangeEvent) => {
    setStatus(e.target.value);
  }, []);

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen);
  const toggleAddClassroomDrawer = () => setAddClassroomOpen(!addClassroomOpen);

  const columns = [
    {
      flex: 0.25,
      minWidth: 200,
      field: 'fullName',
      headerName: 'ชื่อผู้ใช้ระบบ',
      renderCell: ({ row }: CellType) => {
        const { id, title, firstName, lastName, username } = row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Link href={`/apps/user/view/${id}`} passHref>
                <Typography
                  noWrap
                  component='a'
                  variant='body2'
                  sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none' }}
                >
                  {title + '' + firstName + ' ' + lastName}
                </Typography>
              </Link>
              <Link href={`/apps/user/view/${id}`} passHref>
                <Typography noWrap component='a' variant='caption' sx={{ textDecoration: 'none' }}>
                  @{username}
                </Typography>
              </Link>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'levelClassroomId',
      headerName: 'ครูประจำชั้น',
      renderCell: ({ row }: CellType) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack direction='row' divider={<Divider orientation='vertical' flexItem />} spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <>
                  <Tooltip
                    title={row.levelClassroomId.length > 0 ? 'จำนวนห้องที่ปรึกษา' : 'ยังไม่ลงทะเบียนห้องที่ปรึกษา'}
                  >
                    <IconButton aria-label={id} aria-describedby={id} onClick={handleClick}>
                      <Badge
                        badgeContent={row.levelClassroomId.length > 0 ? row.levelClassroomId.length : '0'}
                        color={row.levelClassroomId.length > 0 ? 'primary' : 'error'}
                        sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15 } }}
                      >
                        <AccountBoxMultipleOutline
                          fontSize='small'
                          sx={{ color: row.levelClassroomId.length > 0 ? 'warning.main' : 'error.main' }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  >
                    <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
                  </Popover>
                </>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <IconButton
                  sx={{ mb: 2 }}
                  onClick={() => {
                    setAddClassroomOpen(true);
                    setCurrentData(row);
                  }}
                >
                  <Tooltip title='เพิ่มห้องที่ปรึกษา'>
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
      renderCell: ({ row }: CellType) => <RowOptions id={row.id} />,
    },
  ];

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='ข้อมูลครู / บุคลากร ทั้งหมด' />
          <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
          <DataGrid
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
      <SidebarAddClassroom open={addClassroomOpen} toggle={toggleAddClassroomDrawer} data={currentData} />
    </Grid>
  );
};

export default TeacherList;
