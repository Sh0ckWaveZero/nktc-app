// ** React Imports
import { useState, useEffect, Fragment } from 'react';

// ** MUI Imports
import { Box, Button, Card, CardContent, Divider, Grid, styled, Tooltip, Typography } from '@mui/material';

// ** Icon Imports
import Icon from '@/@core/components/icon';

// ** Custom Components
import CustomChip from '@/@core/components/mui/chip';
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Types
import { ThemeColor } from '@/@core/layouts/types';

// ** Utils Import
import { getInitials } from '@/@core/utils/get-initials';
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import { LocalStorageService } from '@/services/localStorageService';
import { CircularProgress } from '@mui/material';
import { useStudentStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import { isEmpty } from '@/@core/utils/utils';
import CardAward from './CardAward';

const localStorage = new LocalStorageService();
const accessToken = localStorage.getToken()!;

const UserViewLeft = () => {
  const { user }: any = useAuth();
  const { getTrophyOverview, getTeacherClassroom }: any = useStudentStore(
    (state) => ({
      getTrophyOverview: state.getTrophyOverview,
      getTeacherClassroom: state.getTeacherClassroom,
    }),
    shallow,
  );

  const [trophyOverview, setTrophyOverview] = useState<any>(null);
  const [teacherClassroom, setTeacherClassroom] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const fullName = user?.account?.title + '' + user?.account?.firstName + ' ' + user?.account?.lastName;
  const classroomName = user?.student?.classroom?.name;

  const { isLoading, image } = useGetImage(user?.account?.avatar as string, accessToken as string);

  const getTrophyOverviewData = async () => {
    const data = await getTrophyOverview(accessToken, user?.student?.id);
    setTrophyOverview(data);
  };

  const getTeacherClassroomData = async () => {
    const data = await getTeacherClassroom(accessToken, user?.student?.classroom?.id);
    setTeacherClassroom(data);
  };

  useEffect(() => {
    getTrophyOverviewData();
    getTeacherClassroomData();

    return () => {
      setTrophyOverview(null);
      setTeacherClassroom([]);
    };
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (user) {
    return (
      <Fragment>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                    <Tooltip
                      title={
                        trophyOverview?.totalTrophy === 0 ? '' : 'คลิกเพื่อดูรายละเอียดของเกียรติบัตรความประพฤติดี'
                      }
                      placement='bottom'
                      arrow
                    >
                      <div>
                        <Button
                          onClick={handleClickOpen}
                          disabled={trophyOverview?.totalTrophy === 0}
                          sx={{
                            // disable hover effect
                            '&:hover': { backgroundColor: 'transparent' },
                            // disable focus effect
                            '&:focus': { backgroundColor: 'transparent' },
                            // disable active effect
                            '&:active': { backgroundColor: 'transparent' },
                            // disable selected effect
                            '&.Mui-selected': { backgroundColor: 'transparent' },
                            // disable focus visible effect
                            '&.Mui-focusVisible': { backgroundColor: 'transparent' },
                          }}
                        >
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
                        </Button>
                      </div>
                    </Tooltip>
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
                              ? item.account.firstName + ' ' + item.account.lastName
                              : item.account.firstName + ' ' + item.account.lastName + ', ',
                          )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {open && (
          <CardAward
            open={open}
            handleClose={handleClose}
            trophyOverview={trophyOverview?.totalTrophy}
            goodScore={trophyOverview?.goodScore}
          />
        )}
      </Fragment>
    );
  } else {
    return null;
  }
};

export default UserViewLeft;
