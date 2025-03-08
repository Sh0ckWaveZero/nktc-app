// ** React Imports
import { useContext } from 'react';

// ** Context Imports
import { AbilityContext } from '@/layouts/components/acl/Can';

// ** MUI Imports
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

const ACLPage = () => {
  // ** Hooks
  const ability = useContext(AbilityContext);

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Common' />
          <CardContent>
            <Typography sx={{ mb: 4 }}>No ability is required to view this card</Typography>
            <Typography sx={{ color: 'primary.main' }}>"This card is visible to 'user' and 'admin' both"</Typography>
          </CardContent>
        </Card>
      </Grid>
      {ability?.can('read', 'analytics') ? (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title='Analytics' />
            <CardContent>
              <Typography sx={{ mb: 4 }}>
                "User with 'Analytics' subject's 'Read' ability can view this card"
              </Typography>
              <Typography sx={{ color: 'error.main' }}>This card is visible to 'admin' only</Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : null}
    </Grid>
  );
};

ACLPage.acl = {
  action: 'read',
  subject: 'acl-page',
};

export default ACLPage;
