import { Avatar, Box, Card, CardContent, CardHeader, Typography, Button, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import Timeline from '@mui/lab/Timeline';
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';

import { CircularProgress } from '@mui/material';
import { calculateTimeAgo } from '@/utils/datetime';
import useImageQuery from '@/hooks/useImageQuery';
import IconifyIcon from '@/@core/components/icon';
import { getStudentName } from '@/utils/student';

interface Props {
  info: any[];
  user: any;
  onDeleted?: (id: string) => void;
}

interface ImageDisplayProps {
  image: string;
}

const ImageDisplay = ({ image }: ImageDisplayProps) => {
  const { isLoading, image: badnessImage } = useImageQuery(image);

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

const TimelineGoodness = ({ info, user, onDeleted }: Props) => {
  // Handle both single object and array formats
  const goodnessRecord = Array.isArray(info) ? info[0] : info;
  const isEmpty = !goodnessRecord;

  console.log('TimelineGoodness rendered with info:', info);
  console.log('TimelineGoodness - isEmpty:', isEmpty);
  console.log('TimelineGoodness - goodnessRecord:', goodnessRecord);

  // Get student name from the goodness record
  const getStudentDisplayName = () => {
    console.log('getStudentDisplayName - goodnessRecord:', goodnessRecord);
    console.log('getStudentDisplayName - goodnessRecord.student:', goodnessRecord?.student);

    if (goodnessRecord?.student) {
      const studentData = goodnessRecord.student;
      console.log('getStudentDisplayName - studentData:', studentData);
      console.log('getStudentDisplayName - studentData.user:', studentData.user);
      console.log('getStudentDisplayName - studentData.user?.account:', studentData.user?.account);

      const name = getStudentName(studentData);
      console.log('getStudentDisplayName - calculated name:', name);
      return name;
    }
    return 'ไม่ระบุชื่อ';
  };

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardHeader
            title={`รายละเอียดความดี - ${getStudentDisplayName()}`}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            {isEmpty ? (
              <Typography variant='body2' sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                ไม่พบข้อมูลความดี
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  รายละเอียดความดี
                </Typography>
                {/* @ts-expect-error - React 19 type compatibility issue with MUI Lab */}
                <Timeline
                  sx={{
                    margin: 0,
                    padding: 0,
                    marginLeft: 0.75,
                    paddingBottom: 3,
                    '& .MuiTimelineItem-root': {
                      '&:before': {
                        display: 'none',
                      },
                      '&:last-child': {
                        minHeight: 60,
                      },
                    },
                  }}
                >
                  <TimelineItem key={goodnessRecord?.id || 'timeline-item'}>
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
                          {goodnessRecord?.goodnessDetail}
                        </Typography>
                        <Typography variant='caption'>
                          {goodnessRecord?.goodDate ? calculateTimeAgo(new Date(goodnessRecord?.goodDate)) : ''}
                        </Typography>
                      </Box>
                      <Typography variant='body2'>
                        {`ความดี ${goodnessRecord?.goodnessScore} คะแนน `}
                        {goodnessRecord?.goodDate
                          ? `ณ ${new Date(goodnessRecord?.goodDate).toLocaleTimeString('th-TH', {
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
                        <Box sx={{ width: 200, height: 'auto' }}>
                          <ImageDisplay image={goodnessRecord?.image} />
                        </Box>
                        {user?.role === 'Admin' && (
                          <Box sx={{ ml: 2 }}>
                            <Tooltip title='ลบการบันทึกความดี'>
                              <Button
                                size='small'
                                variant='outlined'
                                color='error'
                                startIcon={<IconifyIcon icon={'fluent:delete-off-24-regular'} />}
                                onClick={() => onDeleted?.(goodnessRecord?.id)}
                              >
                                ลบบันทึก
                              </Button>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
            </Timeline>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TimelineGoodness;
