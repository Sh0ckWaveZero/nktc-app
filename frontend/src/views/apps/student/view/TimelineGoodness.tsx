
import { Avatar, Box, Card, CardContent, CardHeader, Grid, Typography, styled } from '@mui/material';
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';

import { CircularProgress } from '@mui/material';
import { LocalStorageService } from '@/services/localStorageService';
import { calculateTimeAgo } from 'utils/datetime';
import useGetImage from '@/hooks/useGetImage';

interface Props {
  info: any[];
}
const localStorageService = new LocalStorageService();
const storedToken = localStorageService.getToken()!;

const getImage = (image: string) => {
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

const TimelineGoodness = ({ info }: Props) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='รายละเอียคความดี' />
          <CardContent>
            <Timeline>
              {info.map((item, index) => (
                <TimelineItem key={item?.id}>
                  <TimelineSeparator>
                    <TimelineDot color='success' />
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
                        {item?.goodnessDetail}
                      </Typography>
                      <Typography variant='caption'>
                        {item?.goodDate ? calculateTimeAgo(new Date(item?.goodDate)) : ''}
                      </Typography>
                    </Box>
                    <Typography variant='body2'>
                      {`ความดี ${item?.goodnessScore} คะแนน `}
                      {item?.goodDate
                        ? `ณ ${new Date(item?.goodDate).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}น.`
                        : ''}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 200, height: 'auto' }}>{getImage(item?.image)}</Box>
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

export default TimelineGoodness;
