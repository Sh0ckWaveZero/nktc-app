import { Box, IconButton } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

export const ToolButton = styled(IconButton)(({ theme }) => ({
  width: '100%',
  minWidth: 54,
  height: 52,
  borderRadius: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  boxShadow: 'none',
  transition: 'background-color 180ms ease, color 180ms ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

export const ToolButtonSlot = styled('span')({
  display: 'flex',
  flex: '1 1 0',
  minWidth: 0,
});

export const ToolDivider = styled(Box)(({ theme }) => ({
  width: 1,
  alignSelf: 'stretch',
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.16),
}));

export const ActiveToolButton = styled(ToolButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.12),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.16),
  },
}));
