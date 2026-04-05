import Icon from '@/@core/components/icon';
import { Autocomplete, Box, FormControl, IconButton, InputAdornment, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { Close } from '@mui/icons-material';
import Link from 'next/link';
import { ChangeEvent, memo, useRef } from 'react';

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
  studentId: string;
  students: any;
  canImportStudents: boolean;
  isImportingStudents: boolean;
  isDownloadingTemplate: boolean;
  isExportingStudents: boolean;
}

const PANEL_RADIUS = 16;
const TOOLBAR_RADIUS = 14;
const CONTROL_RADIUS = 12;

const getPanelBorderColor = (theme: any) =>
  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1);
const getPanelShadowColor = (theme: any) =>
  theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.28) : alpha(theme.palette.primary.main, 0.06);
const getToolbarSurfaceColor = (theme: any) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.04)
    : alpha(theme.palette.background.paper, 0.98);
const getControlSurfaceColor = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.82);

// ─── Styled Components ────────────────────────────────────────────────────────

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const FilterGrid = styled(Grid)({
  display: 'flex',
  alignItems: 'center',
});

const SectionBox = styled(Box)(({ theme }) => ({
  width: '100%',
  borderRadius: PANEL_RADIUS,
  border: `1px solid ${getPanelBorderColor(theme)}`,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 34%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 38%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
  boxShadow: `0 12px 28px ${getPanelShadowColor(theme)}`,
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(3.5),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: 'clamp(0.92rem, 0.86rem + 0.16vw, 1rem)',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.88 : 0.82),
  textShadow: theme.palette.mode === 'dark' ? `0 1px 10px ${alpha(theme.palette.primary.main, 0.12)}` : 'none',
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
  color: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.82) : theme.palette.text.secondary,
  maxWidth: '62ch',
  fontSize: 'clamp(0.94rem, 0.9rem + 0.18vw, 1.06rem)',
  fontWeight: 500,
  lineHeight: 1.6,
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
    studentId,
    students = [],
    canImportStudents,
    isImportingStudents,
    isDownloadingTemplate,
    isExportingStudents,
  } = props;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const controlTextFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: `${CONTROL_RADIUS}px`,
      backgroundColor: (theme: any) => getControlSurfaceColor(theme),
      color: 'text.primary',
      fontSize: 'clamp(1rem, 0.96rem + 0.14vw, 1.06rem)',
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
    '& .MuiInputBase-input::placeholder': {
      color: 'text.secondary',
      opacity: 1,
      fontWeight: 500,
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.9rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    '& .MuiInputLabel-shrink': {
      fontSize: '0.86rem',
    },
    '& .MuiSvgIcon-root': {
      color: 'text.secondary',
    },
    '& .MuiFormHelperText-root': {
      color: 'text.secondary',
      fontWeight: 500,
    },
  } as const;

  return (
    <Grid
      id='student-list-table-header'
      container
      spacing={3}
      sx={{
        px: { xs: 2.25, sm: 4, lg: 5 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <Grid size={12}>
        <SectionBox id='student-list-filter-surface'>
          <Box
            id='student-list-toolbar-row'
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
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
                    <ToolButtonSlot component='span'>
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
                    <ToolButtonSlot component='span'>
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
                    <ToolButtonSlot component='span'>
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

              <Tooltip title='เพิ่มนักเรียน'>
                <LinkStyled href='/apps/student/add' passHref>
                  <ToolButtonSlot component='span'>
                    <ActiveToolButton id='add-student-button'>
                      <Icon icon='line-md:account-add' />
                    </ActiveToolButton>
                  </ToolButtonSlot>
                </LinkStyled>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <FilterGrid id='student-list-student-id-filter' size={{ xs: 12, md: 4 }}>
              <FormControl id='student-id-form-control' fullWidth>
                <TextField
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
                  sx={controlTextFieldSx}
                />
              </FormControl>
            </FilterGrid>

            <FilterGrid id='student-list-student-name-filter' size={{ xs: 12, md: 4 }}>
              <FormControl id='student-name-form-control' fullWidth>
                <Autocomplete
                  id='studentName'
                  fullWidth
                  disablePortal={false}
                  value={fullName || null}
                  options={Array.isArray(students) ? students : []}
                  loading={loadingStudents}
                  onInputChange={onSearchChange}
                  onChange={(_, newValue: any) => onHandleChangeStudent(_, newValue)}
                  sx={{
                    '& .MuiAutocomplete-clearIndicator': { visibility: 'visible' },
                  }}
                  getOptionLabel={getStudentLabel}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof option === 'string' || typeof value === 'string') {
                      return option === value;
                    }
                    return option?.id === value?.id;
                  }}
                  renderOption={(props, option: any) => (
                    <li {...props} key={option.id}>
                      {getStudentLabel(option)}
                    </li>
                  )}
                  renderInput={(params: any) => (
                    <TextField
                      id='student-name-input'
                      {...params}
                      label='ชื่อ-สกุล นักเรียน'
                      placeholder='ค้นหาชื่อหรือนามสกุล'
                      slotProps={{
                        ...params.slotProps,
                        input: {
                          ...params.InputProps,
                        },
                        inputLabel: { shrink: true },
                      }}
                      sx={controlTextFieldSx}
                    />
                  )}
                  noOptionsText='ไม่พบข้อมูล'
                />
              </FormControl>
            </FilterGrid>

            <FilterGrid id='student-list-classroom-filter' size={{ xs: 12, md: 4 }}>
              <FormControl id='classroom-form-control' fullWidth>
                <Autocomplete
                  id='classroom'
                  fullWidth
                  disablePortal={false}
                  value={defaultClassroom || null}
                  options={Array.isArray(classrooms) ? classrooms : []}
                  loading={loading}
                  onChange={(_, newValue: any) => onHandleChange(_, newValue)}
                  getOptionLabel={(option: any) => option?.name ?? ''}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  groupBy={(option: any) => option.department?.name}
                  renderInput={(params: any) => (
                    <TextField
                      id='classroom-input'
                      {...params}
                      label='ห้องเรียน'
                      placeholder='เลือกห้องเรียน'
                      error={(!classrooms || classrooms.length === 0) && !loading}
                      helperText={(!classrooms || classrooms.length === 0) && !loading ? 'ไม่พบข้อมูลห้องเรียน' : ''}
                      slotProps={{
                        ...params.slotProps,
                        input: {
                          ...params.InputProps,
                        },
                        inputLabel: { shrink: true },
                      }}
                      sx={controlTextFieldSx}
                    />
                  )}
                  noOptionsText='ไม่พบข้อมูล'
                />
              </FormControl>
            </FilterGrid>
          </Grid>
        </SectionBox>
      </Grid>
    </Grid>
  );
});

export default TableHeader;
