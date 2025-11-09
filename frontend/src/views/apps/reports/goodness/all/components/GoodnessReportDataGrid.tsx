import { Box } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import DataGridCustom from '@/@core/components/mui/data-grid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';

interface GoodnessReportDataGridProps {
  columns: GridColDef[];
  rows: any[];
  loading: boolean;
  pageSize: number;
  isTablet: boolean;
  getRowId: (row: any) => string;
}

export const GoodnessReportDataGrid = ({
  columns,
  rows,
  loading,
  pageSize,
  isTablet,
  getRowId,
}: GoodnessReportDataGridProps) => {
  return (
    <Box
      id='goodness-report-datagrid-section'
      sx={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
      }}
    >
      <DataGridCustom
        columns={columns}
        rows={rows || []}
        disableColumnMenu
        disableRowSelectionOnClick
        loading={loading}
        getRowId={getRowId}
        slotProps={{
          loadingOverlay: {
            // variant: 'skeleton',
          },
          pagination: {
            labelRowsPerPage: 'แถวต่อหน้า',
          },
        }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: Math.max(pageSize, 10),
              page: 0,
            },
          },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </Box>
  );
};

