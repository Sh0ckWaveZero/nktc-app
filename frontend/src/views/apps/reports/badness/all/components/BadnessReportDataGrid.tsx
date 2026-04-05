import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';

interface BadnessReportDataGridProps {
  columns: any[];
  rows: any[];
  loading: boolean;
  pageSize: number;
  isTablet: boolean;
  getRowId: (row: any) => string;
}

export const BadnessReportDataGrid = ({
  columns,
  rows,
  loading,
  pageSize,
  isTablet,
  getRowId,
}: BadnessReportDataGridProps) => {
  return (
    <Box
      id='badness-report-datagrid-section'
      sx={{
        px: { xs: 4, sm: 6 },
        py: { xs: 4, sm: 6 },
        flex: 1,
        minHeight: 400,
      }}
    >
      <DataGrid
        columns={columns}
        rows={rows ?? []}
        getRowId={getRowId}
        disableColumnMenu
        loading={loading}
        rowHeight={80}
        getRowHeight={() => 'auto'}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: pageSize || 10, page: 0 },
          },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        autoHeight
        sx={{
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            maxHeight: 'none !important',
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
          '& .root': {
            overflowX: 'hidden',
          },
          border: 'none',
        }}
      />
    </Box>
  );
};
