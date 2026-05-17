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
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { type GridColDef } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import { AppSettingsDataGrid } from '@/@core/components/data-grid/AppListDataGrid';
import { SectionBox, SectionTitle, SectionDescription } from '@/@core/components/filter-panel';
import { AppFilterTextField, AppContainedButton } from '@/@core/components/form';
import { ToolButton, ToolButtonSlot, ToolDivider, ActiveToolButton } from '@/@core/components/toolbar';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';

import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import Icon from '@/@core/components/icon';
import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import {
  useClassrooms,
  useCreateClassroom,
  useDeleteClassroom,
  useImportClassrooms,
  useUpdateClassroom,
  type ClassroomImportResult,
  type ClassroomItem,
  type ClassroomPayload,
} from '@/hooks/queries/useClassrooms';
import { useDepartments, useLevels, usePrograms } from '@/hooks/queries/useDepartments';
import { usePromoteStudents, usePromotePreview } from '@/hooks/queries/useStudents';

import ClassroomDeleteDialog from '@/components/dialogs/ClassroomDeleteDialog';
import ClassroomFormDialog from './ClassroomFormDialog';
import ClassroomPromotionDialog from './ClassroomPromotionDialog';

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

const isClassroomActive = (status?: string | null) => status !== 'inactive';

const THAI_DATE_FORMAT = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' });
const THAI_TIME_FORMAT = new Intl.DateTimeFormat('th-TH', { timeStyle: 'short' });

const formatThaiDateTimeParts = (value?: string) => {
  if (!value) {
    return { date: '-', time: '' };
  }

  const date = new Date(value);

  return {
    date: THAI_DATE_FORMAT.format(date),
    time: THAI_TIME_FORMAT.format(date),
  };
};

const getLinkedRecords = (classroom: ClassroomItem) =>
  (classroom._count?.student ?? 0) +
  (classroom._count?.teachers ?? 0) +
  (classroom._count?.course ?? 0) +
  (classroom._count?.reportCheckIn ?? 0) +
  (classroom._count?.activityCheckInReport ?? 0) +
  (classroom._count?.levelClassrooms ?? 0);

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

const ClassroomSettingsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [openForm, setOpenForm] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<ClassroomItem | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<ClassroomItem | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ClassroomImportResult | null>(null);
  const [isImportResultOpen, setIsImportResultOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: classrooms = [], isLoading } = useClassrooms();
  const { data: departments = [] } = useDepartments();
  const { data: programs = [] } = usePrograms();
  const { data: levels = [] } = useLevels();
  const { mutate: createClassroom, isPending: isCreating } = useCreateClassroom();
  const { mutate: updateClassroom, isPending: isUpdating } = useUpdateClassroom();
  const { mutate: deleteClassroom, isPending: isDeleting } = useDeleteClassroom();
  const { mutate: importClassrooms, isPending: isImporting } = useImportClassrooms();
  const { mutate: promoteStudents, isPending: isPromoting } = usePromoteStudents();

  const [openPromote, setOpenPromote] = useState(false);
  const [promoteSource, setPromoteSource] = useState<ClassroomItem | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<ClassroomItem | null>(null);

  const { data: promotePreview, isFetching: isLoadingPreview } = usePromotePreview(promoteSource?.id ?? '');

  const isSubmitting = isCreating || isUpdating;

  const availablePrograms = useMemo(() => {
    if (departmentFilter === 'all') {
      return programs;
    }

    return programs.filter((program) => !program.departmentId || program.departmentId === departmentFilter);
  }, [departmentFilter, programs]);

  const filteredClassrooms = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return classrooms.filter((classroom) => {
      const matchesSearch =
        !normalizedSearch ||
        classroom.name.toLowerCase().includes(normalizedSearch) ||
        classroom.classroomId.toLowerCase().includes(normalizedSearch) ||
        classroom.description?.toLowerCase().includes(normalizedSearch) ||
        classroom.department?.name?.toLowerCase().includes(normalizedSearch) ||
        classroom.program?.name?.toLowerCase().includes(normalizedSearch) ||
        classroom.level?.levelName?.toLowerCase().includes(normalizedSearch);

      const active = isClassroomActive(classroom.status);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? active : !active);
      const matchesDepartment = departmentFilter === 'all' || classroom.departmentId === departmentFilter;
      const matchesProgram =
        programFilter === 'all' ||
        classroom.programId === programFilter ||
        classroom.levelClassrooms?.some((lc) => lc.programId === programFilter) === true;
      const matchesLevel =
        levelFilter === 'all' ||
        classroom.levelId === levelFilter ||
        classroom.levelClassrooms?.some((lc) => lc.levelId === levelFilter) === true;

      return matchesSearch && matchesStatus && matchesDepartment && matchesProgram && matchesLevel;
    });
  }, [classrooms, departmentFilter, levelFilter, programFilter, searchText, statusFilter]);

  const summary = useMemo(() => {
    return classrooms.reduce(
      (acc, classroom) => {
        const active = isClassroomActive(classroom.status);

        acc.total += 1;
        acc.active += active ? 1 : 0;
        acc.inactive += active ? 0 : 1;
        acc.students += classroom._count.student;
        acc.teachers += classroom._count.teachers;

        return acc;
      },
      { total: 0, active: 0, inactive: 0, students: 0, teachers: 0 },
    );
  }, [classrooms]);

  const handleOpenPromote = () => {
    setPromoteSource(null);
    setPromoteTarget(null);
    setOpenPromote(true);
  };

  const handleConfirmPromote = () => {
    if (!promoteSource || !promoteTarget) return;

    promoteStudents(
      { sourceClassroomId: promoteSource.id, targetClassroomId: promoteTarget.id },
      {
        onSuccess: (result) => {
          toast.success(`เลื่อนชั้นสำเร็จ: ย้ายนักเรียน ${result.promoted} คน จาก "${result.sourceClassroom}" → "${result.targetClassroom}"`);
          setOpenPromote(false);
        },
        onError: (error: any) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถเลื่อนชั้นได้'));
        },
      },
    );
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingClassroom(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (classroom: ClassroomItem) => {
    setFormMode('edit');
    setEditingClassroom(classroom);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) return;

    setOpenForm(false);
    setEditingClassroom(null);
  };

  const handleSubmitForm = (payload: ClassroomPayload) => {
    if (formMode === 'create') {
      createClassroom(payload, {
        onSuccess: () => {
          toast.success(`เพิ่มห้องเรียน ${payload.name} เรียบร้อยแล้ว`);
          setOpenForm(false);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถเพิ่มห้องเรียนได้'));
        },
      });

      return;
    }

    if (!editingClassroom?.id) return;

    updateClassroom(
      { id: editingClassroom.id, params: payload },
      {
        onSuccess: () => {
          toast.success(`อัปเดตห้องเรียน ${payload.name} เรียบร้อยแล้ว`);
          setOpenForm(false);
          setEditingClassroom(null);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, 'ไม่สามารถอัปเดตห้องเรียนได้'));
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingClassroom?.id) return;

    deleteClassroom(deletingClassroom.id, {
      onSuccess: () => {
        toast.success(`ลบห้องเรียน ${deletingClassroom.name} เรียบร้อยแล้ว`);
        setDeletingClassroom(null);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'ไม่สามารถลบห้องเรียนได้'));
      },
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const { data } = await httpClient.get(`${authConfig.classroomEndpoint}/download-template`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'classroom_template.xlsx';
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
    if (filteredClassrooms.length === 0) {
      toast.warning('ไม่มีข้อมูลห้องเรียนสำหรับ export');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        filteredClassrooms.map((classroom) => ({
          รหัสห้องเรียน: classroom.classroomId,
          ชื่อห้องเรียน: classroom.name,
          รหัสสาขา: classroom.program?.programId ?? '',
          รหัสแผนก: classroom.department?.departmentId ?? '',
          รหัสระดับ: classroom.level?.levelId ?? '',
          คำอธิบาย: classroom.description ?? '',
          สถานะ: isClassroomActive(classroom.status) ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ห้องเรียน');
      XLSX.writeFile(workbook, `classrooms_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'ไม่สามารถ export ข้อมูลห้องเรียนได้'));
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

      importClassrooms(
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
            toast.error(getErrorMessage(error, 'ไม่สามารถนำเข้าข้อมูลห้องเรียนได้'));
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
      headerName: 'ห้องเรียน',
      flex: 0.31,
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
            {row.classroomId || '—'}
          </Box>
        </Box>
      ),
    },
    {
      field: 'structure',
      headerName: 'โครงสร้าง',
      flex: 0.23,
      minWidth: 220,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box component='span' sx={{ color: 'info.main', display: 'inline-flex', flexShrink: 0, opacity: 0.8 }}>
              <Icon icon='tabler:building' fontSize='0.9rem' />
            </Box>
            <Typography variant='body2'>{row.department?.name || 'ไม่ระบุแผนก'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box component='span' sx={{ color: 'info.main', display: 'inline-flex', flexShrink: 0, opacity: 0.6 }}>
              <Icon icon='tabler:books' fontSize='0.85rem' />
            </Box>
            <Typography variant='caption' color='text.secondary'>
              {row.program?.name || 'ไม่ระบุสาขา'} • {row.level?.levelName || 'ไม่ระบุระดับ'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'usage',
      headerName: 'การใช้งาน',
      flex: 0.18,
      minWidth: 190,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box component='span' sx={{ color: 'success.main', display: 'inline-flex', flexShrink: 0, opacity: 0.85 }}>
              <Icon icon='tabler:users' fontSize='0.9rem' />
            </Box>
            <Typography variant='body2'>
              นักเรียน <strong>{row._count?.student ?? 0}</strong> คน
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component='span' sx={{ color: 'primary.main', display: 'inline-flex', flexShrink: 0, opacity: 0.75 }}>
                <Icon icon='tabler:user-star' fontSize='0.85rem' />
              </Box>
              <Typography variant='caption' color='text.secondary'>ครู {row._count?.teachers ?? 0}</Typography>
            </Box>
            <Typography variant='caption' color='text.disabled'>·</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component='span' sx={{ color: 'info.main', display: 'inline-flex', flexShrink: 0, opacity: 0.7 }}>
                <Icon icon='tabler:book' fontSize='0.85rem' />
              </Box>
              <Typography variant='caption' color='text.secondary'>วิชา {row._count?.course ?? 0}</Typography>
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
        const active = isClassroomActive(row.status);

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
        const linkedRecords = getLinkedRecords(row);

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title='แก้ไขห้องเรียน'>
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

            <Tooltip title={linkedRecords > 0 ? 'ลบไม่ได้ เพราะยังมีข้อมูลใช้งานอยู่' : 'ลบห้องเรียน'}>
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
                    setDeletingClassroom(row);
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
                  <Icon icon='tabler:door' />
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
                    จัดการชั้นเรียน
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'text.secondary',
                      mt: 0.75
                    }}>
                    ดูแลรหัสห้องเรียน ชื่อห้องเรียน และความเชื่อมโยงกับแผนก สาขา และระดับชั้นให้พร้อมใช้งาน
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
                      ค้นหาจากชื่อห้องเรียน รหัสห้องเรียน หรือกรองตามแผนก สาขา ระดับชั้น และสถานะก่อนจัดการรายการ
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
                        id='classroom-list-tools-surface'
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
                              id='download-classroom-template-button'
                              disabled={isDownloadingTemplate || isImporting || isExporting}
                              onClick={handleDownloadTemplate}
                            >
                              <Icon icon='tabler:file-download' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title={isExporting ? 'กำลัง Export ข้อมูล' : 'Export ข้อมูลห้องเรียน'}>
                          <ToolButtonSlot>
                            <ToolButton
                              id='export-classroom-button'
                              disabled={
                                isExporting || isImporting || isDownloadingTemplate || !filteredClassrooms.length
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
                              id='import-classroom-button'
                              disabled={isImporting || isDownloadingTemplate || isExporting}
                              onClick={handleImportClick}
                            >
                              <Icon icon='tabler:file-import' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title='เลื่อนชั้นนักเรียน'>
                          <ToolButtonSlot>
                            <ToolButton
                              id='promote-students-button'
                              disabled={isImporting || isDownloadingTemplate || isExporting || isPromoting}
                              onClick={handleOpenPromote}
                            >
                              <Icon icon='tabler:arrow-up' />
                            </ToolButton>
                          </ToolButtonSlot>
                        </Tooltip>

                        <ToolDivider />

                        <Tooltip title='เพิ่มห้องเรียน'>
                          <ToolButtonSlot>
                            <ActiveToolButton id='add-classroom-button' onClick={handleOpenCreate}>
                              <Icon icon='tabler:plus' />
                            </ActiveToolButton>
                          </ToolButtonSlot>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <AppFilterTextField
                      id='classroom-search'
                      fullWidth
                      label='ค้นหาห้องเรียน'
                      placeholder='พิมพ์ชื่อห้องเรียน รหัส หรือคำอธิบาย'
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <AppFilterTextField
                      id='classroom-department-filter'
                      select
                      fullWidth
                      label='แผนก'
                      value={departmentFilter}
                      onChange={(event) => {
                        const nextDepartment = event.target.value;
                        setDepartmentFilter(nextDepartment);
                        setProgramFilter('all');
                      }}
                    >
                      <MenuItem value='all'>ทุกแผนก</MenuItem>
                      {departments.map((department) => (
                        <MenuItem key={department.id} value={department.id}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </AppFilterTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <AppFilterTextField
                      id='classroom-program-filter'
                      select
                      fullWidth
                      label='สาขา'
                      value={programFilter}
                      onChange={(event) => setProgramFilter(event.target.value)}
                    >
                      <MenuItem value='all'>ทุกสาขา</MenuItem>
                      {availablePrograms.map((program) => (
                        <MenuItem key={program.id} value={program.id}>
                          {program.name}
                        </MenuItem>
                      ))}
                    </AppFilterTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <AppFilterTextField
                      id='classroom-level-filter'
                      select
                      fullWidth
                      label='ระดับชั้น'
                      value={levelFilter}
                      onChange={(event) => setLevelFilter(event.target.value)}
                    >
                      <MenuItem value='all'>ทุกระดับ</MenuItem>
                      {levels.map((level) => (
                        <MenuItem key={level.id} value={level.id}>
                          {level.levelName}
                        </MenuItem>
                      ))}
                    </AppFilterTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <AppFilterTextField
                      id='classroom-status-filter'
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
                    { label: 'ห้องเรียนทั้งหมด', value: summary.total, hint: `${summary.active} เปิดใช้งาน`, icon: 'tabler:door', colorKey: 'primary' },
                    { label: 'ปิดใช้งาน', value: summary.inactive, hint: 'พักใช้งานชั่วคราว', icon: 'tabler:door-off', colorKey: 'warning' },
                    { label: 'นักเรียนที่ผูกอยู่', value: summary.students, hint: 'รวมทั้งระบบ', icon: 'tabler:users', colorKey: 'info' },
                    { label: 'ครูที่ผูกอยู่', value: summary.teachers, hint: 'พร้อมใช้งานต่อในระบบ', icon: 'tabler:user-star', colorKey: 'success' },
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
                    <SectionTitle>รายการชั้นเรียน</SectionTitle>
                    <SectionDescription>
                      แสดงผล {filteredClassrooms.length} จาก {classrooms.length} รายการ
                    </SectionDescription>
                  </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <AppSettingsDataGrid
                    autoHeight
                    rows={filteredClassrooms}
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
      <ClassroomFormDialog
        open={openForm}
        mode={formMode}
        initialData={editingClassroom}
        departments={departments}
        programs={programs}
        levels={levels}
        isSubmitting={isSubmitting}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />
      <ClassroomDeleteDialog
        open={Boolean(deletingClassroom)}
        classroom={deletingClassroom}
        isDeleting={isDeleting}
        onClose={() => setDeletingClassroom(null)}
        onConfirm={handleDelete}
      />
      <Dialog id='import-result-dialog' open={isImportResultOpen} fullWidth maxWidth='sm' onClose={() => setIsImportResultOpen(false)}>
        <DialogTitle>ผลการนำเข้าข้อมูลห้องเรียน</DialogTitle>
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
      <ClassroomPromotionDialog
        open={openPromote}
        classrooms={classrooms}
        promoteSource={promoteSource}
        promoteTarget={promoteTarget}
        promotePreview={promotePreview}
        isLoadingPreview={isLoadingPreview}
        isPromoting={isPromoting}
        onSourceChange={(value) => {
          setPromoteSource(value);
          if (promoteTarget?.id === value?.id) setPromoteTarget(null);
        }}
        onTargetChange={setPromoteTarget}
        onConfirm={handleConfirmPromote}
        onCancel={() => setOpenPromote(false)}
      />
    </>
  );
};

export default ClassroomSettingsPage;
