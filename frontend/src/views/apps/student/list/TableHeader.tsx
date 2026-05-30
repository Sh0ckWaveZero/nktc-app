import Icon from '@/@core/components/icon';
import { FilterGrid, SectionBox, SectionDescription, SectionTitle } from '@/@core/components/filter-panel';
import {
  AppFilterTextField,
  AppFilterFormControl,
  AppFilterAutocomplete,
  AppFilterSelect,
} from '@/@core/components/form';
import { ActiveToolButton, ToolButton, ToolButtonSlot, ToolDivider } from '@/@core/components/toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import { alpha, styled } from '@mui/material/styles';
import { Close } from '@mui/icons-material';
import Link from 'next/link';
import { ChangeEvent, memo, useMemo, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableHeaderProps {
  classrooms: any;
  defaultClassroom: any;
  fullName: any;
  loading: boolean;
  loadingStudents: boolean;
  onHandleChange: (event: any, value: any) => void;
  onHandleChangeStudent: (event: any, value: any) => void;
  onHandleStudentId: (value: string) => void;
  onSearchChange: (event: any, value: any, reason: any) => void;
  onImportStudents: (file: File | null) => Promise<void>;
  onDownloadTemplate: () => Promise<void>;
  onExportStudents: () => Promise<void>;
  onBulkGraduate?: () => void;
  onBulkPromote?: () => void;
  onDeleteAll?: () => void;
  onStatusChange: (status: string) => void;
  studentStatus: string;
  studentId: string;
  students: any;
  canImportStudents: boolean;
  isImportingStudents: boolean;
  isDownloadingTemplate: boolean;
  isExportingStudents: boolean;
  isPromoting?: boolean;
  isDeleting?: boolean;
}

const TOOLBAR_RADIUS = 14;

const getToolbarSurfaceColor = (theme: any) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.04)
    : alpha(theme.palette.background.paper, 0.98);

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

// ─── Component ────────────────────────────────────────────────────────────────

const TableHeader = memo((props: TableHeaderProps) => {
  const {
    classrooms = [],
    defaultClassroom,
    fullName,
    loading,
    loadingStudents,
    onHandleChange,
    onHandleChangeStudent,
    onHandleStudentId,
    onSearchChange,
    onImportStudents,
    onDownloadTemplate,
    onExportStudents,
    onBulkGraduate,
    onBulkPromote,
    onDeleteAll,
    onStatusChange,
    studentStatus,
    studentId,
    students = [],
    canImportStudents,
    isImportingStudents,
    isDownloadingTemplate,
    isExportingStudents,
    isPromoting,
    isDeleting,
  } = props;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedClassrooms = useMemo(
    () =>
      Array.isArray(classrooms)
        ? [...classrooms].sort((a: any, b: any) =>
            (a.department?.name ?? '').localeCompare(b.department?.name ?? '', 'th'),
          )
        : [],
    [classrooms],
  );

  const getStudentLabel = (option: any) => {
    if (typeof option === 'string') return option;

    const account = option?.user?.account || option?.account;
    if (account) {
      const { title = '', firstName = '', lastName = '' } = account;
      const label = `${title}${firstName} ${lastName}`.trim();
      if (label) return label;
    }

    if (option?.fullName) {
      return `${option?.title || ''}${option.fullName}`;
    }

    return option?.studentId || option?.id || '';
  };

  const handleSelectImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    void onImportStudents(file);
    event.target.value = '';
  };

  return (
    <Grid
      id='student-list-table-header'
      container
      spacing={3}
      sx={{
        px: { xs: 3, sm: 4, lg: 5 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <Grid size={12}>
        <SectionBox id='student-list-filter-surface'>
          <Stack
            id='student-list-toolbar-row'
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              alignItems: { xs: 'stretch', sm: 'flex-start', lg: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1.75, sm: 2 },
              mb: { xs: 2, sm: 2.75 },
            }}
          >
            <Box sx={{ minWidth: 0, maxWidth: { xs: '100%', lg: 720 } }}>
              <SectionTitle>ค้นหาและกรอง</SectionTitle>
              <SectionDescription variant='body2'>
                เลือกห้องเรียน ค้นหาจากรหัส หรือพิมพ์ชื่อเพื่อเข้าถึงข้อมูลนักเรียนได้เร็วขึ้น
              </SectionDescription>
            </Box>

            <Box
              id='student-list-tools-surface'
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
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
              }}
            >
              {canImportStudents && (
                <>
                  <Tooltip title={isDownloadingTemplate ? 'กำลังดาวน์โหลด Template' : 'ดาวน์โหลด Template'}>
                    <ToolButtonSlot>
                      <ToolButton
                        id='download-student-template-button'
                        disabled={isDownloadingTemplate || isImportingStudents || isExportingStudents}
                        onClick={() => void onDownloadTemplate()}
                      >
                        <Icon icon='tabler:file-download' />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>

                  <ToolDivider />

                  <Tooltip title={isExportingStudents ? 'กำลัง Export ข้อมูล' : 'Export ข้อมูลนักเรียน'}>
                    <ToolButtonSlot>
                      <ToolButton
                        id='export-student-button'
                        disabled={
                          isExportingStudents || isImportingStudents || isDownloadingTemplate || !students.length
                        }
                        onClick={() => void onExportStudents()}
                      >
                        <Icon icon='tabler:database-export' />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>

                  <ToolDivider />

                  <input ref={fileInputRef} hidden type='file' accept='.xlsx' onChange={handleFileChange} />

                  <Tooltip title={isImportingStudents ? 'กำลัง Import ไฟล์' : 'Import ไฟล์ XLSX'}>
                    <ToolButtonSlot>
                      <ToolButton
                        id='import-student-button'
                        disabled={isImportingStudents || isDownloadingTemplate || isExportingStudents}
                        onClick={handleSelectImportFile}
                      >
                        <Icon icon='tabler:file-import' />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>

                  <ToolDivider />
                </>
              )}

              {onBulkGraduate && (
                <>
                  <Tooltip title='จบการศึกษาทั้งห้อง'>
                    <ToolButtonSlot>
                      <ToolButton id='bulk-graduate-button' onClick={onBulkGraduate}>
                        <Icon icon='tabler:school' />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>
                  <ToolDivider />
                </>
              )}

              {onBulkPromote && (
                <>
                  <Tooltip title={isPromoting ? 'กำลังเลื่อนชั้น...' : 'เลื่อนชั้นนักเรียน'}>
                    <ToolButtonSlot>
                      <ToolButton id='bulk-promote-button' onClick={onBulkPromote} disabled={isPromoting}>
                        <Icon icon='tabler:arrow-up' />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>
                  <ToolDivider />
                </>
              )}

              {onDeleteAll && (
                <>
                  <Tooltip title={isDeleting ? 'กำลังลบ...' : 'ลบนักเรียนทั้งหมดในห้อง'}>
                    <ToolButtonSlot>
                      <ToolButton
                        id='delete-all-students-button'
                        onClick={onDeleteAll}
                        disabled={isDeleting}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.12),
                          },
                        }}
                      >
                        <Icon icon='tabler:trash' />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>
                  <ToolDivider />
                </>
              )}

              <Tooltip title='เพิ่มนักเรียน'>
                <LinkStyled href='/apps/student/add' passHref>
                  <ToolButtonSlot>
                    <ActiveToolButton id='add-student-button'>
                      <Icon icon='line-md:account-add' />
                    </ActiveToolButton>
                  </ToolButtonSlot>
                </LinkStyled>
              </Tooltip>
            </Box>
          </Stack>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <FilterGrid id='student-list-student-id-filter' size={{ xs: 12, md: 3 }}>
              <AppFilterTextField
                id='studentId'
                fullWidth
                label='รหัสนักเรียน'
                placeholder='เช่น 654230001'
                value={studentId}
                onChange={(e) => onHandleStudentId(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: studentId && (
                      <InputAdornment position='end'>
                        <IconButton
                          id='clear-student-id-button'
                          size='small'
                          edge='end'
                          onClick={() => onHandleStudentId('')}
                          aria-label='clear student id'
                        >
                          <Close fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FilterGrid>

            <FilterGrid id='student-list-student-name-filter' size={{ xs: 12, md: 3 }}>
              <AppFilterAutocomplete
                id='studentName'
                fullWidth
                disablePortal={false}
                value={fullName || null}
                options={Array.isArray(students) ? students : []}
                loading={loadingStudents}
                onInputChange={onSearchChange}
                onChange={(_, newValue: any) => onHandleChangeStudent(_, newValue)}
                sx={{
                  '& .MuiAutocomplete-clearIndicator': { visibility: fullName ? 'visible' : 'hidden' },
                }}
                getOptionLabel={getStudentLabel}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (typeof option === 'string' || typeof value === 'string') {
                    return option === value;
                  }
                  return option?.id === value?.id;
                }}
                renderOption={(props: any, option: any) => (
                  <li {...props} key={option.id}>
                    {getStudentLabel(option)}
                  </li>
                )}
                renderInput={(params: any) => (
                  <AppFilterTextField
                    id='student-name-input'
                    {...params}
                    label='ชื่อ-สกุล นักเรียน'
                    placeholder='ค้นหาชื่อหรือนามสกุล'
                    slotProps={{
                      ...params.slotProps,
                      input: { ...params.slotProps?.input, ...(params.slotProps?.input ?? {}) },
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
                noOptionsText='ไม่พบข้อมูล'
              />
            </FilterGrid>

            <FilterGrid id='student-list-classroom-filter' size={{ xs: 12, md: 3 }}>
              <AppFilterAutocomplete
                id='classroom'
                fullWidth
                disablePortal={false}
                value={defaultClassroom || null}
                options={sortedClassrooms}
                loading={loading}
                onChange={(_, newValue: any) => onHandleChange(_, newValue)}
                getOptionLabel={(option: any) => option?.name ?? ''}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                groupBy={(option: any) => option.department?.name}
                sx={{ '& .MuiAutocomplete-clearIndicator': { visibility: defaultClassroom ? 'visible' : 'hidden' } }}
                renderInput={(params: any) => (
                  <AppFilterTextField
                    id='classroom-input'
                    {...params}
                    label='ห้องเรียน'
                    placeholder='เลือกห้องเรียน'
                    error={(!classrooms || classrooms.length === 0) && !loading}
                    helperText={(!classrooms || classrooms.length === 0) && !loading ? 'ไม่พบข้อมูลห้องเรียน' : ''}
                    slotProps={{
                      ...params.slotProps,
                      input: { ...params.slotProps?.input, ...(params.slotProps?.input ?? {}) },
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
                noOptionsText='ไม่พบข้อมูล'
              />
            </FilterGrid>

            <FilterGrid id='student-list-status-filter' size={{ xs: 12, md: 3 }}>
              <AppFilterFormControl fullWidth>
                <InputLabel id='student-status-label' shrink>
                  สถานะนักเรียน
                </InputLabel>
                <AppFilterSelect
                  id='student-status-select'
                  labelId='student-status-label'
                  value={studentStatus}
                  onChange={(e) => onStatusChange(e.target.value as string)}
                  displayEmpty
                  input={
                    <OutlinedInput
                      label='สถานะนักเรียน'
                      notched
                      endAdornment={
                        studentStatus ? (
                          <InputAdornment position='end' sx={{ mr: 1.5 }}>
                            <IconButton
                              id='clear-student-status-button'
                              size='small'
                              edge='end'
                              onClick={() => onStatusChange('')}
                              aria-label='clear student status'
                            >
                              <Close fontSize='small' />
                            </IconButton>
                          </InputAdornment>
                        ) : undefined
                      }
                    />
                  }
                >
                  <MenuItem value=''>ทุกสถานะ</MenuItem>
                  <MenuItem value='กำลังศึกษา'>เรียนอยู่</MenuItem>
                  <MenuItem value='จบการศึกษา'>จบการศึกษา</MenuItem>
                  <MenuItem value='ออกก่อนกำหนด'>ไม่เรียนแล้ว</MenuItem>
                </AppFilterSelect>
              </AppFilterFormControl>
            </FilterGrid>
          </Grid>
        </SectionBox>
      </Grid>
    </Grid>
  );
});

export default TableHeader;
