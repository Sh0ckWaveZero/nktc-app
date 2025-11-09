import { Button, FormControl, TextField, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ChangeEvent } from 'react';

import Icon from '@/@core/components/icon';

interface TableHeaderProps {
  fullName: string;
  id: string;
  onChangeFullName: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeId: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onClear: () => void;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { fullName, id, onChangeFullName, onChangeId, onSearch, onClear } = props;

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (fullName || id) {
      onSearch();
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (fullName || id) {
        onSearch();
      }
    }
  };

  return (
    <Grid
      id='record-goodness-individual-filter-container-grid'
      container
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: '100%',
        m: 0,
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <Grid
        id='record-goodness-individual-filter-fullname-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
        sx={{ minWidth: 0 }}
      >
        <FormControl id='record-goodness-individual-filter-fullname-form-control' fullWidth sx={{ minWidth: 0 }}>
          <TextField
            id='record-goodness-individual-filter-fullname-input'
            label='ชื่อ-สกุล นักเรียน'
            value={fullName}
            onChange={onChangeFullName}
            onKeyDown={handleKeyDown}
            placeholder='กรอกชื่อ-สกุล นักเรียน'
            size='medium'
            slotProps={{
              input: {
                sx: {
                  height: { xs: '40px', sm: '44px' },
                },
              },
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </FormControl>
      </Grid>
      <Grid
        id='record-goodness-individual-filter-id-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
        sx={{ minWidth: 0 }}
      >
        <FormControl id='record-goodness-individual-filter-id-form-control' fullWidth sx={{ minWidth: 0 }}>
          <TextField
            id='record-goodness-individual-filter-id-input'
            label='รหัสนักเรียน'
            value={id}
            onChange={onChangeId}
            onKeyDown={handleKeyDown}
            placeholder='กรอกรหัสนักเรียน'
            size='medium'
            slotProps={{
              input: {
                sx: {
                  height: { xs: '40px', sm: '44px' },
                },
              },
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </FormControl>
      </Grid>
      <Grid
        id='record-goodness-individual-filter-search-button-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 2,
        }}
        sx={{ minWidth: 0 }}
      >
        <Tooltip title='ค้นหา' arrow>
          <Button
            id='record-goodness-individual-filter-search-button'
            fullWidth
            size='medium'
            color='primary'
            variant='contained'
            type='button'
            disabled={!fullName && !id}
            startIcon={<Icon icon='icon-park-outline:people-search-one' />}
            onClick={handleSearch}
            sx={{
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 500,
              height: { xs: 40, sm: 44 },
              px: { xs: 2, sm: 3 },
            }}
          >
            ค้นหา
          </Button>
        </Tooltip>
      </Grid>
      <Grid
        id='record-goodness-individual-filter-clear-button-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 2,
        }}
        sx={{ minWidth: 0 }}
      >
        <Tooltip title='ล้างข้อมูลค้นหา' arrow>
          <Button
            id='record-goodness-individual-filter-clear-button'
            fullWidth
            size='medium'
            color='warning'
            variant='contained'
            type='button'
            disabled={!fullName && !id}
            startIcon={<Icon icon='carbon:clean' />}
            onClick={handleClear}
            sx={{
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 500,
              height: { xs: 40, sm: 44 },
              px: { xs: 2, sm: 3 },
            }}
          >
            ล้างค่า
          </Button>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
