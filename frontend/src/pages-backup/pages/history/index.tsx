import { Avatar, Card, CardHeader, Grid, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColumns } from '@mui/x-data-grid';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { Fragment, useCallback, useEffect, useState } from 'react';
import IconifyIcon from '@/@core/components/icon';
import { LocalStorageService } from '@/services/localStorageService';
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUserStore } from '@/store/index';
import { shallow } from 'zustand/shallow';

interface CellType {
  row: any;
}

type Action = 'CheckIn' | 'Login';

const ACTIONS: Record<Action, string> = {
  CheckIn: 'เช็คชื่อหน้าเสาธง',
  Login: 'เข้าสู่ระบบ',
};

const localStorageService = new LocalStorageService();
const accessToken = localStorageService.getToken()!;

const HistoryPage = () => {
  const { user } = useAuth();
  const { fetchAuditLogs } = useUserStore(
    (state: any) => ({
      fetchAuditLogs: state.fetchAuditLogs,
    }),
    shallow,
  );

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const fullName = `${user?.account?.title && user.account.title + user?.account?.firstName} ${
    user?.account?.lastName
  }`;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, total } = await fetchAuditLogs(accessToken, {
        skip: page === 0 ? 0 : page * pageSize,
        take: pageSize,
        userName: user?.username,
      });
      setAuditLogs(data || []);
      setTotal(total || 0);
      setLoading(false);
    };
    fetch();

    return () => {
      setAuditLogs([]);
    };
  }, [page, pageSize]);

  const onHandleChangePage = useCallback((newPage: any) => {
    setPageSize(newPage);
  }, []);

  const defaultColumns: GridColumns = [
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
    <Fragment>
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
              autoHeight
              columns={defaultColumns}
              rows={auditLogs}
              loading={loading}
              disableColumnMenu
              pagination
              paginationMode='server'
              pageSize={pageSize}
              rowCount={total}
              onPageChange={(params: any) => setPage(params)}
              rowsPerPageOptions={[5, 10, 20, 50]}
              onPageSizeChange={(newPageSize: number) => onHandleChangePage(newPageSize)}
              components={{
                NoRowsOverlay: CustomNoRowsOverlay,
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

HistoryPage.acl = {
  action: 'read',
  subject: 'history-page',
};

export default HistoryPage;
