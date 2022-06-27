import { SyntheticEvent, useState } from 'react';
import { Box, Card, CardHeader, Grid, Tab, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiTab, { TabProps } from '@mui/material/Tab';
import TableStickyHeader from '@/views/tables/TableStickyHeader';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TabAccount from '@/views/account-settings/TabAccount';
import TabInfo from '@/views/account-settings/TabInfo';
import TabSecurity from '@/views/account-settings/TabSecurity';
import { AccountOutline, LockOpenOutline, InformationOutline } from 'mdi-material-ui';
import Icon from '@mdi/react';
import { mdiHumanEdit } from '@mdi/js';

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}));

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const Teachers = () => {
  // ** State
  const [value, setValue] = useState<string>('main');

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>ระบบบริหารจัดการข้อมูลครู/บุคลากร</Typography>
        <Typography variant='body2'>Tables display sets of data. They can be fully customized</Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TabContext value={value}>
            <TabList
              onChange={handleChange}
              aria-label='ระบบบริหารจัดการข้อมูลครู'
              sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
            >
              <Tab
                value='main'
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon id='mdiHumanEdit' path={mdiHumanEdit} title='แท็บหลัก' size={1} />
                    <TabName>แท็บหลัก</TabName>
                  </Box>
                }
              />
              <Tab
                value='security'
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LockOpenOutline />
                    <TabName>ความปลอดภัย</TabName>
                  </Box>
                }
              />
              <Tab
                value='info'
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InformationOutline />
                    <TabName>ข้อมูลทั่วไป</TabName>
                  </Box>
                }
              />
            </TabList>

            <TabPanel sx={{ p: 0 }} value='main'>
              <Card>
                <CardHeader title='Sticky Header' titleTypographyProps={{ variant: 'h6' }} />
                <TableStickyHeader />
              </Card>
            </TabPanel>
            {/* <TabPanel sx={{ p: 0 }} value='security'>
              <TabSecurity />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='info'>
              <TabInfo />
            </TabPanel> */}
          </TabContext>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Teachers;
