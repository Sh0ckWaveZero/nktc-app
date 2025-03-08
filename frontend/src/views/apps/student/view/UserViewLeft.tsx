// ** React Imports
import { Fragment } from 'react';

// ** MUI Imports
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

// ** Icon Imports
import Icon from '@/@core/components/icon';

// ** Custom Components
import CustomChip from '@/@core/components/mui/chip';
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Types

// ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';
import { CircularProgress } from '@mui/material';
import { isEmpty } from '@/@core/utils/utils';

type PropsTypes = {
  user: any;
  trophyOverview: any;
  teacherClassroom: any;
  isLoading: boolean;
  image: any;
  fullName: string;
  classroomName: string;
};

const UserViewLeft = ({
  classroomName,
  fullName,
  image,
  isLoading,
  teacherClassroom,
  trophyOverview,
  user,
}: PropsTypes) => {
  if (user) {
    return (
      <Fragment>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                {user?.account?.avatar ? (
                  isLoading ? (
                    <CircularProgress size={120} />
                  ) : (
                    <CustomAvatar
                      src={image as string}
                      variant='rounded'
                      alt={fullName}
                      sx={{ width: 120, height: 120, fontWeight: 600, mb: 4 }}
                    />
                  )
                ) : (
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    color={'info'}
                    sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                  >
                    {getInitials(user?.account?.firstName + ' ' + user?.account?.lastName)}
                  </CustomAvatar>
                )}
                <Typography variant='h6' sx={{ mb: 4 }}>
                  {fullName}
                </Typography>
                <CustomChip
                  skin='light'
                  size='small'
                  label={user.role}
                  color={'info'}
                  sx={{ textTransform: 'capitalize' }}
                />
              </CardContent>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 4 }}>
                    <CustomAvatar
                      skin='light'
                      variant='rounded'
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 2,
                      }}
                    >
                      <Icon icon='fluent-emoji:trophy' style={{ width: '60px', height: '60px' }} />
                    </CustomAvatar>
                    <Typography variant='h3'>{trophyOverview?.totalTrophy || 0}</Typography>
                    <Typography variant='body2'>โล่</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                    <CustomAvatar skin='light' variant='rounded' sx={{ mr: 4, width: 44, height: 44 }}>
                      <Icon icon='mdi:star-outline' />
                    </CustomAvatar>
                    <div>
                      <Typography variant='h5'>
                        {trophyOverview?.goodScore > 0 ? `+${trophyOverview?.goodScore}` : 0}
                      </Typography>
                      <Typography variant='body2'>ความดี</Typography>
                    </div>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CustomAvatar skin='light' variant='rounded' sx={{ mr: 4, width: 44, height: 44 }}>
                      <Icon icon='mingcute:thumb-down-line' />
                    </CustomAvatar>
                    <div>
                      <Typography variant='h5'>
                        {trophyOverview?.badScore > 0 ? `-${trophyOverview?.badScore}` : 0}
                      </Typography>
                      <Typography variant='body2'>พฤติกรรม</Typography>
                    </div>
                  </Box>
                </Box>
              </CardContent>

              <CardContent>
                <Typography variant='h6'>รายละเอียด</Typography>
                <Divider sx={{ my: (theme) => `${theme.spacing(4)} !important` }} />
                <Box sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>ชื่อผู้ใช้งาน:</Typography>
                    <Typography variant='body2'>{user.username}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>ระดับชั้น:</Typography>
                    <Typography variant='body2'>{classroomName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>อาจารย์ที่ปรึกษา:</Typography>
                    <Typography variant='body2'>
                      {isEmpty(teacherClassroom)
                        ? '-'
                        : teacherClassroom.map((item: any, index: number) =>
                            index === teacherClassroom.length - 1
                              ? item.account.title + item.account.firstName + ' ' + item.account.lastName
                              : item.account.title + item.account.firstName + ' ' + item.account.lastName + ', ',
                          )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fragment>
    );
  } else {
    return null;
  }
};

export default UserViewLeft;
