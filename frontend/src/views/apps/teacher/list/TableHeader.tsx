// ** MUI Imports

// ** Icons Imports
import IconifyIcon from '@/@core/components/icon';
import { Button, TextField, Box, Stack, InputAdornment, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import CsvDownloader from 'react-csv-downloader';
import Close from 'mdi-material-ui/Close';
import { useResponsive } from '@/@core/hooks/useResponsive';

interface LoginCountByUser {
  date: string;
  count: number;
}

interface TeacherData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  loginCountByUser?: LoginCountByUser[];
}

type TeacherDataArray = TeacherData[];

type TeacherDataResponse =
  | TeacherDataArray
  | { data: TeacherDataArray }
  | { teachers: TeacherDataArray }
  | { items: TeacherDataArray }
  | null
  | undefined;

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
  data: TeacherDataResponse;
}

interface Column {
  id: string;
  displayName: string;
}

interface CsvData {
  id: number;
  username: string;
  fullName: string;
  logs: string;
  total: number;
  [key: string]: string | number | null | undefined;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value } = props;
  const { isMobile } = useResponsive();

  // ** Handlers
  const handleClearSearch = () => {
    handleFilter('');
  };

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

  const extractTeacherArray = (data: TeacherDataResponse): TeacherDataArray => {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === 'object') {
      if ('data' in data && Array.isArray(data.data)) {
        return data.data;
      }
      if ('teachers' in data && Array.isArray(data.teachers)) {
        return data.teachers;
      }
      if ('items' in data && Array.isArray(data.items)) {
        return data.items;
      }
    }

    return [];
  };

  const mapDataToTable = (data: TeacherDataResponse): CsvData[] => {
    const teacherArray = extractTeacherArray(data);

    return teacherArray.map((item: TeacherData, index: number) => {
      const loginDates = item.loginCountByUser?.map((log: LoginCountByUser) => log.date).join('| ') || '';
      const loginCount = item.loginCountByUser?.length || 0;

      return {
        id: index + 1,
        username: item.username,
        fullName: `${item.firstName} ${item.lastName}`,
        logs: loginDates,
        total: loginCount,
      };
    });
  };

  const date = new Date();
  const options = { timeZone: 'Asia/Bangkok' };
  const formattedDate = date.toLocaleString('th-TH', options).replace(/\//g, '-').replace(',', '').replace(/ /g, '_');
  const filename = `${formattedDate}`;

  const datas: CsvData[] = mapDataToTable(props.data);

  return (
    <Box sx={{ px: isMobile ? 2 : 3, py: isMobile ? 2 : 2 }}>
      {isMobile ? (
        <Stack spacing={2}>
          <TextField
            fullWidth
            size='small'
            value={value}
            placeholder='ค้นหาครู/บุคลากร'
            onChange={(e) => handleFilter(e.target.value)}
            slotProps={{
              input: {
                endAdornment: value && (
                  <InputAdornment position='end'>
                    <IconButton
                      id='teacher-search-clear-button'
                      size='small'
                      onClick={handleClearSearch}
                      edge='end'
                      aria-label='ล้างการค้นหา'
                      sx={{ mr: -1 }}
                    >
                      <Close fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction='row' spacing={2}>
            <CsvDownloader
              prefix='System Access Report'
              filename={filename}
              extension='.csv'
              separator=','
              columns={columns}
              datas={datas}
            >
              <Button
                color='primary'
                variant='contained'
                startIcon={<IconifyIcon icon='line-md:download-loop' width={18} height={18} />}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                ดาวน์โหลด
              </Button>
            </CsvDownloader>
            <Button
              fullWidth
              color='success'
              startIcon={<IconifyIcon icon='tabler:user-plus' width={18} height={18} />}
              onClick={toggle}
              variant='contained'
              size={isMobile ? 'small' : 'medium'}
              sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
            >
              เพิ่มครู
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Grid container spacing={2} display='flex' direction='row' justifyContent='space-between'>
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 2,
            }}
          >
            <CsvDownloader
              prefix='System Access Report'
              filename={filename}
              extension='.csv'
              separator=','
              columns={columns}
              datas={datas}
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
              lg: 6,
            }}
          >
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
              <TextField
                fullWidth
                size='small'
                value={value}
                sx={{ mr: 4, mb: 2 }}
                placeholder='ค้นหาครู/บุคลากร'
                onChange={(e) => handleFilter(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: value && (
                      <InputAdornment position='end'>
                        <IconButton
                          id='teacher-search-clear-button'
                          size='small'
                          onClick={handleClearSearch}
                          edge='end'
                          aria-label='ล้างการค้นหา'
                          sx={{ mr: -1 }}
                        >
                          <Close fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
      )}
    </Box>
  );
};

export default TableHeader;
