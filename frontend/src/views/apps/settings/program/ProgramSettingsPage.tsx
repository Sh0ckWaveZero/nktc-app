'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { type GridColDef } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import { AppSettingsDataGrid } from '@/@core/components/data-grid/AppListDataGrid';
import { SectionBox, SectionTitle, SectionDescription } from '@/@core/components/filter-panel';
import { AppFilterTextField, AppContainedButton } from '@/@core/components/form';
import { ToolButton, ToolButtonSlot, ToolDivider, ActiveToolButton } from '@/@core/components/toolbar';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';

import httpClient from '@/@core/utils/http';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Icon, { ColorIcon } from '@/@core/components/icon';
import { authConfig } from '@/configs/auth';
import {
  useCreateProgram,
  useDeleteProgram,
  useDepartments,
  useImportPrograms,
  useLevels,
  usePrograms,
  useUpdateProgram,
  type ProgramImportResult,
  type ProgramItem,
  type ProgramPayload,
} from '@/hooks/queries/useDepartments';

import ProgramDeleteDialog from '@/components/dialogs/ProgramDeleteDialog';
import ProgramFormDialog from './ProgramFormDialog';

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'active', label: 'เปิดใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
] as const;

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  if (typeof error?.message === 'string') {
    return error.message;
  }

  return fallback;
};

const isProgramActive = (status?: string | null) => status !== 'inactive';

const formatThaiDateTimeParts = (value?: string) => {
  if (!value) {
    return { date: '-', time: '' };
  }

  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date),
    time: new Intl.DateTimeFormat('th-TH', { timeStyle: 'short' }).format(date),
  };
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

const ProgramSettingsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [openForm, setOpenForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<ProgramItem | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ProgramImportResult | null>(null);
  const [isImportResultOpen, setIsImportResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: programs = [], isLoading } = usePrograms();
  const { data: departments = [] } = useDepartments();
  const { data: levels = [] } = useLevels();
  const { mutate: createProgram, isPending: isCreating } = useCreateProgram();
  const { mutate: updateProgram, isPending: isUpdating } = useUpdateProgram();
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram();
  const { mutate: importPrograms, isPending: isImporting } = useImportPrograms();

  const isSubmitting = isCreating || isUpdating;

  const filteredPrograms = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesSearch =
        !normalizedSearch ||
        program.name.toLowerCase().includes(normalizedSearch) ||
        program.programId.toLowerCase().includes(normalizedSearch) ||
        program.description?.toLowerCase().includes(normalizedSearch);

      const active = isProgramActive(program.status);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? active : !active);
      const matchesDepartment = departmentFilter === 'all' || program.departmentId === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [programs, searchText, statusFilter, departmentFilter]);

  const summary = useMemo(() => {
    return programs.reduce(
      (acc, program) => {
        const active = isProgramActive(program.status);

        acc.total += 1;
        acc.active += active ? 1 : 0;
        acc.inactive += active ? 0 : 1;
        acc.students += program._count.student;
        acc.classrooms += program._count.classroom;

        return acc;
      },
      { total: 0, active: 0, inactive: 0, students: 0, classrooms: 0 },
    );
  }, [programs]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingProgram(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (program: ProgramItem) => {
    setFormMode('edit');
    setEditingProgram(program);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) return;

    setOpenForm(false);
    setEditingProgram(null);
  };

  const handleSubmitForm = (payload: ProgramPayload) => {
    if (formMode === 'create') {
      createProgram(payload, {
        onSuccess: () => {
          toast.success(`เพิ่มสาขา ${payload.name} เรียบร้อยแล้ว`);
          setOpenForm(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถเพิ่มสาขาวิชาได้'));
        },
      });

      return;
    }

    if (!editingProgram?.id) return;

    updateProgram(
      { id: editingProgram.id, params: payload },
      {
        onSuccess: () => {
          toast.success(`อัปเดตสาขา ${payload.name} เรียบร้อยแล้ว`);
          setOpenForm(false);
          setEditingProgram(null);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถอัปเดตสาขาวิชาได้'));
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingProgram?.id) return;

    deleteProgram(deletingProgram.id, {
      onSuccess: () => {
        toast.success(`ลบสาขา ${deletingProgram.name} เรียบร้อยแล้ว`);
        setDeletingProgram(null);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'ไม่สามารถลบสาขาวิชาได้'));
      },
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const { data } = await httpClient.get(`${authConfig.programEndpoint}/download-template`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'program_template.xlsx';
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
    if (filteredPrograms.length === 0) {
      toast.warning('ไม่มีข้อมูลสาขาสำหรับ export');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        filteredPrograms.map((program) => ({
          รหัสสาขา: program.programId,
          ชื่อสาขา: program.name,
          รหัสแผนก: program.department?.departmentId ?? '',
          รหัสระดับ: program.level?.levelId ?? '',
          คำอธิบาย: program.description ?? '',
          สถานะ: isProgramActive(program.status) ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'สาขาวิชา');
      XLSX.writeFile(workbook, `programs_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถ export ข้อมูลสาขาได้'));
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

      importPrograms(
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
            toast.error(getErrorMessage(error, 'ไม่สามารถนำเข้าข้อมูลสาขาได้'));
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
      headerName: 'สาขาวิชา',
      flex: 0.32,
      minWidth: 320,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5, width: '100%' }}>
          <Typography
            variant='body2'
            sx={{
              fontWeight: 700,
              fontSize: '0.98rem',
              lineHeight: 1.45,
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
            }}
          >
            {row.name || '-'}
          </Typography>
          <Box
            component='span'
            sx={{
              display: 'inline-block',
              mt: 0.5,
              px: 0.75,
              py: 0.1,
              borderRadius: 1,
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              letterSpacing: '0.04em',
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
              color: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.9 : 0.75),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            {row.programId || '—'}
          </Box>
        </Box>
      ),
    },
    {
      field: 'relations',
      headerName: 'แผนก / ระดับ',
      flex: 0.19,
      minWidth: 190,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <ColorIcon icon='tabler:building' color='info' fontSize='0.9rem' />
            <Typography variant='body2'>{row.department?.name || 'ไม่ระบุแผนก'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <ColorIcon icon='tabler:school' color='primary' fontSize='0.85rem' opacity={0.65} />
            <Typography variant='caption' color='text.secondary'>
              {row.level?.levelName || 'ไม่ระบุระดับชั้น'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'usage',
      headerName: 'การใช้งาน',
      flex: 0.17,
      minWidth: 175,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <ColorIcon icon='tabler:users' color='success' fontSize='0.9rem' opacity={0.85} />
            <Typography variant='body2'>
              นักเรียน <strong>{row._count?.student ?? 0}</strong> คน
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ColorIcon icon='tabler:door' color='warning' fontSize='0.85rem' opacity={0.75} />
              <Typography variant='caption' color='text.secondary'>ห้อง {row._count?.classroom ?? 0}</Typography>
            </Box>
            <Typography variant='caption' color='text.disabled'>·</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ColorIcon icon='tabler:user-star' color='primary' fontSize='0.85rem' opacity={0.75} />
              <Typography variant='caption' color='text.secondary'>ครู {row._count?.teacher ?? 0}</Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      flex: 0.12,
      minWidth: 120,
      renderCell: ({ row }) => {
        const active = isProgramActive(row.status);

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
      flex: 0.14,
      minWidth: 165,
      renderCell: ({ row }) => {
        const formatted = formatThaiDateTimeParts(row.updatedAt);

        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, py: 0.5 }}>
            <Icon icon='tabler:calendar-event' fontSize='0.95rem' style={{ opacity: 0.45, flexShrink: 0, marginTop: 2 }} />
            <Box>
              <Typography variant='body2' color='text.secondary'>{formatted.date}</Typography>
              {formatted.time ? (
                <Typography variant='caption' color='text.secondary'>{formatted.time}</Typography>
              ) : null}
            </Box>
          </Box>
        );
      },
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
          (row._count?.student ?? 0) +
          (row._count?.classroom ?? 0) +
          (row._count?.teacher ?? 0) +
          (row._count?.course ?? 0) +
          (row._count?.levelClassroom ?? 0);

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title='แก้ไขสาขา'>
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

            <Tooltip title={linkedRecords > 0 ? 'ลบไม่ได้ เพราะยังมีข้อมูลใช้งานอยู่' : 'ลบสาขา'}>
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
                    setDeletingProgram(row);
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
              borderRadius: 6,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.985)} 18%, ${alpha(theme.palette.background.paper, 0.995)} 100%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.028)} 0%, ${alpha(theme.palette.background.paper, 0.992)} 16%, ${theme.palette.background.paper} 100%)`,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `0 22px 44px ${alpha(theme.palette.common.black, 0.24)}`
                  : `0 22px 44px ${alpha(theme.palette.primary.main, 0.05)}`,
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
                  <Icon icon='tabler:books' />
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
                    จัดการหลักสูตร / สาขาวิชา
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'text.secondary',
                      mt: 0.75
                    }}>
                    ดูแลรหัสสาขา ชื่อสาขา แผนก และระดับชั้นให้พร้อมใช้งานต่อกับห้องเรียนและข้อมูลนักเรียน
                  </Typography>
                </Box>
              }
            />

            <CardContent sx={{ px: { xs: 4, sm: 5, md: 6 }, pt: 2, pb: { xs: 4, sm: 5 } }}>
              <SectionBox sx={{ p: { xs: 3, sm: 3.5 }, mb: 4 }}>
                <Grid container spacing={3} sx={{ alignItems: 'flex-end' }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SectionTitle>ค้นหาและกรอง</SectionTitle>
                    <SectionDescription>
                      ค้นหาจากชื่อสาขา รหัสสาขา หรือกรองตามสถานะและแผนกก่อนจัดการรายการ
                    </SectionDescription>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: { xs: 'stretch', md: 'flex-end' },
                      }}
                    >
                      <Box
                        id='program-list-tools-surface'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'stretch',
                          overflow: 'hidden',
                          borderRadius: 14,
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
                          width: { xs: '100%', sm: 'auto' },
                          maxWidth: { xs: '100%', sm: 'none' },
                          justifyContent: 'stretch',
                        }}
                      >
                        <Tooltip title={isDownloadingTemplate ? 'กำลังดาวน์โหลด Template' : 'ดาวน์โหลด Template'}>
                          <ToolButtonSlot>
                            <ToolButton
                              id='download-program-template-button'
                              disabled={isDownloadingTemplate || isImporting || isExporting}
                              onClick={handleDownloadTemplate}
                            >
                              <Icon icon='tabler:file-download' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title={isExporting ? 'กำลัง Export ข้อมูล' : 'Export ข้อมูลสาขา'}>
                          <ToolButtonSlot>
                            <ToolButton
                              id='export-program-button'
                              disabled={isExporting || isImporting || isDownloadingTemplate || !filteredPrograms.length}
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
                              id='import-program-button'
                              disabled={isImporting || isDownloadingTemplate || isExporting}
                              onClick={handleImportClick}
                            >
                              <Icon icon='tabler:file-import' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title='เพิ่มสาขาวิชา'>
                          <ToolButtonSlot>
                            <ActiveToolButton id='add-program-button' onClick={handleOpenCreate}>
                              <Icon icon='tabler:plus' />
                            </ActiveToolButton>
                          </ToolButtonSlot>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <AppFilterTextField
                      fullWidth
                      label='ค้นหาสาขา'
                      placeholder='พิมพ์ชื่อสาขา รหัสสาขา หรือคำอธิบาย'
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3.5 }}>
                    <AppFilterTextField
                      select
                      fullWidth
                      label='แผนก'
                      value={departmentFilter}
                      onChange={(event) => setDepartmentFilter(event.target.value)}
                    >
                      <MenuItem value='all'>ทุกแผนก</MenuItem>
                      {departments.map((department) => (
                        <MenuItem key={department.id} value={department.id}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </AppFilterTextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3.5 }}>
                    <AppFilterTextField
                      select
                      fullWidth
                      label='สถานะ'
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </AppFilterTextField>
                  </Grid>
                </Grid>
              </SectionBox>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {(
                  [
                    { label: 'สาขาทั้งหมด', value: summary.total, hint: `${summary.active} เปิดใช้งาน`, icon: 'tabler:books', colorKey: 'primary' },
                    { label: 'ปิดใช้งาน', value: summary.inactive, hint: 'พักใช้งานชั่วคราว', icon: 'tabler:book-off', colorKey: 'warning' },
                    { label: 'นักเรียนที่ผูกอยู่', value: summary.students, hint: 'รวมทั้งระบบ', icon: 'tabler:users', colorKey: 'info' },
                    { label: 'ห้องเรียนที่ผูกอยู่', value: summary.classrooms, hint: 'พร้อมใช้งานต่อในระบบ', icon: 'tabler:door', colorKey: 'success' },
                  ] as Array<{ label: string; value: number; hint: string; icon: string; colorKey: 'primary' | 'warning' | 'info' | 'success' }>
                ).map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <SectionBox sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar
                          variant='rounded'
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            bgcolor: (theme) =>
                              alpha(theme.palette[item.colorKey].main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                            color: `${item.colorKey}.main`,
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
                    </SectionBox>
                  </Grid>
                ))}
              </Grid>

              <SectionBox sx={{ p: { xs: 2, sm: 2.5 } }}>
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
                    <SectionTitle>รายการสาขาวิชา</SectionTitle>
                    <SectionDescription>
                      แสดงผล {filteredPrograms.length} จาก {programs.length} รายการ
                    </SectionDescription>
                  </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <AppSettingsDataGrid
                    autoHeight
                    rows={filteredPrograms}
                    columns={columns}
                    loading={isLoading}
                    getRowHeight={() => 'auto'}
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
              </SectionBox>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ProgramFormDialog
        open={openForm}
        mode={formMode}
        initialData={editingProgram}
        departments={departments}
        levels={levels}
        isSubmitting={isSubmitting}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />
      <ProgramDeleteDialog
        open={Boolean(deletingProgram)}
        program={deletingProgram}
        isDeleting={isDeleting}
        onClose={() => setDeletingProgram(null)}
        onConfirm={handleDelete}
      />
      <Dialog open={isImportResultOpen} fullWidth maxWidth='sm' onClose={() => setIsImportResultOpen(false)}>
        <DialogTitle>ผลการนำเข้าข้อมูลสาขา</DialogTitle>
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
                  <Typography variant='caption' sx={{
                    color: 'text.secondary'
                  }}>
                    ทั้งหมด
                  </Typography>
                  <Typography variant='h6'>{importResult.total}</Typography>
                </Box>
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' sx={{
                    color: 'text.secondary'
                  }}>
                    สำเร็จ
                  </Typography>
                  <Typography variant='h6'>{importResult.imported}</Typography>
                </Box>
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' sx={{
                    color: 'text.secondary'
                  }}>
                    อัปเดต
                  </Typography>
                  <Typography variant='h6'>{importResult.updated}</Typography>
                </Box>
                <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant='caption' sx={{
                    color: 'text.secondary'
                  }}>
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

export default ProgramSettingsPage;
