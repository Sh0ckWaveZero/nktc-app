'use client';

import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

import IconifyIcon from '@/@core/components/icon';
import { useResponsive } from '@/@core/hooks/useResponsive';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
  onDownloadTemplate: () => void;
  onExport: () => void;
  onImportClick: () => void;
  isDownloadingTemplate: boolean;
  isExporting: boolean;
  isImporting: boolean;
  canExport: boolean;
}

const TOOLBAR_RADIUS = 14;
const CONTROL_RADIUS = 12;

const getPanelBorderColor = (theme: any) =>
  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1);
const getSectionSurfaceBackground = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.76 : 0.9);
const getControlSurfaceColor = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.88);
const getToolbarSurfaceColor = (theme: any) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.04)
    : alpha(theme.palette.background.paper, 0.98);

const SectionSurface = styled(Box)(({ theme }) => ({
  borderRadius: 14,
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

const TableHeader = ({
  value,
  toggle,
  handleFilter,
  onDownloadTemplate,
  onExport,
  onImportClick,
  isDownloadingTemplate,
  isExporting,
  isImporting,
  canExport,
}: TableHeaderProps) => {
  const { isMobile } = useResponsive();

  return (
    <SectionSurface sx={{ mx: { xs: 2, sm: 3 }, mb: 3, p: { xs: 3, sm: 3.5 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          alignItems: 'end',
        }}
      >
        <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 6' } }}>
          <SectionTitle>ค้นหาและจัดการ</SectionTitle>
          <SectionDescription>
            ค้นหาครูหรือบุคลากรจากชื่อ ชื่อผู้ใช้ และจัดการข้อมูลด้วย template, import และ export ในจุดเดียว
          </SectionDescription>
        </Box>

        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: 'span 6' },
            display: 'flex',
            justifyContent: { xs: 'stretch', md: 'flex-end' },
          }}
        >
          <Box
            id='teacher-list-tools-surface'
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
                  id='download-teacher-template-button'
                  disabled={isDownloadingTemplate || isImporting || isExporting}
                  onClick={onDownloadTemplate}
                >
                  <IconifyIcon icon='tabler:file-download' />
                </ToolButton>
              </ToolButtonSlot>
            </Tooltip>

            <ToolDivider />

            <Tooltip title={isExporting ? 'กำลัง Export ข้อมูล' : 'Export ข้อมูลครูและบุคลากร'}>
              <ToolButtonSlot>
                <ToolButton
                  id='export-teacher-button'
                  disabled={isExporting || isImporting || isDownloadingTemplate || !canExport}
                  onClick={onExport}
                >
                  <IconifyIcon icon='tabler:database-export' />
                </ToolButton>
              </ToolButtonSlot>
            </Tooltip>

            <ToolDivider />

            <Tooltip title={isImporting ? 'กำลัง Import ไฟล์' : 'Import ไฟล์ XLSX'}>
              <ToolButtonSlot>
                <ToolButton
                  id='import-teacher-button'
                  disabled={isImporting || isDownloadingTemplate || isExporting}
                  onClick={onImportClick}
                >
                  <IconifyIcon icon='tabler:file-import' />
                </ToolButton>
              </ToolButtonSlot>
            </Tooltip>

            <ToolDivider />

            <Tooltip title='เพิ่มครู/บุคลากร'>
              <ToolButtonSlot>
                <ActiveToolButton id='add-teacher-button' onClick={toggle}>
                  <IconifyIcon icon='tabler:user-plus' />
                </ActiveToolButton>
              </ToolButtonSlot>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ gridColumn: { xs: '1 / -1', md: isMobile ? '1 / -1' : 'span 6' } }}>
          <TextField
            fullWidth
            value={value}
            label='ค้นหาครู/บุคลากร'
            placeholder='พิมพ์ชื่อ ชื่อผู้ใช้ หรือนามสกุล'
            onChange={(event) => handleFilter(event.target.value)}
            sx={CONTROL_SX}
          />
        </Box>
      </Box>
    </SectionSurface>
  );
};

export default TableHeader;
