import { Icon } from '@iconify/react';
import { Box, Typography } from '@mui/material';
import { Fragment } from 'react';

interface ListItem {
  icon: string;
  value: string;
  property: string;
  key: string;
  color: string;
}

interface ListProps {
  list: ListItem[];
}

interface ListItem {
  icon: string;
  value: string;
  property: string;
  key: string;
  color: string;
}

const SurveyList = ({ list }: ListProps) => (
  <Fragment>
    {list.length
      ? list.map((item: ListItem, index: number) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              fontSize: 22,
              '&:not(:last-of-type)': { mb: 4 },
              '& svg': { color: 'text.secondary' },
            }}
          >
            <Box sx={{ display: 'flex', mr: 2 }}>
              <Icon icon={item.icon} />
            </Box>

            <Box sx={{ columnGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
              </Typography>
            </Box>
          </Box>
        ))
      : null}
  </Fragment>
);

export default SurveyList;
