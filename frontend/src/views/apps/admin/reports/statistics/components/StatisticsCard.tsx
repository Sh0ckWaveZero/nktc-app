'use client';

import type { ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import { Avatar, Box, Card, CardContent, Chip, Typography } from '@mui/material';

type StatisticsCardTone = 'primary' | 'success' | 'warning' | 'info';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  caption?: string;
  insight?: string;
  icon: ReactNode;
  tone?: StatisticsCardTone;
}

const toneMap: Record<StatisticsCardTone, { main: string; light: string }> = {
  primary: {
    main: 'primary.main',
    light: 'primary.light',
  },
  success: {
    main: 'success.main',
    light: 'success.light',
  },
  warning: {
    main: 'warning.main',
    light: 'warning.light',
  },
  info: {
    main: 'info.main',
    light: 'info.light',
  },
};

const StatisticsCard = ({ title, value, caption, insight, icon, tone = 'primary' }: StatisticsCardProps) => {
  const palette = toneMap[tone];

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.92)} 0%, ${alpha(theme.palette.background.default, 0.96)} 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.99)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? `0 18px 40px ${alpha(theme.palette.common.black, 0.18)}`
            : `0 18px 36px ${alpha(theme.palette.primary.main, 0.06)}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
        <Box
          sx={{
            width: 44,
            height: 4,
            borderRadius: 999,
            mb: 1.5,
            backgroundColor: (theme) => alpha(theme.palette[tone].main, 0.68),
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant='body2'
              sx={{
                mb: 1,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: (theme) => alpha(theme.palette.text.secondary, 0.95),
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: 'clamp(1.95rem, 1.65rem + 1vw, 2.7rem)',
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 1,
                color: 'text.primary',
              }}
            >
              {value}
            </Typography>
            {caption ? (
              <Typography
                sx={{
                  mt: 1.25,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                }}
              >
                {caption}
              </Typography>
            ) : null}
          </Box>

          <Avatar
            sx={{
              width: 54,
              height: 54,
              bgcolor: (theme) => alpha(theme.palette[tone].main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
              color: palette.main,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.05)}`
                  : `0 12px 24px ${alpha(theme.palette[tone].main, 0.14)}`,
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {insight ? (
          <Chip
            label={insight}
            size='small'
            sx={{
              mt: 2,
              height: 28,
              borderRadius: 1.75,
              bgcolor: (theme) => alpha(theme.palette[tone].main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
              color: palette.main,
              fontWeight: 700,
              '.MuiChip-label': {
                px: 1.1,
              },
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
