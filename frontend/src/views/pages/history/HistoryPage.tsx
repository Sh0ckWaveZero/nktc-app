'use client';

import { Avatar, Card, CardHeader, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import React, { useCallback, useState } from 'react';
import IconifyIcon from '@/@core/components/icon';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/queries/useUser';

interface CellType {
  row: any;
}

type Action = 'CheckIn' | 'Login';

const ACTIONS: Record<Action, string> = {
  CheckIn: 'เช็คชื่อหน้าเสาธง',
  Login: 'เข้าสู่ระบบ',
};


const HistoryPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch audit logs using React Query
  const { data, isLoading } = useAuditLogs({
    userName: user?.username || '',
    skip: page * pageSize,
    take: pageSize,
  });

  const auditLogs = data?.data || [];
  const total = data?.total || 0;

  const fullName = `${user?.account?.title && user.account.title + user?.account?.firstName} ${
    user?.account?.lastName
  }`;

  const onHandleChangePage = useCallback((newPage: number) => {
    setPageSize(newPage);
  }, []);

  const defaultColumns: GridColDef[] = [
    {
      flex: 0.1,
      field: 'action',
      minWidth: 100,
      headerName: 'ข้อมูลการใช้งาน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { action } = row;
        const actionDescription: string = ACTIONS[action as Action] ?? action;
        return (
          <Typography noWrap variant='body2'>
            {actionDescription}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      field: 'createdAt',
      minWidth: 100,
      headerName: 'วัน/เวลา',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { createdAt } = row;
        return (
          <Typography noWrap variant='body2'>
            {new Date(createdAt).toLocaleString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      field: 'detail',
      minWidth: 100,
      headerName: 'รายละเอียด',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { detail } = row;
        return (
          <Tooltip title={detail} placement='bottom-start' arrow>
            <Typography noWrap variant='body2'>
              {detail}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.1,
      field: 'ipAddr',
      minWidth: 100,
      headerName: 'ไอพี่ แอดเดรส',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { ipAddr } = row;
        return (
          <Typography noWrap variant='body2'>
            {ipAddr}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      field: 'browser',
      minWidth: 100,
      headerName: 'เบราว์เซอร์',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { browser } = row;
        return (
          <Typography noWrap variant='body2'>
            {browser}
          </Typography>
        );
      },
    },
    {
      flex: 0.1,
      field: 'device',
      minWidth: 100,
      headerName: 'ชื่อ อุปกรณ์',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ row }: CellType) => {
        const { device } = row;
        return (
          <Typography noWrap variant='body2'>
            {device}
          </Typography>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <IconifyIcon icon='material-symbols:work-history-outline' />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`ข้อมูลการเข้าใช้งาน ${fullName}`}
            />

            <DataGrid
              columns={defaultColumns}
              rows={auditLogs}
              loading={isLoading}
              disableColumnMenu
              paginationMode='server'
              rowCount={total}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                onHandleChangePage(model.pageSize);
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: pageSize, page: page },
                },
              }}
              pageSizeOptions={[5, 10, 20, 50]}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              sx={{
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default HistoryPage;
