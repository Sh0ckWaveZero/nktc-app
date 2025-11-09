import { Avatar, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { HiStar } from 'react-icons/hi';

interface GoodnessReportHeaderProps {
  selectedClassroomName: string | null;
  selectedDate: Date | null;
  totalItems: number;
}

export const GoodnessReportHeader = ({
  selectedClassroomName,
  selectedDate,
  totalItems,
}: GoodnessReportHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  return (
    <Box
      id='goodness-report-header'
      sx={{
        p: isMobile ? 3.5 : 3,
        pb: isMobile ? 2.5 : 2,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box id='goodness-report-header-content' sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar id='goodness-report-header-avatar' sx={{ bgcolor: 'warning.main', mt: 0.5 }}>
          <HiStar
            id='goodness-report-header-icon'
            style={{
              color: '#fff',
              fontSize: '24px',
            }}
          />
        </Avatar>
        <Box id='goodness-report-header-info' sx={{ flex: 1 }}>
          <Typography
            id='goodness-report-title'
            variant='h6'
            component='div'
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            รายงานการบันทึกความดี
          </Typography>
          <Typography
            id='goodness-report-subtitle'
            variant='body2'
            sx={{
              color: theme.palette.customColors.headerText,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.5,
              flexWrap: 'wrap',
            }}
          >
            {selectedClassroomName && (
              <>
                <Box
                  id='goodness-report-classroom-name'
                  component='span'
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  ชั้น {selectedClassroomName}
                </Box>
                <Box component='span' sx={{ color: theme.palette.customColors.headerText }}>
                  •
                </Box>
              </>
            )}
            <Box id='goodness-report-student-count' component='span'>
              จำนวน {totalItems} รายการ
            </Box>
            {selectedDate && (
              <>
                <Box component='span' sx={{ color: theme.palette.customColors.headerText }}>
                  •
                </Box>
                <Box id='goodness-report-date' component='span'>
                  {selectedDate instanceof Date
                    ? selectedDate.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : ''}
                </Box>
              </>
            )}
          </Typography>
          {!selectedClassroomName && !selectedDate && (
            <Typography id='goodness-report-hint' variant='body2' sx={{ color: theme.palette.customColors.headerText }}>
              กรุณาเลือกเงื่อนไขการค้นหา
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

