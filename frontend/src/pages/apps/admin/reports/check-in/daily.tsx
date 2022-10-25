// ** React Imports
import { useState, useEffect, MouseEvent, useCallback, ReactElement } from 'react';

// ** Next Import
import Link from 'next/link';
import { AccountOutline, ChartDonut, CogOutline, DeleteOutline, DotsVertical, EyeOutline, Laptop, PencilOutline } from 'mdi-material-ui';

// // ** MUI Imports
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import Menu from '@mui/material/Menu';
// import Grid from '@mui/material/Grid';
// import { DataGrid } from '@mui/x-data-grid';
// import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
// import IconButton from '@mui/material/IconButton';
// import Typography from '@mui/material/Typography';
// import CardHeader from '@mui/material/CardHeader';
// import InputLabel from '@mui/material/InputLabel';
// import FormControl from '@mui/material/FormControl';
// import CardContent from '@mui/material/CardContent';
// import Select, { SelectChangeEvent } from '@mui/material/Select';

// // ** Icons Imports
// import Laptop from 'mdi-material-ui/Laptop';
// import ChartDonut from 'mdi-material-ui/ChartDonut';
// import CogOutline from 'mdi-material-ui/CogOutline';
// import EyeOutline from 'mdi-material-ui/EyeOutline';
// import DotsVertical from 'mdi-material-ui/DotsVertical';
// import PencilOutline from 'mdi-material-ui/PencilOutline';
// import DeleteOutline from 'mdi-material-ui/DeleteOutline';
// import AccountOutline from 'mdi-material-ui/AccountOutline';

// ** Custom Components Imports
import CustomChip from '@/@core/components/mui/chip';
import CustomAvatar from '@/@core/components/mui/avatar';

// // ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';

// ** Types Imports
import { ThemeColor } from '@/@core/layouts/types';
import TableHeader from '@/views/apps/admin/reports/check-in/TableHeader';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { Avatar, Box, Card, CardHeader, Grid, IconButton, Menu, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import { BsCalendar2Date } from 'react-icons/bs';
import { DataGrid } from '@mui/x-data-grid';
// import { BsCalendar2Date } from 'react-icons/bs';

// ** Custom Components Imports
// import TableHeader from '@/views/apps/user/list/TableHeader'
// import AddUserDrawer from '@/views/apps/user/list/AddUserDrawer'

interface UserRoleType {
  [key: string]: ReactElement;
}

interface UserStatusType {
  [key: string]: ThemeColor;
}

// ** Vars
const userRoleObj: UserRoleType = {
  admin: <Laptop fontSize='small' sx={{ mr: 3, color: 'error.main' }} />,
  author: <CogOutline fontSize='small' sx={{ mr: 3, color: 'warning.main' }} />,
  editor: <PencilOutline fontSize='small' sx={{ mr: 3, color: 'info.main' }} />,
  maintainer: <ChartDonut fontSize='small' sx={{ mr: 3, color: 'success.main' }} />,
  subscriber: <AccountOutline fontSize='small' sx={{ mr: 3, color: 'primary.main' }} />,
};

interface CellType {
  row: any;
}

const userStatusObj: UserStatusType = {
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
          {getInitials(row.fullName ? row.fullName : 'John Doe')}
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
              <EyeOutline fontSize='small' sx={{ mr: 2 }} />
              View
            </MenuItemLink>
          </Link>
        </MenuItem>
        <MenuItem onClick={handleRowOptionsClose}>
          <PencilOutline fontSize='small' sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteOutline fontSize='small' sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

const columns = [
  {
    flex: 0.2,
    minWidth: 230,
    field: 'fullName',
    headerName: 'User',
    renderCell: ({ row }: CellType) => {
      const { id, fullName, username } = row;

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
                {fullName}
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
    minWidth: 250,
    field: 'email',
    headerName: 'Email',
    renderCell: ({ row }: CellType) => {
      return (
        <Typography noWrap variant='body2'>
          {row.email}
        </Typography>
      );
    },
  },
  {
    flex: 0.15,
    field: 'role',
    minWidth: 150,
    headerName: 'Role',
    renderCell: ({ row }: CellType) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userRoleObj[row.role]}
          <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {row.role}
          </Typography>
        </Box>
      );
    },
  },
  {
    flex: 0.15,
    minWidth: 120,
    headerName: 'Plan',
    field: 'currentPlan',
    renderCell: ({ row }: CellType) => {
      return (
        <Typography noWrap sx={{ textTransform: 'capitalize' }}>
          {row.currentPlan}
        </Typography>
      );
    },
  },
  {
    flex: 0.1,
    minWidth: 110,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }: CellType) => {
      return (
        <CustomChip
          skin='light'
          size='small'
          label={row.status}
          color={userStatusObj[row.status]}
          sx={{ textTransform: 'capitalize' }}
        />
      );
    },
  },
  {
    flex: 0.1,
    minWidth: 90,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions id={row.id} />,
  },
];

const UserList = () => {
  // ** State
  const [role, setRole] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);

  // ** Hooks

  useEffect(() => {}, []);

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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <BsCalendar2Date />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`รายงานสถิติการมาเรียนของนักเรียน`}
            subheader={`ประจำ${new Date().toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddUserDrawer} selectedDate={new Date()} />
          <DataGrid
            autoHeight
            rows={[]}
            columns={columns}
            checkboxSelection
            pageSize={pageSize}
            disableSelectionOnClick
            rowsPerPageOptions={[10, 25, 50]}
            onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
          />
        </Card>
      </Grid>

      {/* <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} /> */}
    </Grid>
  );
};

export default UserList;
