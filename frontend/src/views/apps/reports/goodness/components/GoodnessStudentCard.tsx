'use client';

import { Card, CardContent, Box, Typography, Button, Chip } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import RenderAvatar from '@/@core/components/avatar';
import IconifyIcon from '@/@core/components/icon';

interface GoodnessStudentCardProps {
  student: any;
  onDetailClick: (info: any) => void;
}

const GoodnessStudentCard = ({ student, onDetailClick }: GoodnessStudentCardProps) => {
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
  };

  // Get student name
  const getStudentName = () => {
    if (student.title && student.firstName) {
      return `${student.title}${student.firstName}`;
    }
    if (student.account) {
      const { title = '', firstName = '', lastName = '' } = student.account;
      return `${title}${firstName} ${lastName}`.trim();
    }
    if (student.fullName) {
      return `${student.title || ''}${student.fullName}`;
    }
    return 'ไม่ระบุชื่อ';
  };

  // Get student ID
  const getStudentId = () => {
    return student.studentId || student.id || '';
  };

  // Get classroom name
  const getClassroomName = () => {
    return student.name || student.classroomName || student.classroom?.name || 'ไม่ระบุ';
  };

  // Get score
  const getScore = () => {
    return student.goodnessScore || student.score || 0;
  };

  return (
    <Card
      id={`goodness-student-card-${student.id || student.studentId}`}
      sx={{
        mb: responsiveConfig.isSmallMobile ? 1 : 1.5,
        border: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
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
          <RenderAvatar row={student} />
          <Box sx={{ ml: responsiveConfig.isMobile ? 1.5 : 2, flex: 1 }}>
            <Typography
              id={`goodness-student-name-${student.id || student.studentId}`}
              variant={responsiveConfig.isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              {getStudentName()}
            </Typography>
            <Typography
              id={`goodness-student-id-${student.id || student.studentId}`}
              variant='body2'
              color='text.secondary'
            >
              @{getStudentId()}
            </Typography>
            <Typography
              id={`goodness-student-class-${student.id || student.studentId}`}
              variant='body2'
              color='text.secondary'
            >
              {getClassroomName()}
            </Typography>
          </Box>
          <Chip
            id={`goodness-student-score-${student.id || student.studentId}`}
            label={`${getScore()} คะแนน`}
            color='warning'
            size={responsiveConfig.chipSize}
            sx={{
              minWidth: { xs: 80, sm: 100 },
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          />
        </Box>

        <Box
          id={`goodness-student-actions-${student.id || student.studentId}`}
          sx={{
            display: 'flex',
            gap: 1,
            width: '100%',
          }}
        >
          <Button
            id={`goodness-student-detail-btn-${student.id || student.studentId}`}
            variant='contained'
            color='success'
            size={responsiveConfig.buttonSize}
            onClick={() => onDetailClick(student.info || student)}
            fullWidth
            startIcon={<IconifyIcon icon={'mdi:timeline-check-outline'} width={18} height={18} />}
            sx={{
              fontSize: responsiveConfig.buttonFontSize,
              fontWeight: 500,
            }}
          >
            รายละเอียด
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoodnessStudentCard;

