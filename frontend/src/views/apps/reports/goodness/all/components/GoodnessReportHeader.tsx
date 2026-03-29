import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { HiStar } from 'react-icons/hi';
import Icon from '@/@core/components/icon';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

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
        px: isMobile ? 5 : 6,
        pt: isMobile ? 5 : 6,
        pb: 2,
        backgroundColor: 'transparent',
      }}
    >
      <Box 
        id='goodness-report-header-content' 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4,
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left'
        }}
      >
        <Box
          id='goodness-report-header-icon-container'
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: (theme) => hexToRGBA(theme.palette.warning.main, 0.12),
            color: 'warning.main',
            display: 'flex',
            boxShadow: (theme) => `0 4px 12px ${hexToRGBA(theme.palette.warning.main, 0.2)}`
          }}
        >
          <HiStar fontSize='2rem' />
        </Box>
        <Box id='goodness-report-header-info' sx={{ flex: 1 }}>
          <Typography
            id='goodness-report-title'
            variant='h5'
            sx={{ 
              fontWeight: 800, 
              mb: 1, 
              letterSpacing: -1,
              color: 'text.primary'
            }}
          >
            รายงานสรุปผลการบันทึกความดี
          </Typography>
          <Box
            id='goodness-report-subtitle'
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {selectedClassroomName && (
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: (theme) => hexToRGBA(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}
              >
                ชั้น {selectedClassroomName}
              </Box>
            )}
            
            <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', fontWeight: 500 }}>
              <Box component='span' sx={{ display: 'flex' }}><Icon icon='mdi:account-group-outline' fontSize='1.1rem' /></Box>
              จำนวน {totalItems} รายการ
            </Typography>

            {selectedDate && (
              <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', fontWeight: 500 }}>
                <Box component='span' sx={{ display: 'flex' }}><Icon icon='mdi:calendar-check-outline' fontSize='1.1rem' /></Box>
                {selectedDate instanceof Date
                  ? selectedDate.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </Typography>
            )}
          </Box>
          {!selectedClassroomName && !selectedDate && (
            <Typography 
              id='goodness-report-hint' 
              variant='caption' 
              sx={{ 
                mt: 1, 
                display: 'block', 
                color: 'text.disabled',
                fontStyle: 'italic'
              }}
            >
              * กรุณาเลือกเงื่อนไขการค้นหาเพื่อแสดงข้อมูลที่ต้องการ
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

