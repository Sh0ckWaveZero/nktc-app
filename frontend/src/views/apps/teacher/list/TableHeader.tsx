// ** MUI Imports

// ** Icons Imports
import IconifyIcon from '@/@core/components/icon';
import { Button, TextField, Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import CsvDownloader from 'react-csv-downloader';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
  data: any | null;
}

interface Column {
  id: string;
  displayName: string;
}

interface Data {
  id: number;
  username: string;
  fullName: string;
  logs: string;
  total: number;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value } = props;

  const columns: Column[] = [
    {
      id: 'id',
      displayName: 'ลำดับ',
    },
    {
      id: 'username',
      displayName: 'ชื่อผู้ใช้',
    },
    {
      id: 'fullName',
      displayName: 'ชื่อ-นามสกุล',
    },
    {
      id: 'logs',
      displayName: 'วันที่เข้าใช้งาน',
    },
    {
      id: 'total',
      displayName: 'จำนวนครั้งที่เข้าใช้งาน',
    },
  ];

  const mapDataToTable = (data: any[]): Data[] => {
    return data.map((item: any, index: number) => {
      return {
        id: index + 1,
        username: item.username,
        fullName: `${item.firstName} ${item.lastName}`,
        logs: item.loginCountByUser?.map((log: any) => log.date).join('| '),
        total: item.loginCountByUser.length,
      };
    });
  };

  const date = new Date();
  const options = { timeZone: 'Asia/Bangkok' };
  const formattedDate = date.toLocaleString('th-TH', options).replace(/\//g, '-').replace(',', '').replace(/ /g, '_');
  const filename = `${formattedDate}`;

  const datas: Data[] = mapDataToTable(props.data);

  return (
    <Grid container spacing={2} sx={{ px: 3, py: 2 }} display='flex' direction='row' justifyContent='space-between'>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 2
        }}>
        <CsvDownloader
          prefix='System Access Report'
          filename={filename}
          extension='.csv'
          separator=','
          columns={columns}
          datas={datas as any}
        >
          <Button
            color='primary'
            variant='contained'
            startIcon={<IconifyIcon icon='line-md:download-loop' width={20} height={20} />}
            fullWidth
            sx={{ mr: 4, mb: 2 }}
          >
            ดาวน์โหลดข้อมูล
          </Button>
        </CsvDownloader>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 12,
          lg: 6
        }}>
        <Stack direction='row' spacing={2} justifyContent='flex-end'>
          <TextField
            fullWidth
            size='small'
            value={value}
            sx={{ mr: 4, mb: 2 }}
            placeholder='ค้นหาครู/บุคลากร'
            onChange={(e) => handleFilter(e.target.value)}
          />
          <Box sx={{ mb: 2, width: '250px' }}>
            <Button
              fullWidth
              color='success'
              startIcon={<IconifyIcon icon='tabler:user-plus' width={20} height={20} />}
              sx={{ mb: 2 }}
              onClick={toggle}
              variant='contained'
            >
              เพิ่มครู/บุคลากร
            </Button>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
