import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { alpha, styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// ─── Shared filter-control styles ─────────────────────────────────────────────
// Applied to both AppFilterTextField and AppFilterFormControl so Select and
// TextField/Autocomplete share the same visual language inside filter panels.

const filterControlStyles = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.82),
    color: theme.palette.text.primary,
    fontSize: 'clamp(1rem, 0.96rem + 0.14vw, 1.06rem)',
    '& fieldset': {
      borderColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.12),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.28),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: '0.86rem',
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiFormHelperText-root:not(.Mui-error)': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
});

// TextField for filter panels and form fields
export const AppFilterTextField = styled(TextField)(({ theme }) => filterControlStyles(theme));

// FormControl wrapper for Select inside filter panels (same visual as AppFilterTextField)
export const AppFilterFormControl = styled(FormControl)(({ theme }) => filterControlStyles(theme));

// ─── Search TextField ──────────────────────────────────────────────────────────
// Toolbar search bar with primary-tinted border and focus shadow

export const AppSearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2.5),
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.96),
    transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
    '& .MuiInputAdornment-root': {
      color: theme.palette.primary.main,
    },
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.16),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.38),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

// ─── Contained Button ──────────────────────────────────────────────────────────
// Primary action button (add/submit) with elevation shadow

export const AppContainedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  whiteSpace: 'nowrap',
  padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
  minHeight: 40,
  boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.24)}`,
  '&:hover': {
    boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));
