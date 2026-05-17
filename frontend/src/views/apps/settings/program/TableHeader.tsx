'use client';

import IconifyIcon from '@/@core/components/icon';
import { SectionBox } from '@/@core/components/filter-panel';
import { AppSearchTextField, AppContainedButton } from '@/@core/components/form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
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
    <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
      <SectionBox id='program-list-toolbar-surface'>
        <Stack
          id='program-list-toolbar-row'
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.75, sm: 2 },
          }}
        >
          <AppSearchTextField
            id='program-search-input'
            size='small'
            value={value}
            placeholder='ค้นหาสาขาวิชา...'
            onChange={(e) => handleFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <IconifyIcon icon='tabler:search' fontSize='1.1rem' />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: '100%', md: 280 }, flex: { xs: '1 1 auto', md: '0 1 280px' } }}
          />

          <Stack direction='row' sx={{ gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              id='upload-program-file-button'
              component='label'
              variant='outlined'
              color='success'
              startIcon={<FaFileExcel />}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              อัปโหลดไฟล์
              <input
                id='program-file-input'
                hidden
                accept='.xlsx, .xls'
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Button>
            <AppContainedButton
              id='add-program-button'
              variant='contained'
              disableElevation
              startIcon={<IconifyIcon icon='tabler:plus' />}
              onClick={handleUploadFile}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              เพิ่มสาขาวิชา
            </AppContainedButton>
          </Stack>
        </Stack>
      </SectionBox>
    </Box>
  );
};

export default TableHeader;
