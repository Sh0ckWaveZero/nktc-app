'use client';

import { useState, SyntheticEvent } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import Icon from '@/@core/components/icon';
import { useUser } from '@/hooks/queries';
import UserViewLeft from './UserViewLeft';
import useGetImage from '@/hooks/useGetImage';

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

interface UserViewPageProps {
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

const UserViewPage = ({ id }: UserViewPageProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const theme = useTheme();
  const hideText = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: userData, isLoading, error } = useUser(id);

  // Extract user data (safe to do before conditional returns)
  const user = userData?.data;

  // Get user image - MUST be called before any conditional returns
  const { image, isLoading: imageLoading } = useGetImage(user?.account?.avatar || '');

  const handleChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value);
  };

  // Handle error state
  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error">
                ไม่พบข้อมูลผู้ใช้งาน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ไม่สามารถค้นหาผู้ใช้งานด้วย ID/Username: {id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  if (isLoading || !userData) {
    return (
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">กำลังโหลดข้อมูล...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // Format full name
  const fullName = user?.account
    ? `${user.account.title || ''} ${user.account.firstName || ''} ${user.account.lastName || ''}`.trim()
    : '';

  return (
    <Grid container spacing={6}>
      {/* Back button */}
      <Grid size={12}>
        <LinkStyled href='/apps/teacher/list/' passHref>
          <Button
            variant='contained'
            color='secondary'
            startIcon={<Icon icon='ion:arrow-back-circle-outline' />}
          >
            ย้อนกลับ
          </Button>
        </LinkStyled>
      </Grid>

      {/* Left sidebar with user info */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <UserViewLeft user={user} isLoading={imageLoading} image={image || undefined} fullName={fullName} />
      </Grid>

      {/* Right content area with tabs */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid size={12}>
              <MuiTabList
                variant='scrollable'
                scrollButtons='auto'
                onChange={handleChange}
                aria-label='user profile tabs'
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
                  value='security'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize={20} icon='mdi:lock-outline' />
                      {!hideText && 'ความปลอดภัย'}
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
                        <Typography variant='body2'>{fullName || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ชื่อผู้ใช้:
                        </Typography>
                        <Typography variant='body2'>{user?.username || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          บทบาท:
                        </Typography>
                        <Typography variant='body2'>{user?.role || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          สถานะ:
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'success.main' }}>
                          ใช้งานอยู่
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel sx={{ p: 0 }} value='security'>
                <Card>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 3 }}>
                      ความปลอดภัย
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ข้อมูลความปลอดภัยและการตั้งค่าบัญชีผู้ใช้
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

export default UserViewPage;