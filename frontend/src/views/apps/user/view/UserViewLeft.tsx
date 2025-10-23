import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Icon from '@/@core/components/icon';
import CustomChip from '@/@core/components/mui/chip';
import CustomAvatar from '@/@core/components/mui/avatar';
import { getInitials } from '@/@core/utils/get-initials';

type UserViewLeftProps = {
  user: any;
  isLoading: boolean;
  image?: string;
  fullName: string;
};

const UserViewLeft = ({ user, isLoading, image, fullName }: UserViewLeftProps) => {
  if (!user) {
    return null;
  }

  const isTeacher = user.teacher !== null && user.teacher !== undefined;
  const isStudent = user.student !== null && user.student !== undefined;

  // Determine role display
  const roleDisplay = user.role || '-';

  // Determine department/classroom display
  const departmentDisplay = isTeacher
    ? user.teacher?.department?.name || '-'
    : isStudent
    ? user.student?.department?.name || '-'
    : '-';

  const classroomDisplay = isTeacher
    ? user.teacher?.classrooms && Array.isArray(user.teacher.classrooms) && user.teacher.classrooms.length > 0
      ? user.teacher.classrooms.map((c: any) => c.name).join(', ')
      : '-'
    : isStudent
    ? user.student?.classroom?.name || '-'
    : '-';

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            {user?.account?.avatar && image ? (
              isLoading ? (
                <CircularProgress size={120} />
              ) : (
                <CustomAvatar
                  src={image}
                  variant='rounded'
                  alt={fullName}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4 }}
                />
              )
            ) : (
              <CustomAvatar
                skin='light'
                variant='rounded'
                color='info'
                sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
              >
                {getInitials(fullName)}
              </CustomAvatar>
            )}
            <Typography variant='h6' sx={{ mb: 4 }}>
              {fullName}
            </Typography>
            <CustomChip skin='light' size='small' label={roleDisplay} color='info' sx={{ textTransform: 'capitalize' }} />
          </CardContent>

          <CardContent>
            <Typography variant='h6'>รายละเอียด</Typography>
            <Divider sx={{ my: (theme) => `${theme.spacing(4)} !important` }} />
            <Box sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>ชื่อผู้ใช้งาน:</Typography>
                <Typography variant='body2'>{user.username || '-'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>อีเมล:</Typography>
                <Typography variant='body2'>{user.email || '-'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>เบอร์โทรศัพท์:</Typography>
                <Typography variant='body2'>{user.account?.phone || '-'}</Typography>
              </Box>

              {isStudent && (
                <>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>ระดับชั้น:</Typography>
                    <Typography variant='body2'>{classroomDisplay}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>แผนกวิชา:</Typography>
                    <Typography variant='body2'>{departmentDisplay}</Typography>
                  </Box>
                </>
              )}

              {isTeacher && (
                <>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>ตำแหน่ง:</Typography>
                    <Typography variant='body2'>{user.teacher?.jobTitle || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>แผนกวิชา:</Typography>
                    <Typography variant='body2'>{departmentDisplay}</Typography>
                  </Box>
                  {classroomDisplay !== '-' && (
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>ห้องที่สอน:</Typography>
                      <Typography variant='body2'>{classroomDisplay}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>วิทยฐานะ:</Typography>
                    <Typography variant='body2'>{user.teacher?.academicStanding || '-'}</Typography>
                  </Box>
                </>
              )}

              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>สถานะ:</Typography>
                <CustomChip
                  skin='light'
                  size='small'
                  label={isTeacher && user.teacher?.status === 'true' ? 'ใช้งานอยู่' : 'ใช้งานอยู่'}
                  color='success'
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UserViewLeft;
