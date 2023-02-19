import { Button, FormControl, Grid, TextField } from '@mui/material';

import Icon from '@/@core/components/icon';
import { ChangeEvent } from 'react';
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

  return (
    <Grid
      container
      spacing={2}
      sx={{
        p: 5,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <TextField
            className='studentName'
            id='studentName'
            label='ชื่อ-สกุล นักเรียน'
            value={fullName}
            onChange={onChangeFullName}
            inputProps={{
              onKeyPress: (e) => {
                if (e.key === 'Enter' && fullName !== '') {
                  onSearch();
                }
              },
            }}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <TextField
            className='studentId'
            label='รหัสนักเรียน'
            id='studentId'
            value={id}
            onChange={onChangeId}
            inputProps={{
              onKeyPress: (e) => {
                if (e.key === 'Enter' && id !== '') {
                  onSearch();
                }
              },
            }}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth>
          <Button
            size='large'
            color='primary'
            variant='contained'
            startIcon={<Icon icon='icon-park-outline:people-search-one' />}
            sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
            disabled={fullName === '' && id === ''}
            onClick={onSearch}
          >
            ค้นหา
          </Button>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth>
          <Button
            size='large'
            color='warning'
            variant='contained'
            startIcon={<Icon icon='carbon:clean' />}
            sx={{ fontSize: 16, fontWeight: 500, height: 56 }}
            disabled={fullName === '' && id === ''}
            onClick={onClear}
          >
            ล้างข้อมูล
          </Button>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default TableHeader;
