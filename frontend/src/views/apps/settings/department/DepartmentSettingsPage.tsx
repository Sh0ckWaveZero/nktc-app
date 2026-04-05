'use client';

import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { alpha, styled } from '@mui/material/styles';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';

import httpClient from '@/@core/utils/http';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Icon from '@/@core/components/icon';
import { authConfig } from '@/configs/auth';
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useImportDepartments,
  useUpdateDepartment,
  type DepartmentImportResult,
  type DepartmentItem,
  type DepartmentPayload,
} from '@/hooks/queries/useDepartments';

import DepartmentDeleteDialog from './DepartmentDeleteDialog';
import DepartmentFormDialog from './DepartmentFormDialog';

const PANEL_RADIUS = 16;
const SECTION_RADIUS = 14;
const TOOLBAR_RADIUS = 14;
const CONTROL_RADIUS = 12;

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'active', label: 'เปิดใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
] as const;

const getPanelBorderColor = (theme: any) =>
  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1);
const getPanelShadowColor = (theme: any) =>
  theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.24) : alpha(theme.palette.primary.main, 0.05);
const getSurfaceBackground = (theme: any) =>
  theme.palette.mode === 'dark'
    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.985)} 18%, ${alpha(theme.palette.background.paper, 0.995)} 100%)`
    : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.028)} 0%, ${alpha(theme.palette.background.paper, 0.992)} 16%, ${theme.palette.background.paper} 100%)`;
const getSectionSurfaceBackground = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.76 : 0.9);
const getControlSurfaceColor = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.88);
const getToolbarSurfaceColor = (theme: any) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.04)
    : alpha(theme.palette.background.paper, 0.98);

const SectionSurface = styled(Box)(({ theme }) => ({
  borderRadius: SECTION_RADIUS,
  border: `1px solid ${getPanelBorderColor(theme)}`,
  backgroundColor: getSectionSurfaceBackground(theme),
  boxShadow:
    theme.palette.mode === 'dark'
      ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.03)}`
      : `0 10px 22px ${alpha(theme.palette.primary.main, 0.03)}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: 'clamp(0.92rem, 0.88rem + 0.14vw, 1rem)',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.88 : 0.82),
  '&::before': {
    content: '""',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.72 : 0.64),
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 0 0 6px ${alpha(theme.palette.primary.main, 0.08)}`
        : `0 0 0 5px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const SectionDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  maxWidth: '60ch',
  fontSize: 'clamp(0.94rem, 0.9rem + 0.16vw, 1rem)',
  fontWeight: 500,
  lineHeight: 1.6,
  color: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.8) : theme.palette.text.secondary,
}));

const ToolButton = styled(IconButton)(({ theme }) => ({
  width: '100%',
  minWidth: 54,
  height: 52,
  borderRadius: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  boxShadow: 'none',
  transition: 'background-color 180ms ease, color 180ms ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const ToolButtonSlot = styled(Box)({
  display: 'flex',
  flex: '1 1 0',
  minWidth: 0,
});

const ToolDivider = styled(Box)(({ theme }) => ({
  width: 1,
  alignSelf: 'stretch',
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.16),
}));

const ActiveToolButton = styled(ToolButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.12),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.16),
  },
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  '& .MuiDataGrid-row': {
    transition: 'background-color 180ms ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'normal',
    lineHeight: 'unset !important',
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.72),
  },
}));

const CONTROL_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${CONTROL_RADIUS}px`,
    backgroundColor: (theme: any) => getControlSurfaceColor(theme),
    '& fieldset': {
      borderColor: (theme: any) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.12),
    },
    '&:hover fieldset': {
      borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.28),
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputBase-input': {
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.92rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: '0.86rem',
  },
} as const;

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  if (typeof error?.message === 'string') {
    return error.message;
  }

  return fallback;
};

const isDepartmentActive = (status?: string | null) => status !== 'inactive';

const formatThaiDateTime = (value?: string) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        return;
      }

      const [, base64] = result.split(',');
      resolve(base64 || '');
    };

    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });

const DepartmentSettingsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [openForm, setOpenForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentItem | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<DepartmentImportResult | null>(null);
  const [isImportResultOpen, setIsImportResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: departments = [], isLoading } = useDepartments();
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { mutate: deleteDepartment, isPending: isDeleting } = useDeleteDepartment();
  const { mutate: importDepartments, isPending: isImporting } = useImportDepartments();

  const isSubmitting = isCreating || isUpdating;

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !normalizedSearch ||
        department.name.toLowerCase().includes(normalizedSearch) ||
        department.departmentId?.toLowerCase().includes(normalizedSearch) ||
        department.description?.toLowerCase().includes(normalizedSearch);

      const active = isDepartmentActive(department.status);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? active : !active);

      return matchesSearch && matchesStatus;
    });
  }, [departments, searchText, statusFilter]);

  const summary = useMemo(() => {
    return departments.reduce(
      (acc, department) => {
        const active = isDepartmentActive(department.status);

        acc.total += 1;
        acc.active += active ? 1 : 0;
        acc.inactive += active ? 0 : 1;
        acc.programs += department._count.program;
        acc.classrooms += department._count.classroom;

        return acc;
      },
      { total: 0, active: 0, inactive: 0, programs: 0, classrooms: 0 },
    );
  }, [departments]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingDepartment(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (department: DepartmentItem) => {
    setFormMode('edit');
    setEditingDepartment(department);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) return;

    setOpenForm(false);
    setEditingDepartment(null);
  };

  const handleSubmitForm = (payload: DepartmentPayload) => {
    if (formMode === 'create') {
      createDepartment(payload, {
        onSuccess: () => {
          toast.success(`เพิ่มแผนก ${payload.name} เรียบร้อยแล้ว`);
          setOpenForm(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถเพิ่มแผนกวิชาได้'));
        },
      });

      return;
    }

    if (!editingDepartment?.id) return;

    updateDepartment(
      { id: editingDepartment.id, params: payload },
      {
        onSuccess: () => {
          toast.success(`อัปเดตแผนก ${payload.name} เรียบร้อยแล้ว`);
          setOpenForm(false);
          setEditingDepartment(null);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถอัปเดตแผนกวิชาได้'));
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingDepartment?.id) return;

    deleteDepartment(deletingDepartment.id, {
      onSuccess: () => {
        toast.success(`ลบแผนก ${deletingDepartment.name} เรียบร้อยแล้ว`);
        setDeletingDepartment(null);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'ไม่สามารถลบแผนกวิชาได้'));
      },
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const { data } = await httpClient.get(`${authConfig.departmentEndpoint}/download-template`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'department_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถดาวน์โหลด template ได้'));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleExport = async () => {
    if (filteredDepartments.length === 0) {
      toast.warning('ไม่มีข้อมูลแผนกสำหรับ export');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        filteredDepartments.map((department) => ({
          รหัสแผนก: department.departmentId ?? '',
          ชื่อแผนก: department.name,
          คำอธิบาย: department.description ?? '',
          สถานะ: isDepartmentActive(department.status) ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'แผนกวิชา');
      XLSX.writeFile(workbook, `departments_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถ export ข้อมูลแผนกได้'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('รองรับเฉพาะไฟล์ .xlsx');
      return;
    }

    try {
      const file = await fileToBase64(selectedFile);

      importDepartments(
        { file },
        {
          onSuccess: (result) => {
            setImportResult(result);
            setIsImportResultOpen(true);

            if (result.failed > 0 || result.imported === 0) {
              toast.warning(result.message);
              return;
            }

            toast.success(result.message);
          },
          onError: (error) => {
            toast.error(getErrorMessage(error, 'ไม่สามารถนำเข้าข้อมูลแผนกได้'));
          },
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถอ่านไฟล์นำเข้าได้'));
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'แผนกวิชา',
      flex: 0.3,
      minWidth: 260,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5 }}>
          <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.98rem' }}>
            {row.name || '-'}
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25 }}>
            {row.departmentId || 'ยังไม่กำหนดรหัสแผนก'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'รายละเอียด',
      flex: 0.28,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {row.description || 'ยังไม่มีคำอธิบาย'}
        </Typography>
      ),
    },
    {
      field: 'usage',
      headerName: 'การใช้งาน',
      flex: 0.2,
      minWidth: 190,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5 }}>
          <Typography variant='body2'>สาขา {row._count?.program ?? 0} รายการ</Typography>
          <Typography variant='caption' color='text.secondary'>
            ห้องเรียน {row._count?.classroom ?? 0} • นักเรียน {row._count?.student ?? 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      flex: 0.12,
      minWidth: 120,
      renderCell: ({ row }) => {
        const active = isDepartmentActive(row.status);

        return (
          <Chip
            size='small'
            label={active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            color={active ? 'success' : 'default'}
            variant={active ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      field: 'updatedAt',
      headerName: 'อัปเดตล่าสุด',
      flex: 0.18,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Typography variant='body2' color='text.secondary'>
          {formatThaiDateTime(row.updatedAt)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'จัดการ',
      flex: 0.12,
      minWidth: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => {
        const linkedRecords =
          (row._count?.teacher ?? 0) +
          (row._count?.student ?? 0) +
          (row._count?.program ?? 0) +
          (row._count?.classroom ?? 0);

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title='แก้ไขแผนก'>
              <Button
                size='small'
                variant='text'
                color='primary'
                sx={{ minWidth: 0, p: 1 }}
                onClick={() => handleOpenEdit(row)}
              >
                <Icon icon='tabler:pencil' fontSize='1.1rem' />
              </Button>
            </Tooltip>

            <Tooltip title={linkedRecords > 0 ? 'ลบไม่ได้ เพราะยังมีข้อมูลใช้งานอยู่' : 'ลบแผนก'}>
              <span>
                <Button
                  size='small'
                  variant='text'
                  color='inherit'
                  sx={{
                    minWidth: 0,
                    p: 1,
                    color: 'text.secondary',
                    opacity: 1,
                    '&:hover':
                      linkedRecords > 0
                        ? { backgroundColor: 'transparent', color: 'text.secondary' }
                        : { color: 'error.main', backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08) },
                  }}
                  aria-disabled={linkedRecords > 0}
                  onClick={() => {
                    if (linkedRecords > 0) return;
                    setDeletingDepartment(row);
                  }}
                >
                  <Icon icon='tabler:trash' fontSize='1.1rem' />
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card
            sx={{
              borderRadius: `${PANEL_RADIUS}px`,
              border: (theme) => `1px solid ${getPanelBorderColor(theme)}`,
              background: (theme) => getSurfaceBackground(theme),
              boxShadow: (theme) => `0 22px 44px ${getPanelShadowColor(theme)}`,
            }}
          >
            <CardHeader
              sx={{
                px: { xs: 4, sm: 5, md: 6 },
                pt: { xs: 4, sm: 5 },
                pb: 2,
                alignItems: { xs: 'flex-start', md: 'center' },
                '& .MuiCardHeader-content': {
                  minWidth: 0,
                },
              }}
              avatar={
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                    color: 'primary.main',
                  }}
                >
                  <Icon icon='tabler:building-community' />
                </Avatar>
              }
              title={
                <Box>
                  <Typography
                    variant='h4'
                    sx={{
                      fontSize: { xs: 'clamp(1.8rem, 5vw, 2.2rem)', md: '2.3rem' },
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    จัดการแผนกวิชา
                  </Typography>
                  <Typography variant='body1' color='text.secondary' sx={{ mt: 0.75 }}>
                    ดูแลรหัส ชื่อ และสถานะของแผนกวิชาให้พร้อมใช้งานต่อกับสาขา ห้องเรียน และข้อมูลนักเรียน
                  </Typography>
                </Box>
              }
            />

            <CardContent sx={{ px: { xs: 4, sm: 5, md: 6 }, pt: 2, pb: { xs: 4, sm: 5 } }}>
              <SectionSurface sx={{ p: { xs: 3, sm: 3.5 }, mb: 4 }}>
                <Grid container spacing={3} alignItems='flex-end'>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SectionTitle>ค้นหาและกรอง</SectionTitle>
                    <SectionDescription>ค้นหาจากชื่อแผนก รหัสแผนก หรือกรองตามสถานะก่อนจัดการรายการ</SectionDescription>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: { xs: 'stretch', md: 'flex-end' },
                      }}
                    >
                      <Box
                        id='department-list-tools-surface'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'stretch',
                          overflow: 'hidden',
                          borderRadius: TOOLBAR_RADIUS,
                          bgcolor: (theme) => getToolbarSurfaceColor(theme),
                          border: (theme) =>
                            `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.18)}`,
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`
                              : `0 8px 20px ${alpha(theme.palette.primary.main, 0.06)}`,
                          width: { xs: '100%', sm: 'auto' },
                          maxWidth: { xs: '100%', sm: 'none' },
                          justifyContent: 'stretch',
                        }}
                      >
                        <Tooltip title={isDownloadingTemplate ? 'กำลังดาวน์โหลด Template' : 'ดาวน์โหลด Template'}>
                          <ToolButtonSlot>
                            <ToolButton
                              id='download-department-template-button'
                              disabled={isDownloadingTemplate || isImporting || isExporting}
                              onClick={handleDownloadTemplate}
                            >
                              <Icon icon='tabler:file-download' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title={isExporting ? 'กำลัง Export ข้อมูล' : 'Export ข้อมูลแผนก'}>
                          <ToolButtonSlot>
                            <ToolButton
                              id='export-department-button'
                              disabled={
                                isExporting || isImporting || isDownloadingTemplate || !filteredDepartments.length
                              }
                              onClick={handleExport}
                            >
                              <Icon icon='tabler:database-export' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title={isImporting ? 'กำลัง Import ไฟล์' : 'Import ไฟล์ XLSX'}>
                          <ToolButtonSlot>
                            <ToolButton
                              id='import-department-button'
                              disabled={isImporting || isDownloadingTemplate || isExporting}
                              onClick={handleImportClick}
                            >
                              <Icon icon='tabler:file-import' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title='เพิ่มแผนกวิชา'>
                          <ToolButtonSlot>
                            <ActiveToolButton id='add-department-button' onClick={handleOpenCreate}>
                              <Icon icon='tabler:plus' />
                            </ActiveToolButton>
                          </ToolButtonSlot>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      label='ค้นหาแผนก'
                      placeholder='พิมพ์ชื่อแผนก รหัสแผนก หรือคำอธิบาย'
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      sx={CONTROL_SX}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label='สถานะ'
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
                      sx={CONTROL_SX}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </SectionSurface>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  {
                    label: 'แผนกทั้งหมด',
                    value: summary.total,
                    hint: `${summary.active} เปิดใช้งาน`,
                    icon: 'tabler:building-community',
                  },
                  {
                    label: 'ปิดใช้งาน',
                    value: summary.inactive,
                    hint: 'รอตรวจสอบหรือพักใช้งาน',
                    icon: 'tabler:building-off',
                  },
                  {
                    label: 'สาขาที่ผูกอยู่',
                    value: summary.programs,
                    hint: 'รวมทั้งระบบ',
                    icon: 'tabler:school',
                  },
                  {
                    label: 'ห้องเรียนที่ผูกอยู่',
                    value: summary.classrooms,
                    hint: 'พร้อมใช้งานต่อในระบบ',
                    icon: 'tabler:door',
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <SectionSurface sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar
                          variant='rounded'
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                            color: 'primary.main',
                          }}
                        >
                          <Icon icon={item.icon} fontSize='1.2rem' />
                        </Avatar>
                        <Typography variant='body2' color='text.secondary'>
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                        {item.value}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {item.hint}
                      </Typography>
                    </SectionSurface>
                  </Grid>
                ))}
              </Grid>

              <SectionSurface sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box
                  sx={{
                    px: { xs: 1, sm: 1.5 },
                    pt: 0.5,
                    pb: 2.5,
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <SectionTitle>รายการแผนกวิชา</SectionTitle>
                    <SectionDescription>
                      แสดงผล {filteredDepartments.length} จาก {departments.length} รายการ
                    </SectionDescription>
                  </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <StyledDataGrid
                    autoHeight
                    rows={filteredDepartments}
                    columns={columns}
                    loading={isLoading}
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
                    pageSizeOptions={[10, 25, 50]}
                  />
                </Box>
              </SectionSurface>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DepartmentFormDialog
        open={openForm}
        mode={formMode}
        initialData={editingDepartment}
        isSubmitting={isSubmitting}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />

      <DepartmentDeleteDialog
        open={Boolean(deletingDepartment)}
        department={deletingDepartment}
        isDeleting={isDeleting}
        onClose={() => setDeletingDepartment(null)}
        onConfirm={handleDelete}
      />

      <Dialog open={isImportResultOpen} fullWidth maxWidth='sm' onClose={() => setIsImportResultOpen(false)}>
        <DialogTitle>ผลการนำเข้าข้อมูลแผนก</DialogTitle>
        <DialogContent>
          {importResult && (
            <>
              <Alert
                severity={importResult.failed > 0 || importResult.imported === 0 ? 'warning' : 'success'}
                sx={{ mb: 4 }}
              >
                <AlertTitle>
                  {importResult.failed > 0 || importResult.imported === 0 ? 'นำเข้าเสร็จบางส่วน' : 'นำเข้าสำเร็จ'}
                </AlertTitle>
                {importResult.message}
              </Alert>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' color='text.secondary'>
                    ทั้งหมด
                  </Typography>
                  <Typography variant='h6'>{importResult.total}</Typography>
                </Box>
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' color='text.secondary'>
                    สำเร็จ
                  </Typography>
                  <Typography variant='h6'>{importResult.imported}</Typography>
                </Box>
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' color='text.secondary'>
                    อัปเดต
                  </Typography>
                  <Typography variant='h6'>{importResult.updated}</Typography>
                </Box>
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' color='text.secondary'>
                    ไม่สำเร็จ
                  </Typography>
                  <Typography variant='h6'>{importResult.failed}</Typography>
                </Box>
              </Box>

              {importResult.errors.length > 0 && (
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 2 }}>
                    รายการที่นำเข้าไม่สำเร็จ
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 260,
                      overflowY: 'auto',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <List disablePadding dense>
                      {importResult.errors.map((error) => (
                        <ListItem key={`${error.row}-${error.message}`} divider>
                          <ListItemText primary={`แถว ${error.row}`} secondary={error.message} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
          <Button variant='contained' onClick={() => setIsImportResultOpen(false)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      <input ref={fileInputRef} hidden type='file' accept='.xlsx' onChange={handleImportFile} />
    </>
  );
};

export default DepartmentSettingsPage;
