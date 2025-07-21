// ** React Imports
import { useState, useEffect } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

// ** Third Party Imports
import axios from 'axios';

interface CellType {
  row: any;
}
const Img = styled('img')(({ theme }) => ({
  width: 34,
  height: 34,
  borderRadius: '50%',
  marginRight: theme.spacing(3),
}));

const columns = [
  {
    flex: 0.3,
    minWidth: 230,
    field: 'projectTitle',
    headerName: 'Project',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Img src={row.img} alt={`project-${row.projectTitle}`} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
            {row.projectTitle}
          </Typography>
          <Typography variant='caption'>{row.projectType}</Typography>
        </Box>
      </Box>
    ),
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'totalTask',
    headerName: 'Total Tasks',
    renderCell: ({ row }: CellType) => (
      <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {row.totalTask}
      </Typography>
    ),
  },
  {
    flex: 0.15,
    minWidth: 200,
    headerName: 'Progress',
    field: 'progressValue',
    renderCell: ({ row }: CellType) => (
      <Box sx={{ width: '100%' }}>
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {row.progressValue}%
        </Typography>
        <LinearProgress
          variant='determinate'
          value={row.progressValue}
          color={row.progressColor}
          sx={{ height: 6, borderRadius: '5px' }}
        />
      </Box>
    ),
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'hours',
    headerName: 'Hours',
    renderCell: ({ row }: CellType) => (
      <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {row.hours}
      </Typography>
    ),
  },
];

const InvoiceListTable = () => {
  // ** State
  const [value, setValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(7);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    axios
      .get('/apps/users/project-list', {
        params: {
          q: value,
        },
      })
      .then((res) => setData(res.data));
  }, [value]);

  return (
    <Card>
      <CardHeader title='Projects List' />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography variant='body2' sx={{ mr: 2 }}>
            Search:
          </Typography>
          <TextField
            size='small'
            placeholder='Search Project'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Box>
      </CardContent>
      <DataGrid
        rows={data}
        columns={columns}
        disableRowSelectionOnClick
        getRowHeight={() => 'auto'}
        initialState={{
          pagination: {
            paginationModel: { pageSize: pageSize, page: 0 },
          },
        }}
        pageSizeOptions={[7, 10, 25, 50]}
        onPaginationModelChange={(model) => setPageSize(model.pageSize)}
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
        }}
      />
    </Card>
  );
};

export default InvoiceListTable;
