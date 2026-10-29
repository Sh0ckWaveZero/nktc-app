'use client';

import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';
import PersonOffOutlined from '@mui/icons-material/PersonOffOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import RenderAvatar from '@/@core/components/avatar';
import SHAPE_TOKENS from '@/@core/theme/tokens/shape';

const STATUS_OPTIONS = [
  { value: 'present', label: 'มาเรียน', color: 'success' as const, icon: HowToRegOutlined },
  { value: 'absent', label: 'ขาดเรียน', color: 'error' as const, icon: PersonOffOutlined },
  { value: 'late', label: 'มาสาย', color: 'warning' as const, icon: AccessTimeOutlined },
  { value: 'leave', label: 'ลา', color: 'info' as const, icon: EventNoteOutlined },
  { value: 'internship', label: 'ฝึกงาน', color: 'secondary' as const, icon: WorkOutlineOutlined },
];

interface StudentCardProps {
  student: any;
  isPresentCheck: any[];
  isAbsentCheck: any[];
  isLateCheck: any[];
  isLeaveCheck: any[];
  isInternshipCheck: any[];
  hasSavedCheckIn: boolean;
  previewStatus?: string;
  onCheckboxChange: (studentId: string, status: string) => void;
}

const StudentCard = ({
  student,
  isPresentCheck,
  isAbsentCheck,
  isLateCheck,
  isLeaveCheck,
  isInternshipCheck,
  hasSavedCheckIn,
  previewStatus,
  onCheckboxChange,
}: StudentCardProps) => {
  const isTransitioning = previewStatus !== undefined;
  const selectedStatus =
    previewStatus ??
    (isPresentCheck.includes(student.id)
      ? 'present'
      : isAbsentCheck.includes(student.id)
        ? 'absent'
        : isLateCheck.includes(student.id)
          ? 'late'
          : isLeaveCheck.includes(student.id)
            ? 'leave'
            : isInternshipCheck.includes(student.id)
              ? 'internship'
              : '');

  return (
    <Card
      id={`checkin-student-card-${student.id}`}
      sx={{
        border: 0,
        borderRadius: SHAPE_TOKENS.surface,
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          p: 2,
          '&.MuiCardContent-root': {
            pb: 2,
          },
        }}
      >
        <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <RenderAvatar row={student} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              id={`checkin-student-name-${student.id}`}
              variant='subtitle1'
              sx={{ fontWeight: 600, lineHeight: 1.35 }}
            >
              {student.title + '' + student.firstName + ' ' + student.lastName}
            </Typography>
            <Typography
              id={`checkin-student-id-${student.id}`}
              variant='body2'
              sx={{
                color: 'text.secondary',
              }}
            >
              @{student.studentId}
            </Typography>
          </Box>
        </Stack>

        <Box
          role='group'
          aria-label={`เลือกสถานะเช็คชื่อของ ${student.firstName} ${student.lastName}`}
          aria-busy={isTransitioning}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
            pointerEvents: isTransitioning ? 'none' : 'auto',
          }}
        >
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatus === option.value;
            const StatusIcon = option.icon;

            return (
              <Button
                key={option.value}
                id={`checkin-student-${option.value}-btn-${student.id}`}
                variant={isSelected ? 'contained' : 'outlined'}
                color={option.color}
                disabled={hasSavedCheckIn}
                aria-pressed={isSelected}
                startIcon={<StatusIcon fontSize='small' />}
                onClick={() => onCheckboxChange(student.id, isSelected ? '' : option.value)}
                sx={{
                  minWidth: 0,
                  minHeight: 44,
                  px: 1,
                  borderRadius: SHAPE_TOKENS.control,
                  gridColumn: option.value === 'internship' ? '1 / -1' : 'auto',
                  backgroundColor: (theme) =>
                    isSelected
                      ? undefined
                      : alpha(theme.palette[option.color].main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
                  borderColor: (theme) =>
                    isSelected
                      ? undefined
                      : alpha(theme.palette[option.color].main, theme.palette.mode === 'dark' ? 0.64 : 0.4),
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transform: isSelected && isTransitioning ? 'scale(1.025)' : 'scale(1)',
                  '& .MuiButton-startIcon': {
                    ml: 0,
                    mr: 0.75,
                  },
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'border-color', 'transform'], { duration: 160 }),
                  '&:hover': {
                    backgroundColor: (theme) =>
                      isSelected
                        ? undefined
                        : alpha(theme.palette[option.color].main, theme.palette.mode === 'dark' ? 0.24 : 0.14),
                    borderColor: `${option.color}.main`,
                  },
                  '&:active': { transform: 'scale(0.96)' },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:active': { transform: 'none' },
                  },
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
