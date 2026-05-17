import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { alpha, styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// ─── Style helpers ─────────────────────────────────────────────────────────────

const filterBorderColor = (theme: Theme) =>
  alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.12);

const filterBg = (theme: Theme) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.82);

const filterLabelStyles = (theme: Theme) => ({
  '& .MuiInputLabel-root': {
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: '0.86rem',
  },
  '& .MuiFormHelperText-root:not(.Mui-error)': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
});

// ─── AppFilterTextField ────────────────────────────────────────────────────────
// Styled TextField for filter panels and form fields.

export const AppFilterTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: filterBg(theme),
    color: theme.palette.text.primary,
    fontSize: 'clamp(1rem, 0.96rem + 0.14vw, 1.06rem)',
    '& fieldset': { borderColor: filterBorderColor(theme) },
    '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.28) },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
  },
  '& .MuiInputBase-input': { letterSpacing: '-0.01em' },
  '& .MuiSvgIcon-root': { color: theme.palette.text.secondary },
  ...filterLabelStyles(theme),
}));

// ─── AppFilterSelect ───────────────────────────────────────────────────────────
// Styled Select for filter panels. Use inside AppFilterFormControl for labels.

export const AppFilterSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: filterBg(theme),
  fontSize: 'clamp(1rem, 0.96rem + 0.14vw, 1.06rem)',
  '& .MuiSelect-select': { letterSpacing: '-0.01em' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: filterBorderColor(theme) },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.28),
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': { color: theme.palette.text.secondary },
})) as unknown as typeof Select;

// ─── AppFilterFormControl ──────────────────────────────────────────────────────
// FormControl wrapper — applies label styling when using AppFilterSelect.
// Does NOT style the input (AppFilterSelect handles its own border/bg).

export const AppFilterFormControl = styled(FormControl)(({ theme }) => filterLabelStyles(theme));

// ─── AppFilterAutocomplete ─────────────────────────────────────────────────────
// Styled Autocomplete for filter panels.
// Use AppFilterTextField in renderInput for input styling.

export const AppFilterAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& + .MuiAutocomplete-popper .MuiAutocomplete-paper': {
    borderRadius: 12,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.32 : 0.1)}`,
  },
  '& + .MuiAutocomplete-popper .MuiAutocomplete-option': {
    fontSize: 'clamp(1rem, 0.96rem + 0.14vw, 1.06rem)',
    letterSpacing: '-0.01em',
  },
})) as typeof Autocomplete;

// ─── AppSearchTextField ────────────────────────────────────────────────────────
// Toolbar search bar with primary-tinted border and focus glow.

export const AppSearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2.5),
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.9 : 0.96),
    transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
    '& .MuiInputAdornment-root': { color: theme.palette.primary.main },
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.16),
    },
    '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.38) },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
  },
}));

// ─── AppContainedButton ────────────────────────────────────────────────────────
// Primary action button (add/submit) with elevation shadow.

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
