import { Box, Button, TextField, Tooltip } from '@mui/material';
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

const TableHeader = ({ fullName, id, onChangeFullName, onChangeId, onSearch, onClear }: TableHeaderProps) => {
  const hasValue = !!(fullName || id);

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasValue) onSearch();
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
      if (hasValue) onSearch();
    }
  };

  return (
    <Box
      id='record-goodness-individual-filter-container-grid'
      sx={{
        px: { xs: 4, sm: 5 },
        py: { xs: 3, sm: 3.5 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid id='record-goodness-individual-filter-fullname-grid' size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id='record-goodness-individual-filter-fullname-input'
            fullWidth
            size='small'
            label='ชื่อ-สกุล นักเรียน'
            value={fullName}
            onChange={onChangeFullName}
            onKeyDown={handleKeyDown}
            placeholder='กรอกชื่อ-สกุล นักเรียน'
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid id='record-goodness-individual-filter-id-grid' size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id='record-goodness-individual-filter-id-input'
            fullWidth
            size='small'
            label='รหัสนักเรียน'
            value={id}
            onChange={onChangeId}
            onKeyDown={handleKeyDown}
            placeholder='กรอกรหัสนักเรียน'
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title='ค้นหา' arrow>
              <span style={{ flex: 1 }}>
                <Button
                  id='record-goodness-individual-filter-search-button'
                  fullWidth
                  variant='contained'
                  disableElevation
                  disabled={!hasValue}
                  startIcon={<Icon icon='icon-park-outline:people-search-one' />}
                  onClick={handleSearch}
                >
                  ค้นหา
                </Button>
              </span>
            </Tooltip>
            <Tooltip title='ล้างข้อมูลค้นหา' arrow>
              <span style={{ flex: 1 }}>
                <Button
                  id='record-goodness-individual-filter-clear-button'
                  fullWidth
                  variant='outlined'
                  color='warning'
                  disabled={!hasValue}
                  startIcon={<Icon icon='carbon:clean' />}
                  onClick={handleClear}
                >
                  ล้างค่า
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableHeader;
