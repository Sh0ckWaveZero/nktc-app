'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

// ─── AppListCard ──────────────────────────────────────────────────────────────

export const AppListCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08)}`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? `0 18px 42px ${alpha(theme.palette.common.black, 0.24)}`
      : `0 18px 42px ${alpha(theme.palette.primary.main, 0.08)}`,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 32%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 32%)`,
}));

// ─── AppListCardHeader ────────────────────────────────────────────────────────

export interface ListSummaryItem {
  label: string;
  value: number | string;
  color: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
}

interface AppListCardHeaderProps {
  id?: string;
  icon: ReactNode;
  title: string;
  count?: number;
  countUnit?: string;
  description?: string;
  summaryItems?: ListSummaryItem[];
}

export const AppListCardHeader = ({
  id,
  icon,
  title,
  count,
  countUnit = 'รายการ',
  description,
  summaryItems = [],
}: AppListCardHeaderProps) => (
  <CardHeader
    id={id}
    avatar={
      <Avatar
        sx={{
          color: (theme) => theme.palette.primary.dark,
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
          width: { xs: 42, sm: 48 },
          height: { xs: 42, sm: 48 },
          boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.16)}`,
        }}
      >
        {icon}
      </Avatar>
    }
    sx={{
      color: 'text.primary',
      alignItems: 'flex-start',
      px: { xs: 3, sm: 4, lg: 5 },
      pt: { xs: 3, sm: 4.25 },
      pb: { xs: 2.5, sm: 3 },
      '& .MuiCardHeader-avatar': { mt: 0.25, mr: { xs: 2, sm: 2.5 } },
      '& .MuiCardHeader-content': { minWidth: 0 },
    }}
    title={
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexWrap: 'wrap',
          columnGap: { xs: 1, sm: 1.5 },
          rowGap: 0.75,
        }}
      >
        <Typography
          component='span'
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.45rem', sm: '1.9rem' },
            letterSpacing: { xs: '-0.02em', sm: '-0.03em' },
            lineHeight: 1.08,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        {count != null && count > 0 && (
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 0.75,
              px: 1.4,
              py: 0.6,
              borderRadius: 999,
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
              border: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)}`,
              color: 'primary.main',
              lineHeight: 1,
            }}
          >
            <Typography
              component='span'
              sx={{
                fontSize: { xs: '1.05rem', sm: '1.15rem' },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {count.toLocaleString('th-TH')}
            </Typography>
            <Typography
              component='span'
              sx={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.01em', color: 'text.secondary' }}
            >
              {countUnit}
            </Typography>
          </Box>
        )}
      </Stack>
    }
    subheader={
      <Box>
        {description && (
          <Typography
            component='p'
            sx={{
              mt: 1.1,
              fontSize: 'clamp(0.98rem, 0.94rem + 0.16vw, 1.06rem)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'text.secondary',
            }}
          >
            {description}
          </Typography>
        )}
        {summaryItems.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.75, sm: 1 },
              mt: 2.25,
              maxWidth: 760,
            }}
          >
            {summaryItems.map((item) => (
              <Box
                key={item.label}
                component='span'
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.35,
                  py: 0.7,
                  minHeight: 30,
                  borderRadius: 999,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette[item.color].main, theme.palette.mode === 'dark' ? 0.26 : 0.18)}`,
                  bgcolor: (theme) =>
                    alpha(theme.palette[item.color].main, theme.palette.mode === 'dark' ? 0.11 : 0.075),
                }}
              >
                <Typography
                  component='span'
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: `${item.color}.dark`,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {typeof item.value === 'number' ? item.value.toLocaleString('th-TH') : item.value}
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1, color: 'text.secondary' }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    }
    slotProps={{ subheader: { component: 'div' } }}
  />
);
