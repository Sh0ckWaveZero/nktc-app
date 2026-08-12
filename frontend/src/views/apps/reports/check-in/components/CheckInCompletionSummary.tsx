import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

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
      role='status'
      aria-label={`สรุปการเช็คชื่อครบ ${totalStudents} คน`}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
      }}
    >
      <Stack direction='row' spacing={1.25} sx={{ alignItems: 'center' }}>
        <CheckCircleOutlineOutlined color='success' />
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
            {hasSavedCheckIn ? 'บันทึกการเช็คชื่อครบแล้ว' : 'เช็คชื่อครบแล้ว'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            รวม {totalStudents} คน{hasSavedCheckIn ? '' : ' · พร้อมบันทึก'}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mt: 2 }}>
        {SUMMARY_ITEMS.map((item) => (
          <Stack
            key={item.key}
            direction='row'
            aria-label={`${item.label} ${counts[item.key]} คน`}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1.25,
              gridColumn: item.key === 'internship' ? '1 / -1' : 'auto',
              borderRadius: 1,
              backgroundColor: (theme) =>
                alpha(theme.palette[item.color].main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
            }}
          >
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
            <Typography variant='h6' color={`${item.color}.main`} sx={{ fontWeight: 700, lineHeight: 1 }}>
              {counts[item.key]}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

export default CheckInCompletionSummary;
