// ** MUI Imports
import Grid from '@mui/material/Grid2';

// ** Types
import { PageHeaderProps } from './types';

const PageHeader = (props: PageHeaderProps) => {
  // ** Props
  const { title, subtitle } = props;

  return (
    <Grid size={{ xs: 12 }}>
      {title}
      {subtitle || null}
    </Grid>
  );
};

export default PageHeader;
