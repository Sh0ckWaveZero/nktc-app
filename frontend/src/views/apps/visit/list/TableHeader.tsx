import { memo } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import { FilterGrid, SectionBox, SectionDescription, SectionTitle } from '@/@core/components/filter-panel';
import { AppFilterTextField, AppFilterAutocomplete, AppFilterFormControl, AppFilterSelect } from '@/@core/components/form';

interface ClassroomOption {
  id: string;
  name: string;
}

interface TableHeaderProps {
  classroomOptions: ClassroomOption[];
  selectedClassroomId: string | null;
  searchValue: string;
  visitStatusFilter: 'all' | 'recorded' | 'pending';
  onClassroomChange: (value: ClassroomOption | null) => void;
  onSearchChange: (value: string) => void;
  onVisitStatusChange: (value: 'all' | 'recorded' | 'pending') => void;
}

const TableHeader = memo(({
  classroomOptions,
  selectedClassroomId,
  searchValue,
  visitStatusFilter,
  onClassroomChange,
  onSearchChange,
  onVisitStatusChange,
}: TableHeaderProps) => {
  const selectedClassroom = classroomOptions.find((opt) => opt.id === selectedClassroomId) ?? null;

  return (
    <Grid
      id='visit-list-table-header'
      container
      spacing={3}
      sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}
    >
      <Grid size={12}>
        <SectionBox id='visit-list-filter-surface'>
          <Stack
            id='visit-list-toolbar-row'
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              alignItems: { xs: 'stretch', sm: 'flex-start', lg: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1.75, sm: 2 },
              mb: { xs: 2, sm: 2.75 },
            }}
          >
            <Box sx={{ minWidth: 0, maxWidth: { xs: '100%', lg: 640 } }}>
              <SectionTitle>ค้นหาและกรอง</SectionTitle>
              <SectionDescription variant='body2'>
                เลือกห้องเรียน กรองสถานะ หรือพิมพ์ชื่อ-รหัสเพื่อค้นหานักเรียนในความดูแล
              </SectionDescription>
            </Box>
          </Stack>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <FilterGrid id='visit-list-classroom-filter' size={{ xs: 12, md: 4 }}>
              <AppFilterAutocomplete
                id='visit-classroom-filter'
                fullWidth
                disablePortal={false}
                value={selectedClassroom}
                options={classroomOptions}
                onChange={(_, newValue) => onClassroomChange(newValue as ClassroomOption | null)}
                getOptionLabel={(option) => (option as ClassroomOption).name ?? ''}
                isOptionEqualToValue={(option, value) =>
                  (option as ClassroomOption).id === (value as ClassroomOption).id
                }
                sx={{
                  '& .MuiAutocomplete-clearIndicator': {
                    visibility: selectedClassroom ? 'visible' : 'hidden',
                  },
                }}
                renderInput={(params) => (
                  <AppFilterTextField
                    {...params}
                    id='visit-classroom-input'
                    label='ห้องเรียน'
                    placeholder='เลือกห้องที่รับผิดชอบ'
                    slotProps={{
                      ...params.slotProps,
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
                noOptionsText='ไม่พบข้อมูลห้องเรียน'
              />
            </FilterGrid>

            <FilterGrid id='visit-list-search-filter' size={{ xs: 12, md: 5 }}>
              <AppFilterTextField
                id='visit-list-search-input'
                fullWidth
                label='ค้นหานักเรียน'
                placeholder='ค้นหาจากรหัสนักเรียน ชื่อ-นามสกุล หรือห้องเรียน'
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: searchValue ? (
                      <InputAdornment position='end'>
                        <IconButton
                          id='clear-visit-search-button'
                          size='small'
                          edge='end'
                          onClick={() => onSearchChange('')}
                          aria-label='clear search'
                        >
                          <Close fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
              />
            </FilterGrid>

            <FilterGrid id='visit-list-status-filter' size={{ xs: 12, md: 3 }}>
              <AppFilterFormControl fullWidth>
                <InputLabel id='visit-status-label' shrink>
                  สถานะบันทึก
                </InputLabel>
                <AppFilterSelect
                  id='visit-status-select'
                  labelId='visit-status-label'
                  value={visitStatusFilter}
                  onChange={(e) => onVisitStatusChange(e.target.value as 'all' | 'recorded' | 'pending')}
                  displayEmpty
                  input={
                    <OutlinedInput
                      label='สถานะบันทึก'
                      notched
                      endAdornment={
                        visitStatusFilter !== 'all' ? (
                          <InputAdornment position='end' sx={{ mr: 1.5 }}>
                            <IconButton
                              id='clear-visit-status-button'
                              size='small'
                              edge='end'
                              onClick={() => onVisitStatusChange('all')}
                              aria-label='clear visit status'
                            >
                              <Close fontSize='small' />
                            </IconButton>
                          </InputAdornment>
                        ) : undefined
                      }
                    />
                  }
                >
                  <MenuItem value='all'>ทุกสถานะ</MenuItem>
                  <MenuItem value='recorded'>บันทึกแล้ว</MenuItem>
                  <MenuItem value='pending'>รอบันทึก</MenuItem>
                </AppFilterSelect>
              </AppFilterFormControl>
            </FilterGrid>
          </Grid>
        </SectionBox>
      </Grid>
    </Grid>
  );
});

TableHeader.displayName = 'VisitTableHeader';

export default TableHeader;
