import { styled } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const DataGridCustom = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-root': {
    border: 'none',
  },
  '& .MuiDataGrid-main': {
    overflowX: 'auto',
  },
  '& .MuiDataGrid-topContainer': {
    borderBottom: 'none',
  },
  '& .MuiDataGrid-container--top': {
    borderBottom: 'none',
    '& [role=row]': {
      backgroundColor: 'action.hover',
    },
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[200],
    fontSize: '0.9375rem',
    minHeight: '64px !important',
    borderBottom: 'none',
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 600,
      fontSize: '0.9375rem',
      color: theme.palette.text.primary,
    },
    '& .MuiDataGrid-columnHeader': {
      padding: '12px 16px',
      borderBottom: 'none',
      borderRight: 'none',
      backgroundColor: 'transparent',
      '&:focus, &:focus-within': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-columnSeparator': {
      display: 'none',
    },
  },
  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    maxHeight: 'none !important',
    borderBottom: `1px dashed ${theme.palette.divider}`,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    '&.Mui-selected': {
      backgroundColor: 'transparent !important',
      '&:hover': {
        backgroundColor: 'action.hover !important',
      },
    },
    '&:nth-of-type(even)': {
      backgroundColor: 'action.hover',
      '&:hover': {
        backgroundColor: 'action.selected',
      },
    },
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.5 !important',
    maxHeight: 'none !important',
    overflow: 'visible',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    padding: '16px 16px',
    fontSize: '0.875rem',
    fontWeight: 400,
    border: 'none',
    borderTop: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  },
  '& .MuiDataGrid-renderingZone': {
    maxHeight: 'none !important',
  },
  '& .MuiDataGrid-footerContainer': {
    minHeight: '64px !important',
    borderTop: 'none',
    '& .MuiDataGrid-selectedRowCount': {
      display: 'none',
    },
    '& .MuiTablePagination-root': {
      fontSize: '0.875rem',
    },
    '& .MuiTablePagination-selectLabel': {
      fontSize: '0.875rem',
    },
    '& .MuiTablePagination-displayedRows': {
      fontSize: '0.875rem',
    },
    '& .MuiTablePagination-select': {
      fontSize: '0.875rem',
    },
  },
  '& .MuiDataGrid-toolbarContainer': {
    padding: '16px',
  },
}));

export default DataGridCustom;

