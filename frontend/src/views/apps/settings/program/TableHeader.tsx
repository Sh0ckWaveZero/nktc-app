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

/**
 * ส่วนหัวของตารางสำหรับจัดการสาขาวิชา
 * @param value - ค่าการค้นหา
 * @param handleFilter - ฟังก์ชันสำหรับจัดการการค้นหา
 * @param handleUploadFile - ฟังก์ชันสำหรับเพิ่มสาขาวิชาใหม่
 * @param handleUpload - ฟังก์ชันสำหรับอัพโหลดไฟล์
 * @param fileInputRef - ตัวอ้างอิงสำหรับ input ไฟล์
 */
const TableHeader = ({ value, handleFilter, handleUploadFile, handleUpload, fileInputRef }: TableHeaderProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <Grid container spacing={3} alignItems='center' sx={{ pb: 2, px: 4 }}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <TextField
          fullWidth
          size='small'
          value={value}
          onChange={(e) => handleFilter(e.target.value)}
          placeholder='ค้นหา...'
          variant='outlined'
        />
      </Grid>
      <Grid
        container
        justifyContent='flex-end'
        spacing={2}
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <Grid>
          <Button component='label' variant='contained' color='primary' startIcon={<FaFileExcel />}>
            อัปโหลดไฟล์
            <input hidden accept='.xlsx, .xls' type='file' ref={fileInputRef} onChange={handleFileChange} />
          </Button>
        </Grid>
        <Grid>
          <Button variant='contained' color='secondary' startIcon={<Plus />} onClick={handleUploadFile}>
            เพิ่มสาขาวิชา
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
