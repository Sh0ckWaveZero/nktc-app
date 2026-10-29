'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import { alpha } from '@mui/material/styles';

interface BackupCodesRecoveryProps {
  codes: string[];
  isVisible: boolean;
  isBusy: boolean;
  onToggleVisibility: () => void;
  onDownload: () => void;
  onCopy: () => void;
}

/** แสดง backup codes โดยไม่เปิดเผยรหัสจนกว่าจะกดแสดง */
const BackupCodesRecovery = ({
  codes,
  isVisible,
  isBusy,
  onToggleVisibility,
  onDownload,
  onCopy,
}: BackupCodesRecoveryProps) => {
  return (
    <Box
      component='section'
      aria-labelledby='backup-codes-heading'
      sx={(theme) => ({
        mt: 2,
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 1.5,
        backgroundColor: alpha(theme.palette.warning.main, 0.055),
      })}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, mb: 2 }}>
        <Box
          sx={(theme) => ({
            display: 'grid',
            width: 40,
            height: 40,
            flexShrink: 0,
            placeItems: 'center',
            borderRadius: 1.5,
            color: theme.palette.warning.dark,
            backgroundColor: alpha(theme.palette.warning.main, 0.14),
          })}
        >
          <KeyRounded fontSize='small' />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography id='backup-codes-heading' variant='subtitle1' sx={{ fontWeight: 700 }}>
            รหัสสำรองสำหรับกู้คืนบัญชี
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            แต่ละรหัสใช้ได้ครั้งเดียว ควรเก็บไว้ในที่ปลอดภัย
          </Typography>
        </Box>
        <Chip size='small' label={`${codes.length} รหัส`} color='warning' variant='outlined' />
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
          รหัสสำรองพร้อมใช้งาน
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          กดแสดงรหัสเพื่ออ่านหรือดาวน์โหลดเป็นไฟล์ข้อความ แล้วเก็บไว้ในที่ปลอดภัย
        </Typography>
        <Box
          component='div'
          role='list'
          aria-label='รายการรหัสสำรอง'
          aria-hidden={!isVisible}
          sx={(theme) => ({
            display: 'grid',
            maxWidth: 500,
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 0.75,
            p: 1,
            borderRadius: 1,
            filter: isVisible ? 'none' : 'blur(6px)',
            opacity: isVisible ? 1 : 0.62,
            pointerEvents: isVisible ? 'auto' : 'none',
            userSelect: isVisible ? 'text' : 'none',
            transition: 'filter 180ms ease, opacity 180ms ease',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            '& span': {
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              textAlign: 'center',
            },
          })}
        >
          {codes.map((code) => (
            <span key={code} role='listitem'>
              {code}
            </span>
          ))}
        </Box>
        {!isVisible ? (
          <Typography variant='caption' color='text.secondary'>
            รหัสถูกซ่อนไว้ กด “แสดงรหัส” เมื่อต้องการดู
          </Typography>
        ) : null}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant='outlined'
            startIcon={isVisible ? <VisibilityOffRounded /> : <VisibilityRounded />}
            onClick={onToggleVisibility}
            disabled={isBusy}
          >
            {isVisible ? 'ซ่อนรหัส' : 'แสดงรหัส'}
          </Button>
          <Button
            variant='contained'
            startIcon={<DownloadRounded />}
            onClick={onDownload}
            disabled={isBusy || !isVisible}
          >
            ดาวน์โหลดรหัส
          </Button>
          <Button variant='text' startIcon={<ContentCopyRounded />} onClick={onCopy} disabled={isBusy || !isVisible}>
            คัดลอก
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default BackupCodesRecovery;
