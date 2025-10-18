'use client';

import { useState, useEffect, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Icon from '@/@core/components/icon';

interface StudentViewPageProps {
  id: string;
}

const MuiTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`,
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('sm')]: {
      minWidth: 130,
    },
  },
}));

const StudentViewPage = ({ id }: StudentViewPageProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const theme = useTheme();
  const hideText = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const mockStudentData = {
    id,
    studentId: id,
    title: 'นาย',
    firstName: 'ทดสอบ',
    lastName: 'ระบบ',
    classroom: 'ปวช.1/1',
    email: 'test@nktc.ac.th',
    phone: '08-xxxx-xxxx',
    status: 'active',
  };

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{ width: 120, height: 120, mr: 4 }}
                src='/images/avatars/1.png'
                alt={`${mockStudentData.firstName} ${mockStudentData.lastName}`}
              />
              <Box>
                <Typography variant='h4' sx={{ mb: 2 }}>
                  {mockStudentData.title}
                  {mockStudentData.firstName} {mockStudentData.lastName}
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  รหัสนักเรียน: {mockStudentData.studentId}
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  ชั้นเรียน: {mockStudentData.classroom}
                </Typography>
                <Typography variant='body1' sx={{ mb: 1 }}>
                  อีเมล: {mockStudentData.email}
                </Typography>
                <Typography variant='body1'>เบอร์โทร: {mockStudentData.phone}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid size={12}>
              <MuiTabList
                variant='scrollable'
                scrollButtons='auto'
                onChange={handleChange}
                aria-label='student profile tabs'
              >
                <Tab
                  value='overview'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize={20} icon='mdi:account-outline' />
                      {!hideText && 'ภาพรวม'}
                    </Box>
                  }
                />
                <Tab
                  value='goodness'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize={20} icon='mdi:star-outline' />
                      {!hideText && 'ความดี'}
                    </Box>
                  }
                />
                <Tab
                  value='badness'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize={20} icon='mdi:alert-outline' />
                      {!hideText && 'ความประพฤติ'}
                    </Box>
                  }
                />
              </MuiTabList>
            </Grid>
            <Grid size={12}>
              <TabPanel sx={{ p: 0 }} value='overview'>
                <Card>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 3 }}>
                      ข้อมูลส่วนตัว
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ชื่อ-นามสกุล:
                        </Typography>
                        <Typography variant='body2'>
                          {mockStudentData.title}
                          {mockStudentData.firstName} {mockStudentData.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          รหัสนักเรียน:
                        </Typography>
                        <Typography variant='body2'>{mockStudentData.studentId}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ชั้นเรียน:
                        </Typography>
                        <Typography variant='body2'>{mockStudentData.classroom}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          สถานะ:
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'success.main' }}>
                          กำลังศึกษา
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel sx={{ p: 0 }} value='goodness'>
                <Card>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 3 }}>
                      ประวัติความดี
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ไม่มีข้อมูลประวัติความดี
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel sx={{ p: 0 }} value='badness'>
                <Card>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 3 }}>
                      ประวัติความประพฤติ
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ไม่มีข้อมูลประวัติความประพฤติ
                    </Typography>
                  </CardContent>
                </Card>
              </TabPanel>
            </Grid>
          </Grid>
        </TabContext>
      </Grid>
    </Grid>
  );
};

export default StudentViewPage;
