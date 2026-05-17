import { alpha, styled } from '@mui/material/styles';
import AppDataGrid from './AppDataGrid';

/**
 * Extends AppDataGrid for list pages (student, teacher).
 * Adds responsive paddingLeft on the "fullName" first column.
 *
 * For zebra rows or stronger column headers, extend further per page:
 *   const StyledDataGrid = styled(AppListDataGrid)(({ theme }) => ({ ... }));
 */
const AppListDataGrid = styled(AppDataGrid)(({ theme }) => ({
  '& .MuiDataGrid-columnHeader[data-field="fullName"]': {
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
  },
  '& .MuiDataGrid-cell[data-field="fullName"]': {
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
  },
}));

export default AppListDataGrid;

// Settings-variant: first column is "name" (department/program/classroom)
export const AppSettingsDataGrid = styled(AppDataGrid)(({ theme }) => ({
  '& .MuiDataGrid-columnHeader[data-field="name"]': {
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
  },
  '& .MuiDataGrid-cell[data-field="name"]': {
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
  },
  '& .MuiDataGrid-row': {
    '&:nth-of-type(even)': {
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.035 : 0.02),
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.045),
    },
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.06),
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontSize: '0.8rem',
    letterSpacing: '0.02em',
  },
}));

// Teacher-variant: zebra rows + stronger column header accents
export const AppTeacherDataGrid = styled(AppListDataGrid)(({ theme }) => ({
  '& .MuiDataGrid-row': {
    '&:nth-of-type(even)': {
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.035 : 0.02),
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.055),
    },
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.22)}`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontSize: '0.8rem',
    letterSpacing: '0.02em',
  },
}));
