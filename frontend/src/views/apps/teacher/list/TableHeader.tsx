'use client';

import { Box, Button, Divider, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  const busy = isDownloadingTemplate || isExporting || isImporting;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: { xs: 2.5, sm: 3 },
        alignItems: isMobile ? 'stretch' : 'center',
        px: { xs: 3, sm: 4, lg: 5 },
        py: { xs: 2.75, sm: 3.25 },
        borderTop: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.06)
            : alpha(theme.palette.primary.main, 0.025),
      }}
    >
      <TextField
        size='small'
        value={value}
        placeholder='ค้นหา ชื่อ, นามสกุล, ชื่อผู้ใช้'
        onChange={(e) => handleFilter(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position='start'>
                <IconifyIcon icon='tabler:search' fontSize='1.1rem' />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          width: { xs: '100%', md: 360 },
          flex: { xs: '1 1 auto', md: '0 1 360px' },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.96),
            transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
            '& .MuiInputAdornment-root': {
              color: 'primary.main',
            },
            '& fieldset': {
              borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.16),
            },
            '&:hover fieldset': {
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.38),
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
              boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
          ml: isMobile ? 0 : 'auto',
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
          minWidth: { xs: '100%', md: 'auto' },
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'stretch',
            width: { xs: '100%', sm: 'auto' },
            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.26 : 0.2)}`,
            borderRadius: 2.5,
            overflow: 'hidden',
            backgroundColor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.08 : 0.06),
            '& > span': {
              display: 'flex',
              flex: { xs: '1 1 0', sm: '0 0 auto' },
            },
          }}
        >
          <Tooltip title={isDownloadingTemplate ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด Template'}>
            <span>
              <IconButton
                id='download-teacher-template-button'
                size='small'
                disabled={busy}
                onClick={onDownloadTemplate}
                sx={{
                  borderRadius: 0,
                  width: { xs: '100%', sm: 'auto' },
                  px: 1.75,
                  py: 1,
                  color: 'warning.dark',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.14),
                  },
                }}
              >
                <IconifyIcon icon='tabler:file-download' width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ borderColor: (theme) => alpha(theme.palette.warning.main, 0.22) }} />

          <Tooltip title={isImporting ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล (.xlsx)'}>
            <span>
              <IconButton
                id='import-teacher-button'
                size='small'
                disabled={busy}
                onClick={onImportClick}
                sx={{
                  borderRadius: 0,
                  width: { xs: '100%', sm: 'auto' },
                  px: 1.75,
                  py: 1,
                  color: 'warning.dark',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.14),
                  },
                }}
              >
                <IconifyIcon icon='tabler:file-import' width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ borderColor: (theme) => alpha(theme.palette.warning.main, 0.22) }} />

          <Tooltip
            title={
              isExporting
                ? 'กำลัง export...'
                : !canExport
                  ? 'ไม่มีข้อมูลสำหรับ export'
                  : 'Export ข้อมูล (.xlsx)'
            }
          >
            <span>
              <IconButton
                id='export-teacher-button'
                size='small'
                disabled={busy || !canExport}
                onClick={onExport}
                sx={{
                  borderRadius: 0,
                  width: { xs: '100%', sm: 'auto' },
                  px: 1.75,
                  py: 1,
                  color: 'warning.dark',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.14),
                  },
                }}
              >
                <IconifyIcon icon='tabler:database-export' width={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Button
          variant='contained'
          disableElevation
          onClick={toggle}
          startIcon={<IconifyIcon icon='tabler:user-plus' />}
          sx={{
            borderRadius: 2.5,
            whiteSpace: 'nowrap',
            px: 3,
            py: 1,
            minHeight: 40,
            boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.primary.main, 0.24)}`,
            '&:hover': {
              boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        >
          {isMobile ? 'เพิ่ม' : 'เพิ่มครู / บุคลากร'}
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
