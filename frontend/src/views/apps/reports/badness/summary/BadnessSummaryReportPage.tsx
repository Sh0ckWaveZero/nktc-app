'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CloseIcon from '@mui/icons-material/Close';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import IconifyIcon from '@/@core/components/icon';
import TimelineBadness from '@/views/apps/student/view/TimelineBadness';
import { badnessIndividualStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import ConfirmDialog, { type ConfirmDialogOptions } from '@/@core/components/dialogs/ConfirmDialog';
import { SectionBox } from '@/@core/components/filter-panel';
import { ToolButton, ToolButtonSlot } from '@/@core/components/toolbar';
import { alpha } from '@mui/material/styles';

interface CellType {
  row: any;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const TOOLBAR_RADIUS = 14;

const BadnessSummaryReportPage = () => {
  // ** Hooks
  const { user }: any = useAuth();
  const ability = useContext(AbilityContext);
  const isAdmin = user?.role === 'Admin';

  const { deleteBadnessIndividualById, resetAllBadnessRecords, summary }: any = badnessIndividualStore(
    (state: any) => ({
      summary: state.summary,
      deleteBadnessIndividualById: state.deleteBadnessIndividualById,
      resetAllBadnessRecords: state.resetAllBadnessRecords,
    }),
    shallow,
  );

  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [total, setTotal] = useState(0);
  const [info, setInfo] = useState<any>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openResetConfirm, setOpenResetConfirm] = useState(false);
  const [badnessId, setBadnessId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isResettingAll, setIsResettingAll] = useState(false);

  const searchWithParams = useCallback(
    async (params: any) => {
      try {
        setLoading(true);
        const response = await summary({ ...params });

        const records: any[] = response?.records ?? [];

        // Group by studentId and sum badnessScore
        const grouped: Record<string, any> = {};
        for (const r of records) {
          const sid = r.studentId;
          if (!grouped[sid]) {
            const { title, firstName, lastName } = r.student?.user?.account ?? {};
            grouped[sid] = {
              id: r.studentKey,
              studentId: sid,
              title: title ?? '',
              firstName: `${title ?? ''}${firstName ?? ''} ${lastName ?? ''}`.trim(),
              name: r.student?.classroom?.name ?? '',
              badnessScore: 0,
              info: [],
            };
          }
          grouped[sid].badnessScore += r.badnessScore ?? 0;
          grouped[sid].info.push({
            id: r.id,
            badnessDetail: r.badnessDetail,
            badnessScore: r.badnessScore,
            badDate: r.badDate,
            image: r.image,
          });
        }

        // Sort by badnessScore desc
        const sorted = Object.values(grouped).sort((a, b) => b.badnessScore - a.badnessScore);

        // Pagination slice
        const { skip, take } = params;
        const page = sorted.slice(skip, skip + take);

        // Assign running number
        const withRunningNumber = page.map((item, idx) => ({
          ...item,
          runningNumber: skip + idx + 1,
        }));

        setData(withRunningNumber);
        setTotal(Object.keys(grouped).length);
        setLoading(false);
      } catch (error: any) {
        toast.error(error?.message);
        setLoading(false);
      }
    },
    [summary],
  );

  useEffect(() => {
    const skip = paginationModel.page === 0 ? 0 : paginationModel.page * paginationModel.pageSize;
    const take = paginationModel.pageSize;
    searchWithParams({ skip, take });
  }, [paginationModel.page, paginationModel.pageSize, refreshTrigger, searchWithParams]);

  const handleClickOpen = (info: any) => {
    setOpen(true);
    setInfo(info);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onDeletedBadness = (id: string): void => {
    handleClose();
    setOpenConfirm(true);
    setBadnessId(id);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenResetConfirm = () => {
    if (!isAdmin) {
      return;
    }

    setOpenResetConfirm(true);
  };

  const handleCloseResetConfirm = () => {
    if (!isResettingAll) {
      setOpenResetConfirm(false);
    }
  };

  const handleConfirm = () => {
    const toastId = toast.info('กำลังบันทึกลบข้อมูลความประพฤติ...', {
      autoClose: false,
      hideProgressBar: true,
    });
    deleteBadnessIndividualById(badnessId).then((res: any) => {
      if (res?.status === 204) {
        setRefreshTrigger((prev: number) => prev + 1);
        toast.dismiss(toastId);
        toast.success('ลบข้อมูลความประพฤติสำเร็จ');
      } else {
        toast.dismiss(toastId);
        toast.error(res?.response?.data.error || 'เกิดข้อผิดพลาด');
      }
    });
    setOpenConfirm(false);
  };

  const handleResetAllConfirm = async () => {
    setIsResettingAll(true);

    const toastId = toast.info('กำลังรีเซตข้อมูลความประพฤติทั้งหมด...', {
      autoClose: false,
      hideProgressBar: true,
    });

    try {
      const res = await resetAllBadnessRecords();

      if (res?.status === 200) {
        setRefreshTrigger((prev: number) => prev + 1);
        toast.dismiss(toastId);
        toast.success(`รีเซตข้อมูลความประพฤติทั้งหมดสำเร็จ (${res.data?.deleted ?? 0} รายการ)`);
        setOpenResetConfirm(false);
      } else {
        toast.dismiss(toastId);
        toast.error(res?.response?.data?.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error?.response?.data?.error || error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsResettingAll(false);
    }
  };

  const resetConfirmOptions = useMemo<ConfirmDialogOptions>(
    () => ({
      title: 'ยืนยันการรีเซตข้อมูลความประพฤติทั้งหมด',
      message: 'ระบบจะล้างบันทึกความประพฤติทั้งหมดในหน้าสรุปนี้ และไม่สามารถกู้คืนข้อมูลที่ลบไปแล้วได้',
      severity: 'warning',
      confirmText: 'รีเซตทั้งหมด',
      cancelText: 'ยกเลิก',
      showWarning: true,
      warningMessage: 'การดำเนินการนี้จะลบข้อมูลบันทึกความประพฤติทั้งหมดทั้งระบบ ไม่ใช่เฉพาะรายการในหน้าปัจจุบัน',
    }),
    [],
  );

  const columns: GridColDef[] = [
    {
      flex: 0.05,
      minWidth: 60,
      field: 'runningNumber',
      headerName: 'ลำดับ',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'right',
      renderCell: ({ row }: CellType) => {
        const { runningNumber } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {runningNumber}
          </Typography>
        );
      },
    },
    {
      flex: 0.13,
      minWidth: 160,
      field: 'studentId',
      headerName: 'รหัสนักเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { studentId } = row;
        return (
          <Typography
            noWrap
            variant='subtitle2'
            sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
          >
            {studentId}
          </Typography>
        );
      },
    },
    {
      flex: 0.17,
      minWidth: 150,
      field: 'firstName',
      headerName: 'ชื่อ-นามสกุล',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { firstName } = row;
        return (
          <Tooltip title={firstName ?? ''} arrow>
            <span>
              <Typography
                noWrap
                variant='subtitle2'
                sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}
              >
                {firstName}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'name',
      headerName: 'ชั้นเรียน',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      renderCell: ({ row }: CellType) => {
        const { name } = row;
        return (
          <Tooltip title={name} arrow>
            <span>
              <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                {name}
              </Typography>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 160,
      field: 'detail',
      headerName: 'รายละเอียด',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { info } = row;
        return (
          <Tooltip title={'รายละเอียด'} arrow>
            <span>
              <Button
                aria-label='more'
                aria-controls='long-menu'
                aria-haspopup='true'
                onClick={() => handleClickOpen(info)}
                variant='contained'
                startIcon={<IconifyIcon icon={'mdi:timeline-check-outline'} width={20} height={20} />}
                size='medium'
                color='error'
                sx={{ color: 'text.secondary' }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
                  รายละเอียด
                </Typography>
              </Button>
            </span>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.1,
      minWidth: 80,
      field: 'score',
      headerName: 'คะแนนรวม',
      editable: false,
      sortable: false,
      hideSortIcons: true,
      align: 'center',
      renderCell: ({ row }: CellType) => {
        const { badnessScore } = row;
        return (
          <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
            {badnessScore}
          </Typography>
        );
      },
    },
  ];

  return (
    ability?.can('read', 'student-badness-summary-report') && (
      <React.Fragment>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                    <IconifyIcon icon={'icon-park-outline:bad-two'} />
                  </Avatar>
                }
                sx={{ color: 'text.primary' }}
                title={`เรียงลำดับ คะแนนตามความประพฤติ`}
              />
              {isAdmin && (
                <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
                  <SectionBox id='badness-summary-toolbar-surface'>
                    <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
                      <Box
                        id='badness-summary-tools-surface'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'stretch',
                          overflow: 'hidden',
                          borderRadius: TOOLBAR_RADIUS,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.04)
                              : alpha(theme.palette.background.paper, 0.98),
                          border: (theme) =>
                            `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.18)}`,
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`
                              : `0 8px 20px ${alpha(theme.palette.primary.main, 0.06)}`,
                        }}
                      >
                        <Tooltip
                          title={
                            isResettingAll
                              ? 'กำลังรีเซตข้อมูลความประพฤติ...'
                              : total === 0
                                ? 'ไม่มีข้อมูลสำหรับรีเซต'
                                : 'รีเซตข้อมูลความประพฤติทั้งหมด'
                          }
                        >
                          <ToolButtonSlot>
                            <ToolButton
                              id='reset-all-badness-summary-button'
                              size='small'
                              disabled={isResettingAll || total === 0}
                              onClick={handleOpenResetConfirm}
                            >
                              <IconifyIcon icon='mdi:restore-alert' width={18} />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </SectionBox>
                </Box>
              )}
              <DataGrid
                columns={columns}
                rows={data ?? []}
                disableColumnMenu
                loading={loading}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
                paginationMode='server'
                initialState={{
                  pagination: {
                    paginationModel: paginationModel,
                  },
                }}
                pageSizeOptions={[10, 20, 50, 100]}
                onPaginationModelChange={setPaginationModel}
                rowCount={total}
                getRowHeight={() => 'auto'}
                sx={{
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    maxHeight: 'none !important',
                  },
                  '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 'unset !important',
                    maxHeight: 'none !important',
                    overflow: 'visible',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                  },
                  '& .MuiDataGrid-renderingZone': {
                    maxHeight: 'none !important',
                  },
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <BootstrapDialog fullWidth maxWidth='xs' onClose={handleClose} aria-labelledby='คะแนนตามความพฤติ' open={open}>
          {handleClose ? (
            <IconButton
              aria-label='close'
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
          <TimelineBadness info={info} user={user} onDeleted={onDeletedBadness} />
        </BootstrapDialog>
        <BootstrapDialog
          fullWidth
          maxWidth='xs'
          onClose={handleCloseConfirm}
          aria-labelledby='ยืนยันการลบบันทึกความประพฤติ'
          open={openConfirm}
        >
          {handleCloseConfirm ? (
            <IconButton
              aria-label='close'
              onClick={handleCloseConfirm}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
          <DialogTitle id='alert-dialog-title-goodness'>ยืนยันการลบบันทึกความประพฤติ</DialogTitle>
          <DialogContent>
            <DialogContentText
              id='alert-delete-badness'
              sx={{
                p: 5,
              }}
            >
              {`คุณต้องการลบข้อมูลการการบันทึกความประพฤตินี้ ใช่หรือไม่?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-badness-dense'>
            <Button color='secondary' onClick={handleCloseConfirm}>
              ยกเลิก
            </Button>
            <Button variant='contained' color='error' onClick={handleConfirm}>
              ยืนยัน
            </Button>
          </DialogActions>
        </BootstrapDialog>
        {isAdmin && (
          <ConfirmDialog
            open={openResetConfirm}
            options={resetConfirmOptions}
            onClose={handleCloseResetConfirm}
            onConfirm={handleResetAllConfirm}
            isConfirming={isResettingAll}
          />
        )}
      </React.Fragment>
    )
  );
};

export default BadnessSummaryReportPage;
