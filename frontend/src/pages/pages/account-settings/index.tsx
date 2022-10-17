// ** React Imports
import { SyntheticEvent, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { styled } from '@mui/material/styles';
import MuiTab, { TabProps } from '@mui/material/Tab';

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline';
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline';

// ** Demo Tabs Imports
import TabAccount from '@/views/pages/account-settings/TabAccount';
import TabSecurity from '@/views/pages/account-settings/TabSecurity';

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css';
import { useUserStore } from '../../../store/apps/user/index';
import TabTeacherAccount from '@/views/pages/account-settings/TabTeacherAccount';

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67,
  },
}));

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const AccountSettings = () => {
  // ** State
  const [value, setValue] = useState<string>('account');

  // Hooks
  const { userInfo } = useUserStore();
  const handleChange = (event: SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setValue(newValue);
  };

  return (
    <Card>
      <TabContext value={value} >
        <TabList
          onChange={handleChange}
          aria-label='account-settings tabs'
          sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            value='account'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountOutline />
                <TabName>บัญชี</TabName>
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
        </TabList>
        <TabPanel sx={{ p: 0 }} value='account'>
          {userInfo?.role === 'Teacher' ? <TabTeacherAccount /> : <TabAccount />}
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value='security'>
          <TabSecurity />
        </TabPanel>
      </TabContext>
    </Card>
  );
};

AccountSettings.acl = {
  action: 'read',
  subject: 'account-page',
};

export default AccountSettings;
