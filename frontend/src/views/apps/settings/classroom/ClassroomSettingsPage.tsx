'use client';

import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DeleteOutline, DotsVertical, Plus } from 'mdi-material-ui';
import React, { Fragment, MouseEvent, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { toast } from 'react-toastify';

interface RowOptionsType {
  row: any;
  handleDelete: (data: any) => void;
}

const RowOptions = ({ row, handleDelete }: RowOptionsType) => {
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
        slotProps={{
          paper: { sx: { minWidth: '8rem' } },
        }}
      >
        <MenuItem onClick={handleDeleteRow}>
          <DeleteOutline fontSize='small' sx={{ mr: 2, color: 'error.main' }} />
          ลบ
        </MenuItem>
      </Menu>
    </>
  );
};

const ClassroomSettingsPage = () => {
  const [classrooms, setClassrooms] = useState([
    { id: 1, name: 'ปวช.1/1', program: 'ปวช.', level: '1', section: '1', studentCount: 30, status: 'active' },
    { id: 2, name: 'ปวช.1/2', program: 'ปวช.', level: '1', section: '2', studentCount: 28, status: 'active' },
    { id: 3, name: 'ปวช.2/1', program: 'ปวช.', level: '2', section: '1', studentCount: 25, status: 'active' },
    { id: 4, name: 'ปวส.1/1', program: 'ปวส.', level: '1', section: '1', studentCount: 20, status: 'active' },
  ]);

  const handleDelete = (data: any) => {
    setClassrooms(classrooms.filter((classroom) => classroom.id !== data.id));
    toast.success(`ลบชั้นเรียน ${data.name} เรียบร้อยแล้ว`);
  };

  const handleAddClassroom = () => {
    toast.success('เปิดหน้าต่างเพิ่มชั้นเรียนใหม่');
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'ชื่อชั้นเรียน',
      flex: 0.2,
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: 'program',
      headerName: 'หลักสูตร',
      flex: 0.15,
      minWidth: 100,
    },
    {
      field: 'level',
      headerName: 'ระดับชั้น',
      flex: 0.1,
      minWidth: 80,
    },
    {
      field: 'section',
      headerName: 'ห้อง',
      flex: 0.1,
      minWidth: 80,
    },
    {
      field: 'studentCount',
      headerName: 'จำนวนนักเรียน',
      flex: 0.15,
      minWidth: 120,
      renderCell: ({ row }) => <Typography variant='body2'>{row.studentCount} คน</Typography>,
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      flex: 0.15,
      minWidth: 100,
      renderCell: ({ row }) => (
        <Chip
          label={row.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
          color={row.status === 'active' ? 'success' : 'default'}
          size='small'
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'จัดการ',
      flex: 0.15,
      minWidth: 100,
      sortable: false,
      renderCell: ({ row }) => <RowOptions row={row} handleDelete={handleDelete} />,
    },
  ];

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardHeader
              title='การจัดการชั้นเรียน'
              action={
                <Button variant='contained' startIcon={<Plus />} onClick={handleAddClassroom}>
                  เพิ่มชั้นเรียน
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={classrooms}
                  columns={columns}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  hideFooterSelectedRowCount
                  slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                  }}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  sx={{
                    '& .MuiDataGrid-row': {
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default ClassroomSettingsPage;
