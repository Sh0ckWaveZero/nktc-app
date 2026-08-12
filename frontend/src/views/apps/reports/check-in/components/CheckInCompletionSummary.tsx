/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 */
/* Hallmark · component: check-in completion summary · genre: modern-minimal · theme: NKTC
 * state: success
 * contrast: pass (46–50)
 */

import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import SHAPE_TOKENS from '@/@core/theme/tokens/shape';

interface CheckInCompletionSummaryProps {
  totalStudents: number;
  hasSavedCheckIn: boolean;
  counts: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    internship: number;
  };
}

const SUMMARY_ITEMS = [
  { key: 'present', label: 'มาเรียน', color: 'success' as const },
  { key: 'absent', label: 'ขาดเรียน', color: 'error' as const },
  { key: 'late', label: 'มาสาย', color: 'warning' as const },
  { key: 'leave', label: 'ลา', color: 'info' as const },
  { key: 'internship', label: 'ฝึกงาน', color: 'secondary' as const },
] as const;

const CheckInCompletionSummary = ({ totalStudents, hasSavedCheckIn, counts }: CheckInCompletionSummaryProps) => {
  return (
    <Box
      id='checkin-completion-summary'
      role='status'
      aria-label={`สรุปการเช็คชื่อครบ ${totalStudents} คน`}
      sx={(theme) => ({
        mb: 2,
        overflow: 'hidden',
        borderRadius: SHAPE_TOKENS.surface,
        backgroundColor: 'background.paper',
        boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.28 : 0.1)}`,
      })}
    >
      <Stack
        direction='row'
        spacing={1.5}
        sx={(theme) => ({
          alignItems: 'center',
          px: 2,
          py: 1.75,
          backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.14 : 0.09),
        })}
      >
        <Box
          sx={(theme) => ({
            display: 'grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: SHAPE_TOKENS.circle,
            color: theme.palette.getContrastText(theme.palette.success.main),
            backgroundColor: 'success.main',
          })}
        >
          <CheckCircleOutlineOutlined fontSize='small' />
        </Box>
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            สรุปการเช็คชื่อ
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {hasSavedCheckIn ? 'บันทึกแล้ว' : 'เช็คครบแล้ว · พร้อมบันทึก'} · รวม {totalStudents} คน
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {SUMMARY_ITEMS.map((item, index) => (
          <Stack
            key={item.key}
            direction='row'
            aria-label={`${item.label} ${counts[item.key]} คน`}
            sx={(theme) => ({
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              px: 2,
              py: 1.5,
              gridColumn: item.key === 'internship' ? '1 / -1' : 'auto',
              borderBlockStart: index >= 2 ? `1px solid ${theme.palette.divider}` : 0,
              borderInlineEnd: index % 2 === 0 && item.key !== 'internship' ? `1px solid ${theme.palette.divider}` : 0,
            })}
          >
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box
                aria-hidden='true'
                sx={{
                  width: 8,
                  height: 8,
                  flexShrink: 0,
                  borderRadius: SHAPE_TOKENS.circle,
                  backgroundColor: `${item.color}.main`,
                }}
              />
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {item.label}
              </Typography>
            </Stack>
            <Typography
              variant='h6'
              sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
            >
              {counts[item.key]}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

export default CheckInCompletionSummary;
