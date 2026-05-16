import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import IconifyIcon from '@/@core/components/icon';

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
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        px: { xs: 4, sm: 5 },
        py: { xs: 3, sm: 3.5 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <TextField
        id='classroom-search'
        size='small'
        value={keyword}
        placeholder='ค้นชื่อห้องเรียน'
        onChange={handleOnChange}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                {keyword && (
                  <IconButton
                    size='small'
                    onClick={() => {
                      setKeyword('');
                      handleFilter('');
                    }}
                  >
                    <IconifyIcon icon='uil:times' width={18} height={18} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: '100%', sm: 260 } }}
      />

      <Box sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
        <Button
          id='add-new-record-classroom'
          fullWidth
          variant='contained'
          disableElevation
          startIcon={<IconifyIcon icon='ci:house-add' width={18} height={18} />}
          onClick={toggle}
        >
          เพิ่มรายชื่อห้องเรียน
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
