'use client';

import { Card, CardContent, Box, Typography, Button, Chip } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import RenderAvatar from '@/@core/components/avatar';

interface StudentCardProps {
  student: any;
  storedToken: string;
  status: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  isPresentCheck: any[];
  isAbsentCheck: any[];
  isLateCheck: any[];
  isLeaveCheck: any[];
  isInternshipCheck: any[];
  onCheckboxChange: (studentId: string, status: string) => void;
}

const StudentCard = ({
  student,
  storedToken,
  status,
  color,
  isPresentCheck,
  isAbsentCheck,
  isLateCheck,
  isLeaveCheck,
  isInternshipCheck,
  onCheckboxChange,
}: StudentCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Responsive configuration
  const responsiveConfig = {
    isMobile,
    isSmallMobile,
    cardPadding: isMobile ? 2 : 3,
    buttonSize: 'small' as 'small' | 'medium',
    buttonFontSize: isMobile ? '0.8rem' : '0.875rem',
    chipSize: (isMobile ? 'small' : 'medium') as 'small' | 'medium',
    chipMinWidth: isMobile ? 60 : 80,
  };

  return (
    <Card
      id={`checkin-student-card-${student.id}`}
      sx={{ mb: responsiveConfig.isSmallMobile ? 1 : 1.5, border: 1, borderColor: 'divider' }}
    >
      <CardContent
        sx={{
          p: responsiveConfig.cardPadding,
          pb: responsiveConfig.isMobile ? 2 : 2.5,
          '&.MuiCardContent-root': {
            paddingBottom: responsiveConfig.isMobile ? '16px' : '20px',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RenderAvatar row={student} storedToken={storedToken} />
          <Box sx={{ ml: responsiveConfig.isMobile ? 1.5 : 2, flex: 1 }}>
            <Typography
              id={`checkin-student-name-${student.id}`}
              variant={responsiveConfig.isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              {student.title + '' + student.firstName + ' ' + student.lastName}
            </Typography>
            <Typography id={`checkin-student-id-${student.id}`} variant='body2' color='text.secondary'>
              @{student.studentId}
            </Typography>
            <Typography id={`checkin-student-class-${student.id}`} variant='body2' color='text.secondary'>
              {student.classroom?.name || student.classroom}
            </Typography>
          </Box>
          <Chip
            id={`checkin-student-status-${student.id}`}
            label={status}
            color={color as any}
            size={responsiveConfig.chipSize}
            sx={{ minWidth: responsiveConfig.chipMinWidth }}
          />
        </Box>

        <Box
          id={`checkin-student-buttons-${student.id}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            width: '100%',
          }}
        >
          <Button
            id={`checkin-student-present-btn-${student.id}`}
            variant={isPresentCheck.includes(student.id) ? 'contained' : 'outlined'}
            color='success'
            size={responsiveConfig.buttonSize}
            onClick={() => onCheckboxChange(student.id, 'present')}
            fullWidth
            sx={{
              fontSize: responsiveConfig.buttonFontSize,
              fontWeight: 500,
            }}
          >
            มาเรียน
          </Button>
          <Button
            id={`checkin-student-absent-btn-${student.id}`}
            variant={isAbsentCheck.includes(student.id) ? 'contained' : 'outlined'}
            color='error'
            size={responsiveConfig.buttonSize}
            onClick={() => onCheckboxChange(student.id, 'absent')}
            fullWidth
            sx={{
              fontSize: responsiveConfig.buttonFontSize,
              fontWeight: 500,
            }}
          >
            ขาดเรียน
          </Button>
          <Button
            id={`checkin-student-late-btn-${student.id}`}
            variant={isLateCheck.includes(student.id) ? 'contained' : 'outlined'}
            color='warning'
            size={responsiveConfig.buttonSize}
            onClick={() => onCheckboxChange(student.id, 'late')}
            fullWidth
            sx={{
              fontSize: responsiveConfig.buttonFontSize,
              fontWeight: 500,
            }}
          >
            มาสาย
          </Button>
          <Button
            id={`checkin-student-leave-btn-${student.id}`}
            variant={isLeaveCheck.includes(student.id) ? 'contained' : 'outlined'}
            color='info'
            size={responsiveConfig.buttonSize}
            onClick={() => onCheckboxChange(student.id, 'leave')}
            fullWidth
            sx={{
              fontSize: responsiveConfig.buttonFontSize,
              fontWeight: 500,
            }}
          >
            ลา
          </Button>
          <Button
            id={`checkin-student-internship-btn-${student.id}`}
            variant={isInternshipCheck.includes(student.id) ? 'contained' : 'outlined'}
            color='secondary'
            size={responsiveConfig.buttonSize}
            onClick={() => onCheckboxChange(student.id, 'internship')}
            fullWidth
            sx={{
              fontSize: responsiveConfig.buttonFontSize,
              fontWeight: 500,
              gridColumn: '1 / -1', // Span full width across both columns
            }}
          >
            ฝึกงาน
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
