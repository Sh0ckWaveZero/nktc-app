'use client';

import { Box, Button, Divider, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
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
        gap: 2,
        alignItems: isMobile ? 'stretch' : 'center',
        px: { xs: 4, sm: 5 },
        py: { xs: 3, sm: 3.5 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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
                <IconifyIcon icon='tabler:search' fontSize='1.1rem' style={{ opacity: 0.45 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: isMobile ? '100%' : 300 }}
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          ml: isMobile ? 0 : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'stretch',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Tooltip title={isDownloadingTemplate ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด Template'}>
            <span>
              <IconButton
                id='download-teacher-template-button'
                size='small'
                disabled={busy}
                onClick={onDownloadTemplate}
                sx={{ borderRadius: 0, px: 1.75, py: 1 }}
              >
                <IconifyIcon icon='tabler:file-download' width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation='vertical' flexItem />

          <Tooltip title={isImporting ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล (.xlsx)'}>
            <span>
              <IconButton
                id='import-teacher-button'
                size='small'
                disabled={busy}
                onClick={onImportClick}
                sx={{ borderRadius: 0, px: 1.75, py: 1 }}
              >
                <IconifyIcon icon='tabler:file-import' width={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation='vertical' flexItem />

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
                sx={{ borderRadius: 0, px: 1.75, py: 1 }}
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
          sx={{ borderRadius: 2, whiteSpace: 'nowrap', px: 3, py: 1 }}
        >
          {isMobile ? 'เพิ่ม' : 'เพิ่มครู / บุคลากร'}
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
