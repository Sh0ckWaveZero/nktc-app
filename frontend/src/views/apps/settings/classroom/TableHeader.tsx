import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import IconifyIcon from '@/@core/components/icon';

interface TableHeaderProps {
  value: string;
  toggle: () => void;
  handleFilter: (val: string) => void;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, toggle, value } = props;
  const [keyword, setKeyword] = useState(value);

  useEffect(() => {
    setKeyword(value);

    return () => setKeyword('');
  }, [value]);

  const handleOnChange = (e: any) => {
    const currValue = e.target.value;
    setKeyword(currValue);
    handleFilter(currValue);
  };

  return (
    <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'end' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id='classroom-search'
          size='small'
          value={keyword}
          sx={{ mr: 4, mb: 2 }}
          placeholder='ค้นชื่อห้องเรียน'
          onChange={(e) => handleOnChange(e)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                {keyword && (
                  <IconButton
                    onClick={() => {
                      setKeyword('');
                      handleFilter('');
                    }}
                  >
                    <IconifyIcon icon='uil:times' width={20} height={20} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />

        <Button
          id='add-new-record-classroom'
          startIcon={<IconifyIcon icon='ci:house-add' width={20} height={20} />}
          sx={{ mb: 2 }}
          onClick={toggle}
          variant='contained'
        >
          เพิ่มรายชื่อห้องเรียน
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
