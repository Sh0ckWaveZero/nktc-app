'use client';

import IconifyIcon from '@/@core/components/icon';
import { SectionBox } from '@/@core/components/filter-panel';
import { AppSearchTextField, AppContainedButton } from '@/@core/components/form';
import { ToolButton, ToolButtonSlot, ToolDivider } from '@/@core/components/toolbar';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

const TOOLBAR_RADIUS = 14;

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
  onDownloadTemplate: () => void;
  onResetLoginDays: () => void;
  onExport: () => void;
  onImportClick: () => void;
  isDownloadingTemplate: boolean;
  isResettingLoginDays: boolean;
  isExporting: boolean;
  isImporting: boolean;
  showResetLoginDays: boolean;
  canExport: boolean;
  canResetLoginDays: boolean;
}

const TableHeader = ({
  value,
  toggle,
  handleFilter,
  onDownloadTemplate,
  onResetLoginDays,
  onExport,
  onImportClick,
  isDownloadingTemplate,
  isResettingLoginDays,
  isExporting,
  isImporting,
  showResetLoginDays,
  canExport,
  canResetLoginDays,
}: TableHeaderProps) => {
  const busy = isDownloadingTemplate || isResettingLoginDays || isExporting || isImporting;

  return (
    <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
      <SectionBox id='teacher-list-toolbar-surface'>
        <Stack
          id='teacher-list-toolbar-row'
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.75, sm: 2 },
          }}
        >
          <AppSearchTextField
            id='teacher-search-input'
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
            }}
          />

          <Stack direction='row' sx={{ alignItems: 'center', gap: 1.5, ml: { sm: 'auto' } }}>
            <Box
              id='teacher-list-tools-surface'
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
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Tooltip title={isDownloadingTemplate ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด Template'}>
                <ToolButtonSlot>
                  <ToolButton
                    id='download-teacher-template-button'
                    size='small'
                    disabled={busy}
                    onClick={onDownloadTemplate}
                  >
                    <IconifyIcon icon='tabler:file-download' width={18} />
                  </ToolButton>
                </ToolButtonSlot>
              </Tooltip>

              {showResetLoginDays && (
                <>
                  <ToolDivider />

                  <Tooltip
                    title={
                      isResettingLoginDays
                        ? 'กำลังรีเซตวันเข้าใช้งาน...'
                        : !canResetLoginDays
                          ? 'ไม่มีข้อมูลครูสำหรับรีเซต'
                          : 'รีเซตวันเข้าใช้งานของครูทั้งหมด'
                    }
                  >
                    <ToolButtonSlot>
                      <ToolButton
                        id='reset-teacher-login-days-button'
                        size='small'
                        disabled={busy || !canResetLoginDays}
                        onClick={onResetLoginDays}
                      >
                        <IconifyIcon icon='mdi:calendar-refresh-outline' width={18} />
                      </ToolButton>
                    </ToolButtonSlot>
                  </Tooltip>
                </>
              )}

              <ToolDivider />

              <Tooltip title={isImporting ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล (.xlsx)'}>
                <ToolButtonSlot>
                  <ToolButton id='import-teacher-button' size='small' disabled={busy} onClick={onImportClick}>
                    <IconifyIcon icon='tabler:file-import' width={18} />
                  </ToolButton>
                </ToolButtonSlot>
              </Tooltip>

              <ToolDivider />

              <Tooltip
                title={
                  isExporting ? 'กำลัง export...' : !canExport ? 'ไม่มีข้อมูลสำหรับ export' : 'Export ข้อมูล (.xlsx)'
                }
              >
                <ToolButtonSlot>
                  <ToolButton id='export-teacher-button' size='small' disabled={busy || !canExport} onClick={onExport}>
                    <IconifyIcon icon='tabler:database-export' width={18} />
                  </ToolButton>
                </ToolButtonSlot>
              </Tooltip>
            </Box>

            <AppContainedButton
              id='add-teacher-button'
              variant='contained'
              disableElevation
              onClick={toggle}
              startIcon={<IconifyIcon icon='tabler:user-plus' />}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              เพิ่มครู / บุคลากร
            </AppContainedButton>
          </Stack>
        </Stack>
      </SectionBox>
    </Box>
  );
};

export default TableHeader;
