'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconifyIcon from '@/@core/components/icon';
import { WelcomeCard } from '../styles';

interface WelcomeBannerProps {
  user: any;
  classroomNames: string;
  isAdmin: boolean;
  greetingText: string;
}

const WelcomeBanner = ({ user, classroomNames, isAdmin, greetingText }: WelcomeBannerProps) => {
  return (
    <WelcomeCard>
      <Box sx={{ p: { xs: 6, sm: 8 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
              <Avatar
                alt={user?.account?.firstName || 'Teacher'}
                src={user?.account?.avatar || ''}
                sx={{
                  width: { xs: 60, md: 80 },
                  height: { xs: 60, md: 80 },
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)',
                }}
              >
                {user?.account?.firstName?.[0] || 'T'}
              </Avatar>
              <Box>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 700,
                    color: 'common.white',
                    mb: 1,
                    fontSize: { xs: '1.25rem', sm: '1.75rem' },
                  }}
                >
                  {greetingText}, ครู{user?.account?.firstName || 'ผู้ดูแลระบบ'}{' '}
                  {user?.account?.lastName || ''}
                </Typography>
                <Typography
                  variant='subtitle1'
                  sx={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <IconifyIcon icon='solar:backpack-bold-duotone' />
                  {classroomNames ? (
                    <span>
                      ครูที่ปรึกษาประจำชั้นห้อง <b>{classroomNames}</b> แผนก
                      {user?.teacher?.department?.name || 'ช่างอุตสาหกรรม/บริหารธุรกิจ'}
                    </span>
                  ) : (
                    <span>
                      {isAdmin
                        ? 'ผู้ดูแลระบบ NKTC (ภาพรวมวิทยาลัย)'
                        : 'ครูผู้สอน / บุคลากรวิทยาลัยเทคนิคหนองคาย'}
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '600px' }}>
              ยินดีต้อนรับเข้าสู่ระบบจัดการสถานศึกษาอัจฉริยะ NKTC
              แดชบอร์ดนี้ออกแบบขึ้นเพื่อสนับสนุนการติดตามพฤติกรรม สถิติความก้าวหน้า และการเข้าชั้นเรียนของนักเรียน
              เพื่อความร่วมมือพัฒนาทักษะและการศึกษาที่ดีขึ้นอย่างต่อเนื่อง
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', md: 'flex-end' },
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Paper
                sx={{
                  p: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'common.white',
                  textAlign: 'right',
                  width: '100%',
                  maxWidth: '280px',
                }}
              >
                <Typography
                  variant='caption'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  ภาคเรียนปัจจุบัน
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 700, mt: 1, color: 'common.white' }}>
                  1/2569
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  วันศุกร์ที่ 22 พฤษภาคม 2569
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </WelcomeCard>
  );
};

export default WelcomeBanner;
