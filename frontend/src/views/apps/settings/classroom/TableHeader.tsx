'use client';

import IconifyIcon from '@/@core/components/icon';
import { SectionBox } from '@/@core/components/filter-panel';
import { AppSearchTextField, AppContainedButton } from '@/@core/components/form';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
}

const TableHeader = ({ handleFilter, toggle, value }: TableHeaderProps) => {
  const [keyword, setKeyword] = useState(value);

  useEffect(() => {
    setKeyword(value);
    return () => setKeyword('');
  }, [value]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    handleFilter(e.target.value);
  };

  return (
    <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
      <SectionBox id='classroom-list-toolbar-surface'>
        <Stack
          id='classroom-list-toolbar-row'
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.75, sm: 2 },
          }}
        >
          <AppSearchTextField
            id='classroom-search-input'
            size='small'
            value={keyword}
            placeholder='ค้นชื่อห้องเรียน'
            onChange={handleOnChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <IconifyIcon icon='tabler:search' fontSize='1.1rem' />
                  </InputAdornment>
                ),
                endAdornment: keyword ? (
                  <InputAdornment position='end'>
                    <IconButton
                      id='clear-classroom-search-button'
                      size='small'
                      onClick={() => {
                        setKeyword('');
                        handleFilter('');
                      }}
                    >
                      <IconifyIcon icon='uil:times' width={18} height={18} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
            sx={{ width: { xs: '100%', md: 320 }, flex: { xs: '1 1 auto', md: '0 1 320px' } }}
          />

          <AppContainedButton
            id='add-classroom-button'
            variant='contained'
            disableElevation
            startIcon={<IconifyIcon icon='ci:house-add' width={18} height={18} />}
            onClick={toggle}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            เพิ่มรายชื่อห้องเรียน
          </AppContainedButton>
        </Stack>
      </SectionBox>
    </Box>
  );
};

export default TableHeader;
