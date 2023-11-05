import { Avatar, Box, Card, CardContent, CardHeader, Grid, Typography, styled, Tooltip, Button } from '@mui/material';
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';

import { CircularProgress } from '@mui/material';
import { calculateTimeAgo } from 'utils/datetime';
import useGetImage from '@/hooks/useGetImage';
import IconifyIcon from '@/@core/components/icon';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Props {
  info: any[];
  user: any;
  onDeleted?: (id: string) => void;
}

const getImage = (image: string) => {
  const useLocal = useLocalStorage();
  const storedToken = useLocal.getToken()!;

  const { isLoading, image: badnessImage } = useGetImage(image, storedToken);

  return isLoading ? (
    <CircularProgress />
  ) : badnessImage ? (
    <div
      style={{
        cursor: 'pointer',
      }}
      onClick={() => {
        window.open(badnessImage, '_blank');
      }}
    >
      <Avatar alt='บันทึกความดี' src={badnessImage as any} sx={{ width: '5.5rem', height: '5.5rem' }} />
    </div>
  ) : (
    <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary', textDecoration: 'none' }}>
      ไม่มีรูปภาพ
    </Typography>
  );
};

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>(({ theme }) => ({
  margin: 0,
  padding: 0,
  marginLeft: theme.spacing(0.75),
  '& .MuiTimelineItem-root': {
    '&:before': {
      display: 'none',
    },
    '&:last-child': {
      minHeight: 60,
    },
  },
}));

const TimelineBadness = ({ info, user, onDeleted }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='รายละเอียคความประพฤติ' />
          <CardContent>
            <Timeline
              sx={{
                paddingBottom: 3,
              }}
            >
              {info.map((item, index) => (
                <TimelineItem key={item?.id}>
                  <TimelineSeparator>
                    <TimelineDot color='error' />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box
                      sx={{
                        mb: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant='body2' sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
                        {item?.badnessDetail}
                      </Typography>
                      <Typography variant='caption'>
                        {item?.badDate ? calculateTimeAgo(new Date(item?.badDate)) : ''}
                      </Typography>
                    </Box>
                    <Typography variant='body2'>
                      {`ความประพฤติ ${item?.badnessScore} คะแนน `}
                      {item?.badDate
                        ? `ณ ${new Date(item?.badDate).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}น.`
                        : ''}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignContent: 'space-between',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ width: 200, height: 'auto' }}>{getImage(item?.image)}</Box>
                      {user?.role === 'Admin' && (
                        <Box sx={{ ml: 2 }}>
                          <Tooltip title='ลบการบันทึกความประพฤติ'>
                            <Button
                              size='small'
                              variant='outlined'
                              color='error'
                              startIcon={<IconifyIcon icon={'fluent:delete-off-24-regular'} />}
                              onClick={() => onDeleted?.(item?.id)}
                            >
                              ลบบันทึก
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TimelineBadness;
