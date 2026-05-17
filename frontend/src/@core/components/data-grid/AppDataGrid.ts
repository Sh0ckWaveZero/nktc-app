import { DataGrid } from '@mui/x-data-grid';
import { alpha, styled } from '@mui/material/styles';

/**
 * Project-standard DataGrid with consistent visual styles.
 *
 * Usage:
 *   import AppDataGrid from '@/@core/components/data-grid/AppDataGrid';
 *
 * To add first-column padding (px 3/4/5 responsive), extend per page:
 *   const StyledDataGrid = styled(AppDataGrid)(({ theme }) => ({
 *     '& .MuiDataGrid-columnHeader[data-field="<firstField>"]': {
 *       paddingLeft: theme.spacing(3),
 *       [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
 *       [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
 *     },
 *     '& .MuiDataGrid-cell[data-field="<firstField>"]': {
 *       paddingLeft: theme.spacing(3),
 *       [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(4) },
 *       [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(5) },
 *     },
 *   }));
 *
 * Last column named "actions" or "action" gets paddingRight automatically.
 */
const AppDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  '& .MuiDataGrid-row': {
    maxHeight: 'none !important',
    transition: 'background-color 180ms ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 'unset !important',
    maxHeight: 'none !important',
    overflow: 'visible',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
  '& .MuiDataGrid-renderingZone': {
    maxHeight: 'none !important',
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    paddingRight: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingRight: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingRight: theme.spacing(5) },
  },
  // Last-column padding — covers "actions" (list pages) and "action" (report pages)
  '& .MuiDataGrid-columnHeader[data-field="actions"], & .MuiDataGrid-columnHeader[data-field="action"]': {
    paddingRight: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingRight: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingRight: theme.spacing(5) },
  },
  '& .MuiDataGrid-cell[data-field="actions"], & .MuiDataGrid-cell[data-field="action"]': {
    paddingRight: theme.spacing(3),
    [theme.breakpoints.up('sm')]: { paddingRight: theme.spacing(4) },
    [theme.breakpoints.up('lg')]: { paddingRight: theme.spacing(5) },
  },
}));

export default AppDataGrid;
