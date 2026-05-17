import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, styled } from '@mui/material/styles';

const PANEL_RADIUS = 16;

const getPanelBorderColor = (theme: any) =>
  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1);

const getPanelShadowColor = (theme: any) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.black, 0.28)
    : alpha(theme.palette.primary.main, 0.06);

export const SectionBox = styled(Box)(({ theme }) => ({
  width: '100%',
  borderRadius: PANEL_RADIUS,
  border: `1px solid ${getPanelBorderColor(theme)}`,
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 34%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 38%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
  boxShadow: `0 12px 28px ${getPanelShadowColor(theme)}`,
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(3.5),
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: 'clamp(0.92rem, 0.86rem + 0.16vw, 1rem)',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.88 : 0.82),
  textShadow:
    theme.palette.mode === 'dark' ? `0 1px 10px ${alpha(theme.palette.primary.main, 0.12)}` : 'none',
  '&::before': {
    content: '""',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.72 : 0.64),
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 0 0 6px ${alpha(theme.palette.primary.main, 0.08)}`
        : `0 0 0 5px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.text.primary, 0.82)
      : theme.palette.text.secondary,
  maxWidth: '62ch',
  fontSize: 'clamp(0.94rem, 0.9rem + 0.18vw, 1.06rem)',
  fontWeight: 500,
  lineHeight: 1.6,
}));

export const FilterGrid = styled(Grid)({
  display: 'flex',
  alignItems: 'center',
});
