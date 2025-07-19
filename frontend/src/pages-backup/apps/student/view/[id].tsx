// ** React Imports
import { useState, useEffect, SyntheticEvent } from 'react';

// ** Next Import
import { useRouter } from 'next/router';

// ** MUI Components
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import { styled, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiTabList, { TabListProps } from '@mui/lab/TabList';

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
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

const StudentProfile = ({ tab, data }: { tab: string; data: any }) => {
  // ** State
  const [activeTab, setActiveTab] = useState<string>(tab);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ** Hooks
  const router = useRouter();
  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    router
      .push({
        pathname: `/pages/user-profile/${value.toLowerCase()}`,
      })
      .then(() => setIsLoading(false));
  };

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }

  }, [tab]);

  // const tabContentList: { [key: string]: ReactElement } = {
  //   profile: <Profile data={data as ProfileTabType} />,
  //   teams: <Teams data={data as TeamsTabType[]} />,
  //   projects: <Projects data={data as ProjectsTabType[]} />,
  //   connections: <Connections data={data as ConnectionsTabType[]} />
  // }

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        {/* <UserProfileHeader /> */}
      </Grid>
      {activeTab === undefined ? null : (
        <Grid size={12}>
          <TabContext value={activeTab}>
            <Grid container spacing={6}>
              <Grid size={12}>
                {/* <TabList
                  variant='scrollable'
                  scrollButtons='auto'
                  onChange={handleChange}
                  aria-label='customized tabs example'
                >
                  <Tab
                    value='profile'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Icon fontSize={20} icon='mdi:account-outline' />
                        {!hideText && 'Profile'}
                      </Box>
                    }
                  />
                  <Tab
                    value='teams'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Icon fontSize={20} icon='mdi:account-multiple-outline' />
                        {!hideText && 'Teams'}
                      </Box>
                    }
                  />
                  <Tab
                    value='projects'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Icon fontSize={20} icon='mdi:view-grid-outline' />
                        {!hideText && 'Projects'}
                      </Box>
                    }
                  />
                  <Tab
                    value='connections'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Icon fontSize={20} icon='mdi:link' />
                        {!hideText && 'Connections'}
                      </Box>
                    }
                  />
                </TabList> */}
              </Grid>
              {/* <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(4)} !important` }}>
                {isLoading ? (
                  <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <CircularProgress sx={{ mb: 4 }} />
                    <Typography>Loading...</Typography>
                  </Box>
                ) : (
                  <TabPanel sx={{ p: 0 }} value={activeTab}>
                    {tabContentList[activeTab]}
                  </TabPanel>
                )}
              </Grid> */}
            </Grid>
          </TabContext>
        </Grid>
      )}
    </Grid>
  );
};

StudentProfile.acl = {
  action: 'read',
  subject: 'view-student-page',
};

export default StudentProfile;
