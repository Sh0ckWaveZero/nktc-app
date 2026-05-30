import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';

import { calculateTimeAgo } from '@/utils/datetime';
import useImageQuery from '@/hooks/useImageQuery';
import IconifyIcon from '@/@core/components/icon';

interface Props {
  info: any[];
  user: any;
  onDeleted?: (id: string) => void;
}

interface ImageDisplayProps {
  image: string;
}

const ImageDisplay = ({ image }: ImageDisplayProps) => {
  const { isLoading, image: goodnessImage } = useImageQuery(image);

  return isLoading ? (
    <CircularProgress size={24} />
  ) : goodnessImage ? (
    <div
      role='button'
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={() => window.open(goodnessImage, '_blank')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') window.open(goodnessImage, '_blank');
      }}
    >
      <Avatar alt='บันทึกความดี' src={goodnessImage as any} sx={{ width: '5.5rem', height: '5.5rem' }} />
    </div>
  ) : (
    <Typography variant='subtitle2' sx={{ fontWeight: 400, color: 'text.primary' }}>
      ไม่มีรูปภาพ
    </Typography>
  );
};

const TimelineGoodness = ({ info, user, onDeleted }: Props) => {
  const infoArray = Array.isArray(info) ? info : info ? [info] : [];

  if (infoArray.length === 0) {
    return (
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant='body2' sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                ไม่พบข้อมูลความดี
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader title='บันทึกความดี' slotProps={{ title: { variant: 'h6' } }} />
          <CardContent>
            <Timeline
              sx={{
                margin: 0,
                padding: 0,
                marginLeft: 0.75,
                paddingBottom: 3,
                '& .MuiTimelineItem-root': {
                  '&:before': { display: 'none' },
                  '&:last-child': { minHeight: 60 },
                },
              }}
            >
              {infoArray.map((record: any) => (
                <TimelineItem key={record?.id}>
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
                        {record?.goodnessDetail}
                      </Typography>
                      <Typography variant='caption' suppressHydrationWarning>
                        {record?.goodDate ? calculateTimeAgo(new Date(record?.goodDate)) : ''}
                      </Typography>
                    </Box>
                    <Typography variant='body2' suppressHydrationWarning>
                      {`ความดี ${record?.goodnessScore} คะแนน `}
                      {record?.goodDate
                        ? `ณ ${new Date(record?.goodDate).toLocaleTimeString('th-TH', {
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
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ width: 200, height: 'auto' }}>
                        <ImageDisplay image={record?.image} />
                      </Box>
                      {user?.role === 'Admin' && (
                        <Box sx={{ ml: 2 }}>
                          <Tooltip title='ลบการบันทึกความดี'>
                            <Button
                              size='small'
                              variant='outlined'
                              color='error'
                              startIcon={<IconifyIcon icon='fluent:delete-off-24-regular' />}
                              onClick={() => onDeleted?.(record?.id)}
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

export default TimelineGoodness;
