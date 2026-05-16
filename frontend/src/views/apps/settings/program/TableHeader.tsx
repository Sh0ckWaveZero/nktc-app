import { Box, Button, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Plus } from 'mdi-material-ui';
import { FaFileExcel } from 'react-icons/fa';

interface TableHeaderProps {
  value: string;
  handleFilter: (val: string) => void;
  handleUploadFile: () => void;
  handleUpload: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const TableHeader = ({ value, handleFilter, handleUploadFile, handleUpload, fileInputRef }: TableHeaderProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <Box
      sx={{
        px: { xs: 4, sm: 5 },
        py: { xs: 3, sm: 3.5 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size='small'
            value={value}
            onChange={(e) => handleFilter(e.target.value)}
            placeholder='ค้นหา...'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: { sm: 'flex-end' } }}>
            <Button
              component='label'
              variant='outlined'
              color='success'
              startIcon={<FaFileExcel />}
            >
              อัปโหลดไฟล์
              <input hidden accept='.xlsx, .xls' type='file' ref={fileInputRef} onChange={handleFileChange} />
            </Button>
            <Button
              variant='contained'
              disableElevation
              startIcon={<Plus />}
              onClick={handleUploadFile}
            >
              เพิ่มสาขาวิชา
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableHeader;
