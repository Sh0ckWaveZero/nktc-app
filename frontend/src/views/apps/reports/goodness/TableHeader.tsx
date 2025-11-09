import { useState, useEffect } from 'react';
import { Autocomplete, Button, FormControl, TextField, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, Control } from 'react-hook-form';

import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import Icon from '@/@core/components/icon';
import { isEmpty } from '@/@core/utils/utils';

interface TableHeaderProps {
  control: Control<any>;
  classroomLoading: boolean;
  classrooms: any;
  datePickLabel: string;
  inputValue?: string;
  loadingStudents: boolean;
  isPending?: boolean;
  onClear: () => void;
  onSubmit: () => void;
  onSearchChange: (event: any, value: any, reason: any) => void;
  students: any;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    control,
    classroomLoading,
    classrooms,
    datePickLabel,
    inputValue,
    loadingStudents,
    isPending = false,
    onClear,
    onSubmit,
    onSearchChange,
    students,
  } = props;

  return (
    <Grid
      id='goodness-report-filter-container-grid'
      container
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: '100%',
        m: 0,
      }}
    >
      <Grid
        id='goodness-report-filter-student-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
        sx={{ minWidth: 0 }}
      >
        <FormControl id='goodness-report-filter-student-form-control' fullWidth sx={{ minWidth: 0 }}>
          <Controller
            name='student'
            control={control}
            render={({ field: { onChange, value } }) => {
              // Use local state for inputValue to allow typing
              const [localInputValue, setLocalInputValue] = useState(inputValue || '');
              
              // Sync with prop when student value changes (when selected from dropdown)
              useEffect(() => {
                // Only sync when value changes (not when inputValue changes from typing)
                if (value && inputValue !== undefined && inputValue.trim() !== '') {
                  // Only update if inputValue is different from current local state
                  setLocalInputValue((prev) => {
                    if (prev !== inputValue) {
                      return inputValue;
                    }
                    return prev;
                  });
                } else if (!value && localInputValue !== '') {
                  // Clear input when value is cleared (only if localInputValue is not empty)
                  setLocalInputValue('');
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, [value]); // Only depend on value, not inputValue to prevent infinite loop
              
              return (
                <Autocomplete
                  id='goodness-report-filter-student-autocomplete'
                  limitTags={20}
                  value={value || null}
                  inputValue={localInputValue}
                  options={students}
                     size='medium'
                  loading={loadingStudents}
                  onInputChange={(event, newInputValue, reason) => {
                    // Always update local state to allow typing
                    setLocalInputValue(newInputValue || '');
                    // Call parent handler for search (only if not blur/reset)
                    if (reason !== 'blur' && reason !== 'reset') {
                      onSearchChange(event, newInputValue, reason);
                    }
                  }}
                  onChange={(_, newValue: any) => {
                    onChange(newValue);
                    // Update inputValue when student is selected
                    if (newValue) {
                      let displayName = '';
                      if (newValue.account) {
                        const { title = '', firstName = '', lastName = '' } = newValue.account;
                        displayName = `${title}${firstName} ${lastName}`.trim();
                      } else if (newValue.fullName) {
                        displayName = `${newValue.title || ''}${newValue.fullName}`;
                      }
                      setLocalInputValue(displayName);
                    } else {
                      setLocalInputValue('');
                    }
                  }}
                getOptionLabel={(option: any) => {
                  if (typeof option === 'string') return option;
                  // Handle different data structures
                  if (option?.fullName) {
                    return `${option?.title || ''}${option.fullName}`;
                  }
                  // Handle API response structure: account.title + account.firstName + account.lastName
                  if (option?.account) {
                    const { title = '', firstName = '', lastName = '' } = option.account;
                    return `${title}${firstName} ${lastName}`.trim();
                  }
                  return '';
                }}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                renderOption={(props: any, option: any) => {
                  let displayText = '';
                  if (option?.fullName) {
                    displayText = `${option?.title || ''}${option.fullName}`;
                  } else if (option?.account) {
                    const { title = '', firstName = '', lastName = '' } = option.account;
                    displayText = `${title}${firstName} ${lastName}`.trim();
                  }
                  return <li {...props} id={`goodness-report-student-option-${option.id}`}>{displayText}</li>;
                }}
                clearOnBlur={false}
                selectOnFocus
                handleHomeEndKeys
                disablePortal={false}
                slotProps={{
                  listbox: {
                    sx: {
                      maxHeight: { xs: '300px', sm: '400px' },
                    },
                  },
                  popper: {
                    sx: {
                      zIndex: 1300,
                    },
                  },
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    id='goodness-report-filter-student-input'
                    label='ชื่อ-สกุล นักเรียน'
                    placeholder='เลือกชื่อ-สกุล นักเรียน'
                    slotProps={{
                      input: {
                        ref: undefined,
                        id: 'goodness-report-filter-student-textfield',
                        sx: {
                          height: { xs: '40px', sm: '44px' },
                        },
                      },
                      inputLabel: {
                        shrink: true,
                        id: 'goodness-report-filter-student-label',
                      },
                    }}
                  />
                )}
                noOptionsText='ไม่พบข้อมูล'
              />
              );
            }}
          />
        </FormControl>
      </Grid>
      <Grid
        id='goodness-report-filter-classroom-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
        sx={{ minWidth: 0 }}
      >
        <FormControl id='goodness-report-filter-classroom-form-control' fullWidth sx={{ minWidth: 0 }}>
          <Controller
            name='classroom'
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                id='goodness-report-filter-classroom-autocomplete'
                limitTags={15}
                value={value || null}
                options={Array.isArray(classrooms) ? classrooms : []}
                size='medium'
                loading={classroomLoading}
                openOnFocus
                autoHighlight
                disableClearable={false}
                disablePortal={false}
                slotProps={{
                  listbox: {
                    sx: {
                      maxHeight: { xs: '300px', sm: '400px' },
                    },
                  },
                  popper: {
                    sx: {
                      zIndex: 1300,
                    },
                  },
                }}
                onChange={(_, newValue: any) => {
                  onChange(newValue);
                }}
                getOptionLabel={(option: any) => {
                  if (!option) return '';
                  if (typeof option === 'string') return option;
                  // Classroom object from Prisma has 'name' field
                  return option?.name || '';
                }}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                renderOption={(props: any, option: any) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li
                      key={option.id}
                      {...otherProps}
                      id={`goodness-report-classroom-option-${option.id}`}
                    >
                      {option?.name || ''}
                    </li>
                  );
                }}
                renderInput={(params: any) => {
                  return (
                    <TextField
                      id='goodness-report-filter-classroom-input'
                      error={isEmpty(classrooms) && !classroomLoading}
                      helperText={
                        isEmpty(classrooms) && !classroomLoading
                          ? 'ไม่พบข้อมูลห้องเรียน'
                          : classroomLoading
                            ? 'กำลังโหลด...'
                            : ''
                      }
                      {...params}
                      label='ห้องเรียน'
                      placeholder='เลือกห้องเรียน'
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          id: 'goodness-report-filter-classroom-textfield',
                          sx: {
                            height: { xs: '40px', sm: '44px' },
                          },
                        },
                        inputLabel: {
                          shrink: true,
                          id: 'goodness-report-filter-classroom-label',
                        },
                      }}
                    />
                  );
                }}
                groupBy={(option: any) => option?.department?.name || ''}
                noOptionsText={classroomLoading ? 'กำลังโหลด...' : 'ไม่พบข้อมูล'}
              />
            )}
          />
        </FormControl>
      </Grid>
      <Grid
        id='goodness-report-filter-date-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
        sx={{ minWidth: 0 }}
      >
        <FormControl id='goodness-report-filter-date-form-control' fullWidth sx={{ minWidth: 0 }}>
          <Controller
            name='goodDate'
            control={control}
            render={({ field: { onChange, value } }) => (
              <ThaiDatePicker
                id='goodness-report-filter-date-picker'
                label={datePickLabel}
                value={value || null}
                onChange={(date) => onChange(date)}
                format='dd/MM/yyyy'
                minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
                maxDate={new Date()}
                placeholder='วัน/เดือน/ปี (พ.ศ.)'
                slotProps={{
                  textField: {
                    size: 'medium',
                    slotProps: {
                      input: {
                        sx: {
                          height: { xs: '40px', sm: '44px' },
                        },
                      },
                    },
                  },
                }}
              />
            )}
          />
        </FormControl>
      </Grid>
      <Grid
        id='goodness-report-filter-search-button-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 2,
        }}
        sx={{ minWidth: 0 }}
      >
        <Tooltip title='ค้นหา' arrow>
          <Button
            id='goodness-report-filter-search-button'
            fullWidth
            size='medium'
            color='primary'
            variant='contained'
            type='button'
            disabled={isPending}
            startIcon={<Icon icon='icon-park-outline:people-search-one' />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSubmit();
            }}
            sx={{
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 500,
              height: { xs: 40, sm: 44 },
              px: { xs: 2, sm: 3 },
            }}
          >
            {isPending ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button>
        </Tooltip>
      </Grid>
      <Grid
        id='goodness-report-filter-clear-button-grid'
        size={{
          xs: 12,
          sm: 6,
          md: 1,
        }}
        sx={{ minWidth: 0 }}
      >
        <Tooltip title='ล้างข้อมูลค้นหา' arrow>
          <Button
            id='goodness-report-filter-clear-button'
            fullWidth
            size='medium'
            color='warning'
            variant='contained'
            type='button'
            startIcon={<Icon icon='carbon:clean' />}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
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
