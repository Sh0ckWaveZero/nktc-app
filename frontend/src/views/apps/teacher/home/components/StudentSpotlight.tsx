'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import IconifyIcon from '@/@core/components/icon';
import type { StudentAlerts } from '../hooks/useTeacherDashboard';
import { RiskAvatar, StarAvatar } from '../styles';

interface StudentSpotlightProps {
  studentAlerts: StudentAlerts;
}

const StudentSpotlight = ({ studentAlerts }: StudentSpotlightProps) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            ระบบดูแลช่วยเหลือนักเรียน (Student Spotlight & Alerts)
          </Typography>
        }
        subheader='แจ้งเตือนนักเรียนกลุ่มเสี่ยง และเชิดชูนักเรียนผลงานยอดเยี่ยมประจำห้องเรียน'
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography
          variant='subtitle2'
          sx={{ fontWeight: 700, color: 'error.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <IconifyIcon icon='solar:bell-bing-bold-duotone' />
          นักเรียนกลุ่มเสี่ยงที่ต้องติดตามดูแลอย่างใกล้ชิด ({studentAlerts.alerts.length} คน)
        </Typography>

        {studentAlerts.alerts.length === 0 ? (
          <Paper
            variant='outlined'
            sx={{
              p: 6,
              mb: 3,
              textAlign: 'center',
              borderColor: 'success.light',
              backgroundColor: alpha(theme.palette.success.main, 0.02),
              borderRadius: 2,
            }}
          >
            <Typography
              variant='subtitle1'
              sx={{
                color: 'success.main',
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <IconifyIcon icon='solar:check-circle-bold-duotone' style={{ fontSize: '1.5rem' }} />
              ชั้นเรียนมีความประพฤติดีเยี่ยม!
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              ไม่พบนักเรียนกลุ่มเสี่ยงที่มีคะแนนความประพฤติต่ำกว่าเกณฑ์ในขณะนี้
            </Typography>
          </Paper>
        ) : (
          studentAlerts.alerts.map((student) => (
            <Paper
              key={student.id}
              variant='outlined'
              sx={{
                p: 3,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: 'error.light',
                backgroundColor: alpha(theme.palette.error.main, 0.01),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <RiskAvatar>
                  {student.name.substring(student.name.indexOf(' ') + 1, student.name.indexOf(' ') + 3)}
                </RiskAvatar>
                <Box>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    {student.name}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    รหัสนักเรียน {student.studentId}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant='caption'
                  sx={{ color: 'error.main', fontWeight: 600, display: 'block', mb: 1 }}
                >
                  {student.reason}
                </Typography>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  onClick={() => router.push(`/apps/student/list?q=${student.studentId}`)}
                  sx={{ py: 0.5, px: 2, fontSize: '0.75rem', borderRadius: 4 }}
                >
                  ช่วยประสาน
                </Button>
              </Box>
            </Paper>
          ))
        )}

        <Divider sx={{ my: 4 }} />

        <Typography
          variant='subtitle2'
          sx={{ fontWeight: 700, color: 'success.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <IconifyIcon icon='solar:cup-bold-duotone' />
          ดาวเด่นความประพฤติยอดเยี่ยมประจำห้องเรียน 🌟
        </Typography>

        {studentAlerts.outstanding.length === 0 ? (
          <Paper
            variant='outlined'
            sx={{
              p: 6,
              textAlign: 'center',
              borderColor: 'warning.light',
              backgroundColor: alpha(theme.palette.warning.main, 0.02),
              borderRadius: 2,
            }}
          >
            <Typography
              variant='subtitle1'
              sx={{
                color: 'warning.main',
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <IconifyIcon icon='solar:cup-bold-duotone' style={{ fontSize: '1.5rem' }} />
              ห้องเรียนนี้ยังไม่มีการสะสมคะแนนความดี
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              เนื่องจากนักเรียนทุกคนในความดูแลเริ่มสะสมความดีด้วยคะแนนมาตรฐาน 100 คะแนน
              และยังไม่มีบันทึกข้อมูลความดีเพิ่มเติมในภาคเรียนนี้
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {studentAlerts.outstanding.map((student, idx) => (
              <Grid size={12} key={student.id}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderColor: 'warning.light',
                    backgroundColor: alpha(theme.palette.warning.main, 0.01),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <StarAvatar>{idx + 1}🏆</StarAvatar>
                    <Box>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        {student.name}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        รหัส {student.studentId}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant='subtitle2' sx={{ color: 'warning.main', fontWeight: 700 }}>
                      +{student.goodnessScore} แต้ม ({student.goodnessCount} ครั้ง)
                    </Typography>
                    <Button
                      size='small'
                      variant='text'
                      color='warning'
                      onClick={() => router.push(`/apps/student/list?q=${student.studentId}`)}
                      sx={{ py: 0.5, px: 2, fontSize: '0.75rem' }}
                    >
                      ดูความดี
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentSpotlight;
