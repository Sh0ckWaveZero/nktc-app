import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import { ReactNode } from 'react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
}

const StatisticsCard = ({ title, value, subtitle, icon, color = 'primary' }: StatisticsCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" height="100%">
          <Box display="flex" flexDirection="column" justifyContent="space-between" flexGrow={1}>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Box>
              <Typography variant="h4" sx={{ mb: subtitle ? 1 : 0 }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color={`${color}.main`} fontWeight={500}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
