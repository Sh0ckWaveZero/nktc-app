'use client';

import React, { useCallback, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Chip,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import IconifyIcon from '@/@core/components/icon';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/queries/useUser';
import type { AuditLog } from '@/types/apps/userTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CellType {
  row: AuditLog;
}

type KnownAction = 'CheckIn' | 'Login';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_MAP: Record<KnownAction, { label: string; icon: string; color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  Login: {
    label: 'เข้าสู่ระบบ',
    icon: 'material-symbols:login-rounded',
    color: 'primary',
  },
  CheckIn: {
    label: 'เช็คชื่อหน้าเสาธง',
    icon: 'material-symbols:check-circle-outline-rounded',
    color: 'success',
  },
};

const BROWSER_ICON: Record<string, string> = {
  Chrome: 'logos:chrome',
  Firefox: 'logos:firefox',
  Safari: 'logos:safari',
  Edge: 'logos:microsoft-edge',
};

const DEVICE_ICON: Record<string, string> = {
  Apple: 'logos:apple',
  Windows: 'logos:microsoft-windows',
  Android: 'logos:android-icon',
  Linux: 'logos:linux-tux',
};

// ─── Column Definitions ───────────────────────────────────────────────────────

const buildColumns = (): GridColDef<AuditLog>[] => [
  {
    flex: 0.18,
    field: 'action',
    minWidth: 170,
    headerName: 'ข้อมูลการใช้งาน',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    filterable: false,
    renderCell: ({ row }: CellType) => {
      const meta = ACTION_MAP[row.action as KnownAction];
      return meta ? (
        <Chip
          size='small'
          icon={<IconifyIcon icon={meta.icon} fontSize={14} />}
          label={meta.label}
          color={meta.color}
          variant='outlined'
        />
      ) : (
        <Typography variant='body2'>{row.action}</Typography>
      );
    },
  },
  {
    flex: 0.16,
    field: 'createdAt',
    minWidth: 140,
    headerName: 'วัน / เวลา',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    filterable: false,
    renderCell: ({ row }: CellType) => (
      <Typography variant='body2' color='text.secondary' noWrap>
        {new Date(row.createdAt).toLocaleString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>
    ),
  },
  {
    flex: 0.2,
    field: 'detail',
    minWidth: 160,
    headerName: 'รายละเอียด',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    filterable: false,
    renderCell: ({ row }: CellType) => (
      <Tooltip title={row.detail} placement='bottom-start' arrow>
        <Typography noWrap variant='body2' color='text.secondary'>
          {row.detail}
        </Typography>
      </Tooltip>
    ),
  },
  {
    flex: 0.15,
    field: 'ipAddr',
    minWidth: 130,
    headerName: 'IP Address',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    filterable: false,
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconifyIcon icon='material-symbols:lan-outline-rounded' fontSize={16} color='text.secondary' />
        <Typography variant='body2' fontFamily='monospace'>
          {row.ipAddr ?? '-'}
        </Typography>
      </Box>
    ),
  },
  {
    flex: 0.14,
    field: 'browser',
    minWidth: 120,
    headerName: 'เบราว์เซอร์',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    filterable: false,
    renderCell: ({ row }: CellType) => {
      const icon = BROWSER_ICON[row.browser] ?? 'material-symbols:public';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconifyIcon icon={icon} fontSize={18} />
          <Typography variant='body2'>{row.browser ?? '-'}</Typography>
        </Box>
      );
    },
  },
  {
    flex: 0.14,
    field: 'device',
    minWidth: 120,
    headerName: 'อุปกรณ์',
    editable: false,
    sortable: false,
    hideSortIcons: true,
    filterable: false,
    renderCell: ({ row }: CellType) => {
      const icon = DEVICE_ICON[row.device] ?? 'material-symbols:devices-outline';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconifyIcon icon={icon} fontSize={18} />
          <Typography variant='body2'>{row.device ?? '-'}</Typography>
        </Box>
      );
    },
  },
];

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

const TableSkeleton = () => (
  <Box sx={{ px: 4, pb: 4 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} variant='rectangular' height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
    ))}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HistoryPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useAuditLogs({
    userName: user?.username ?? '',
    skip: page * pageSize,
    take: pageSize,
  });

  const auditLogs = data?.data ?? [];
  const total = data?.total ?? 0;

  const fullName = [
    user?.account?.title,
    user?.account?.firstName,
    user?.account?.lastName,
  ]
    .filter(Boolean)
    .join('');

  const columns = buildColumns();

  const handlePaginationChange = useCallback(
    (model: { page: number; pageSize: number }) => {
      setPage(model.page);
      setPageSize(model.pageSize);
    },
    [],
  );

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                ประวัติการใช้งาน
                {fullName && (
                  <Typography component='span' variant='body2' color='text.secondary' sx={{ ml: 1 }}>
                    — {fullName}
                  </Typography>
                )}
              </Typography>
            }
            sx={{ pb: 0 }}
          />

          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataGrid
              columns={columns}
              rows={auditLogs}
              getRowId={(row) => row.id}
              autoHeight
              disableColumnMenu
              disableRowSelectionOnClick
              paginationMode='server'
              rowCount={total}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={handlePaginationChange}
              pageSizeOptions={[5, 10, 20, 50]}
              rowHeight={56}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'action.hover',
                },
                '& .MuiDataGrid-cell': {
                  alignItems: 'center',
                },
              }}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  );
};

export default HistoryPage;
