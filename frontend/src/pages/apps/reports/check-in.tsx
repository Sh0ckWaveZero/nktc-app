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
  Box,
  Card,
  Grid,
  Menu,
  Divider,
  Stack,
  Popover,
  Badge,
  Tooltip,
  Avatar,
  CardContent,
  Checkbox,
  Container,
} from '@mui/material';
import { DataGrid, GridCellEditCommitParams, GridCellParams, GridColumns } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';

// ** Icons Imports
import {
  Laptop,
  CogOutline,
  PencilOutline,
  ChartDonut,
  DotsVertical,
  EyeOutline,
  DeleteOutline,
  HumanMaleBoard,
  BriefcasePlusOutline,
  AccountBoxMultipleOutline,
} from 'mdi-material-ui';

// ** Store Imports
import { useClassroomStore, useTeacherStore } from '@/store/index';

// ** Custom Components Imports
import CustomChip from '@/@core/components/mui/chip';
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';

// ** Types Imports
import { ThemeColor } from '@/@core/layouts/types';

// ** Custom Components Imports
import TableHeader from '@/views/apps/reports/check-in/TableHeader';
import AddUserDrawer from '@/views/apps/teacher/list/AddUserDrawer';
import { userRoleType, userStatusType } from '@/@core/utils/types';
import { useDebounce, useEffectOnce } from '@/hooks/userCommon';
import SidebarAddClassroom from '@/views/apps/teacher/list/AddClassroomDrawer';

// ** Config
import authConfig from '@/configs/auth';
import toast, { Toaster } from 'react-hot-toast';
import ReactHotToast from '@/@core/styles/libs/react-hot-toast';
import { HiOutlineFlag } from 'react-icons/hi';

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

const StudentCheckIn = () => {
  // ** Local State
  const [value, setValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
  const [addClassroomOpen, setAddClassroomOpen] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any>(null);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState<any>([]);
  const [isPresentCheckAll, setIsPresentCheckAll] = useState(false);
  const [isAbsentCheckAll, setIsAbsentCheckAll] = useState(false);
  const [isLateCheckAll, setIsLateCheckAll] = useState(false);
  const [isLeaveCheckAll, setIsLeaveCheckAll] = useState(false);
  const [isPresentCheck, setIsPresentCheck] = useState<any>([]);
  const [isAbsentCheck, setIsAbsentCheck] = useState<any>([]);
  const [isLateCheck, setIsLateCheck] = useState<any>([]);
  const [isLeaveCheck, setIsLeaveCheck] = useState<any>([]);

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
  const { teacher, loading, hasErrors, fetchTeacher, updateClassroom } = useTeacherStore();
  const { classroom, fetchClassroom } = useClassroomStore();
  const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!;

  useEffectOnce(() => {
    fetchClassroom(storedToken);
  });

  // ** fetch data on page load && when value changes
  useEffect(() => {
    fetchTeacher(storedToken, {
      q: value,
    });
  }, [debouncedValue]);

  const defaultValue: any = currentData
    ? classroom.filter((item: any) => currentData.classroomIds.includes(item.id))
    : [];

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen);

  const toggleAddClassroomDrawer = () => setAddClassroomOpen(!addClassroomOpen);

  const onSubmittedClassroom = async (event: any, data: any) => {
    event.preventDefault();
    const classrooms = data.map((item: any) => item.id);
    const info = { id: currentData.id, classrooms };
    toast.promise(updateClassroom(storedToken, info), {
      loading: 'กำลังบันทึก...',
      success: 'บันทึกสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    fetchTeacher(storedToken, {
      q: '',
    });
    toggleAddClassroomDrawer();
  };

  const onHandleToggle = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        handleTogglePresent(param);
        break;
      case 'absent':
        handleToggleAbsent(param);
        break;
      case 'late':
        handleToggleLate(param);
        break;
      case 'leave':
        handleToggleLeave(param);
        break;
      default:
        break;
    }

    onRemoveToggleOthers(action, param);
  };

  const handleTogglePresent = (param: any): void => {
    setIsPresentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleAbsent = (param: any): void => {
    setIsAbsentCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLate = (param: any): void => {
    setIsLateCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const handleToggleLeave = (param: any): void => {
    setIsLeaveCheck((prevState: any) => {
      return onSetToggle(prevState, param);
    });
  };

  const onSetToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index === -1) {
      newSelection = newSelection.concat(prevSelection, param.id);
    } else if (index === 0) {
      newSelection = newSelection.concat(prevSelection.slice(1));
    } else if (index === prevSelection.length - 1) {
      newSelection = newSelection.concat(prevSelection.slice(0, -1));
    } else if (index > 0) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }

    return newSelection;
  };

  const onRemoveToggleOthers = (action: string, param: any): void => {
    switch (action) {
      case 'present':
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'absent':
        onHandlePresentChecked(param);
        onHandleLateChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'late':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLeaveChecked(param);
        break;
      case 'leave':
        onHandlePresentChecked(param);
        onHandleAbsentChecked(param);
        onHandleLateChecked(param);
        break;
      default:
        break;
    }
  };

  const onHandleAbsentChecked = (param: any): void => {
    if (isAbsentCheck.includes(param.id)) {
      setIsAbsentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandlePresentChecked = (param: any): void => {
    if (isPresentCheck.includes(param.id)) {
      setIsPresentCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLateChecked = (param: any): void => {
    if (isLateCheck.includes(param.id)) {
      setIsLateCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onHandleLeaveChecked = (param: any): void => {
    if (isLeaveCheck.includes(param.id)) {
      setIsLeaveCheck((prevState: any) => {
        return onRemoveToggle(prevState, param);
      });
    }
  };

  const onRemoveToggle = (prevState: any, param: any): any => {
    const prevSelection = prevState;
    const index = prevSelection.indexOf(param.id);

    let newSelection: any[] = [];

    if (index !== -1) {
      newSelection = newSelection.concat(prevSelection.slice(0, index), prevSelection.slice(index + 1));
    }

    return newSelection;
  };

  const onHandleCheckAll = (e: any, action: string): void => {
    if (action === 'present') {
      handleTogglePresentAll();
    } else if (action === 'absent') {
      handleToggleAbsentAll();
    } else if (action === 'late') {
      handleToggleLateAll();
    } else if (action === 'leave') {
      handleToggleLeaveAll();
    }

    onClearAll(action);
  };

  const handleTogglePresentAll = (): void => {
    setIsPresentCheckAll(!isPresentCheckAll);
    setIsPresentCheck(teacher.map((item) => item.id));
    if (isPresentCheckAll) {
      setIsPresentCheck([]);
    }
  };

  const handleToggleAbsentAll = (): void => {
    setIsAbsentCheckAll(!isAbsentCheckAll);
    setIsAbsentCheck(teacher.map((item) => item.id));
    if (isAbsentCheckAll) {
      setIsAbsentCheck([]);
    }
  };

  const handleToggleLateAll = (): void => {
    setIsLateCheckAll(!isLateCheckAll);
    setIsLateCheck(teacher.map((item) => item.id));
    if (isLateCheckAll) {
      setIsLateCheck([]);
    }
  };

  const handleToggleLeaveAll = (): void => {
    setIsLeaveCheckAll(!isLeaveCheckAll);
    setIsLeaveCheck(teacher.map((item) => item.id));
    if (isLeaveCheckAll) {
      setIsLeaveCheck([]);
    }
  };

  const onClearAll = (action: string): void => {
    if (action !== 'present') {
      setIsPresentCheckAll(false);
      setIsPresentCheck([]);
    }
    if (action !== 'absent') {
      setIsAbsentCheckAll(false);
      setIsAbsentCheck([]);
    }
    if (action !== 'late') {
      setIsLateCheckAll(false);
      setIsLateCheck([]);
    }
    if (action !== 'leave') {
      setIsLeaveCheckAll(false);
      setIsLeaveCheck([]);
    }
  };

  const columns: GridColumns = [
    {
      flex: 0.06,
      minWidth: 30,
      headerName: 'ลำดับ',
      field: 'totalLogin',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        return (
          <Typography
            variant='body2'
            noWrap
            sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
          >
            {1}
          </Typography>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 220,
      field: 'fullName',
      headerName: 'ชื่อ-สกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
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
      minWidth: 110,
      field: 'present',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          checked={isPresentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('present', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'มาเรียน'}
          <Checkbox
            sx={{ p: 0 }}
            checked={isPresentCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'present')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'absent',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          checked={isAbsentCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('absent', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ขาด'}
          <Checkbox
            sx={{ p: 0 }}
            checked={isAbsentCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'absent')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'leave',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          checked={isLeaveCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('leave', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'ลา'}
          <Checkbox
            sx={{ p: 0 }}
            checked={isLeaveCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'leave')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'late',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: (params: GridCellParams) => (
        <Checkbox
          checked={isLateCheck.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() => onHandleToggle('late', params)}
        />
      ),
      renderHeader: () => (
        <Container className='MuiDataGrid-columnHeaderTitle' sx={{ display: 'flex', textAlign: 'start' }}>
          {'มาสาย'}
          <Checkbox
            sx={{ p: 0 }}
            checked={isLateCheckAll || false}
            onChange={(e) => onHandleCheckAll(e, 'late')}
            style={{ paddingLeft: '4px' }}
          />
        </Container>
      ),
    },
  ];

  function handleUpdate(params: GridCellEditCommitParams): void {
    console.log('🚀 ~ file: check-in.tsx ~ line 462 ~ handleUpdate ~ params', params);
  }

  // submit
  const onSubmit = async () => {
    const data = {
      present: isPresentCheck,
      absent: isAbsentCheck,
      late: isLateCheck,
      leave: isLeaveCheck,
    };
    console.log('🚀 ~ file: check-in.tsx ~ line 473 ~ onSubmit ~ data', data);
  };

  return (
    <>
      <ReactHotToast>
        <Toaster position='top-right' reverseOrder={false} toastOptions={{ className: 'react-hot-toast' }} />
      </ReactHotToast>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <HiOutlineFlag />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title='รายชื่อนักเรียน'
              subheader='การเช็คชื่อตอนเช้า กิจกรรมหน้าเสาธง'
            />
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1
                cup of frozen peas along with the mussels, if you like.
              </Typography>
            </CardContent>
            <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
            <DataGrid
              disableColumnMenu
              autoHeight
              headerHeight={150}
              rows={teacher}
              columns={columns}
              pageSize={pageSize}
              disableSelectionOnClick
              rowsPerPageOptions={[10, 25, 50]}
              onCellEditCommit={(params) => handleUpdate(params)}
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
            onLoad={loading}
          />
        )}
      </Grid>
    </>
  );
};

export default StudentCheckIn;
