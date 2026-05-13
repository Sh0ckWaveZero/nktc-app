'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { alpha, styled } from '@mui/material/styles';
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

import ClassroomDeleteDialog from './ClassroomDeleteDialog';
import ClassroomFormDialog from './ClassroomFormDialog';

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
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25 }}>
            {row.classroomId || 'ยังไม่กำหนดรหัสห้องเรียน'}
          </Typography>
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
        <Box sx={{ py: 1.5 }}>
          <Typography variant='body2'>{row.department?.name || 'ไม่ระบุแผนก'}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25 }}>
            {row.program?.name || 'ไม่ระบุสาขา'} • {row.level?.levelName || 'ไม่ระบุระดับ'}
          </Typography>
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
        <Box sx={{ py: 1.5 }}>
          <Typography variant='body2'>นักเรียน {row._count?.student ?? 0} คน</Typography>
          <Typography variant='caption' color='text.secondary'>
            ครู {row._count?.teachers ?? 0} • รายวิชา {row._count?.course ?? 0}
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
          <Box sx={{ py: 1.5 }}>
            <Typography variant='body2' color='text.secondary'>
              {formatted.date}
            </Typography>
            {formatted.time ? (
              <Typography variant='caption' color='text.secondary'>
                {formatted.time}
              </Typography>
            ) : null}
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
                  <Typography variant='body1' color='text.secondary' sx={{ mt: 0.75 }}>
                    ดูแลรหัสห้องเรียน ชื่อห้องเรียน และความเชื่อมโยงกับแผนก สาขา และระดับชั้นให้พร้อมใช้งาน
                  </Typography>
                </Box>
              }
            />

            <CardContent sx={{ px: { xs: 4, sm: 5, md: 6 }, pt: 2, pb: { xs: 4, sm: 5 } }}>
              <SectionSurface sx={{ p: { xs: 3, sm: 3.5 }, mb: 4 }}>
                <Grid container spacing={3} alignItems='flex-end'>
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
                    <TextField
                      id='classroom-search'
                      fullWidth
                      label='ค้นหาห้องเรียน'
                      placeholder='พิมพ์ชื่อห้องเรียน รหัส หรือคำอธิบาย'
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      sx={CONTROL_SX}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <TextField
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
                      sx={CONTROL_SX}
                    >
                      <MenuItem value='all'>ทุกแผนก</MenuItem>
                      {departments.map((department) => (
                        <MenuItem key={department.id} value={department.id}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <TextField
                      id='classroom-program-filter'
                      select
                      fullWidth
                      label='สาขา'
                      value={programFilter}
                      onChange={(event) => setProgramFilter(event.target.value)}
                      sx={CONTROL_SX}
                    >
                      <MenuItem value='all'>ทุกสาขา</MenuItem>
                      {availablePrograms.map((program) => (
                        <MenuItem key={program.id} value={program.id}>
                          {program.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <TextField
                      id='classroom-level-filter'
                      select
                      fullWidth
                      label='ระดับชั้น'
                      value={levelFilter}
                      onChange={(event) => setLevelFilter(event.target.value)}
                      sx={CONTROL_SX}
                    >
                      <MenuItem value='all'>ทุกระดับ</MenuItem>
                      {levels.map((level) => (
                        <MenuItem key={level.id} value={level.id}>
                          {level.levelName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <TextField
                      id='classroom-status-filter'
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
                    label: 'ห้องเรียนทั้งหมด',
                    value: summary.total,
                    hint: `${summary.active} เปิดใช้งาน`,
                    icon: 'tabler:door',
                  },
                  {
                    label: 'ปิดใช้งาน',
                    value: summary.inactive,
                    hint: 'พักใช้งานชั่วคราว',
                    icon: 'tabler:door-off',
                  },
                  {
                    label: 'นักเรียนที่ผูกอยู่',
                    value: summary.students,
                    hint: 'รวมทั้งระบบ',
                    icon: 'tabler:users',
                  },
                  {
                    label: 'ครูที่ผูกอยู่',
                    value: summary.teachers,
                    hint: 'พร้อมใช้งานต่อในระบบ',
                    icon: 'tabler:user-star',
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
                    <SectionTitle>รายการชั้นเรียน</SectionTitle>
                    <SectionDescription>
                      แสดงผล {filteredClassrooms.length} จาก {classrooms.length} รายการ
                    </SectionDescription>
                  </Box>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <StyledDataGrid
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
              </SectionSurface>
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

      <Dialog
        id='promote-students-dialog'
        open={openPromote}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>เลื่อนชั้นนักเรียน</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            นักเรียนทุกคนในห้องเรียนต้นทาง (ยกเว้นที่จบการศึกษาแล้ว) จะถูกย้ายไปยังห้องเรียนปลายทาง
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Autocomplete
              id='promote-source-classroom'
              options={classrooms.filter((c) => c.id !== promoteTarget?.id)}
              getOptionLabel={(option) => option.name ?? option.classroomId ?? ''}
              value={promoteSource}
              onChange={(_, value) => {
                setPromoteSource(value);
                if (promoteTarget?.id === value?.id) setPromoteTarget(null);
              }}
              disabled={isPromoting}
              renderInput={(params) => (
                <TextField {...params} label='ห้องเรียนต้นทาง' placeholder='พิมพ์เพื่อค้นหา...' sx={CONTROL_SX} />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText='ไม่พบห้องเรียน'
            />

            {promoteSource && (
              <Box>
                {isLoadingPreview ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant='body2' color='text.secondary'>กำลังโหลดรายชื่อ...</Typography>
                  </Box>
                ) : promotePreview?.total === 0 ? (
                  <Alert severity='warning' sx={{ borderRadius: 2 }}>
                    ไม่มีนักเรียนในห้องเรียนนี้ที่จะเลื่อนชั้นได้
                  </Alert>
                ) : promotePreview && promotePreview.total > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='subtitle2'>
                        รายชื่อนักเรียนที่จะเลื่อนชั้น
                      </Typography>
                      <Chip size='small' label={`${promotePreview.total} คน`} color='primary' variant='outlined' />
                    </Box>
                    <Box
                      sx={{
                        maxHeight: 200,
                        overflowY: 'auto',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <List disablePadding dense>
                        {promotePreview.students.map((student, index) => (
                          <ListItem
                            key={student.id}
                            divider={index < promotePreview.students.length - 1}
                            sx={{ py: 0.75 }}
                          >
                            <ListItemText
                              primary={student.name}
                              secondary={student.studentId ?? '-'}
                              slotProps={{
                                primary: { variant: 'body2', fontWeight: 500 },
                                secondary: { variant: 'caption' },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            )}

            <Divider />

            <Autocomplete
              id='promote-target-classroom'
              options={classrooms.filter((c) => c.id !== promoteSource?.id)}
              getOptionLabel={(option) => option.name ?? option.classroomId ?? ''}
              value={promoteTarget}
              onChange={(_, value) => setPromoteTarget(value)}
              disabled={isPromoting || !promoteSource || promotePreview?.total === 0}
              renderInput={(params) => (
                <TextField {...params} label='ห้องเรียนปลายทาง' placeholder='พิมพ์เพื่อค้นหา...' sx={CONTROL_SX} />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText='ไม่พบห้องเรียน'
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 5, pt: 1 }}>
          <Button
            id='promote-cancel-button'
            variant='outlined'
            color='error'
            onClick={() => setOpenPromote(false)}
            disabled={isPromoting}
          >
            ยกเลิก
          </Button>
          <Button
            id='promote-confirm-button'
            variant='contained'
            color='primary'
            onClick={handleConfirmPromote}
            disabled={!promoteSource || !promoteTarget || isPromoting || promotePreview?.total === 0}
          >
            {isPromoting ? 'กำลังเลื่อนชั้น...' : 'ยืนยันเลื่อนชั้น'}
          </Button>
        </DialogActions>
      </Dialog>

      <input ref={fileInputRef} hidden type='file' accept='.xlsx' onChange={handleImportFile} />
    </>
  );
};

export default ClassroomSettingsPage;
