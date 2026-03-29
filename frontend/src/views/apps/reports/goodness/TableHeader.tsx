'use client';

// ** React Imports
import { useState, useEffect } from 'react';

// ** MUI Imports
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// ** Icon Imports
import Icon from '@/@core/components/icon';

// ** Custom Components Imports
import { Controller } from 'react-hook-form';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

// ** Utils Imports
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

interface TableHeaderProps {
  control: any;
  classroomLoading: boolean;
  classrooms: any[];
  datePickLabel: string;
  inputValue: string;
  loadingStudents: boolean;
  isPending?: boolean;
  onClear: () => void;
  onSubmit: () => void;
  onSearchChange: (event: any, value: string, reason: string) => void;
  students: any[];
}

const StudentAutocomplete = ({ value, onChange, inputValue, students, loadingStudents, onSearchChange }: any) => {
  const [localInputValue, setLocalInputValue] = useState(inputValue || '');

  useEffect(() => {
    if (value && inputValue !== undefined && inputValue.trim() !== '') {
      setLocalInputValue((prev: string) => (prev !== inputValue ? inputValue : prev));
    } else if (!value && localInputValue !== '') {
      setLocalInputValue('');
    }
  }, [value, inputValue, localInputValue]);

  return (
    <Autocomplete
      id='goodness-report-filter-student-autocomplete'
      value={value || null}
      inputValue={localInputValue}
      options={Array.isArray(students) ? students : []}
      loading={loadingStudents}
      onInputChange={(event, newInputValue, reason) => {
        setLocalInputValue(newInputValue || '');
        if (reason !== 'blur' && reason !== 'reset') {
          onSearchChange(event, newInputValue, reason);
        }
      }}
      onChange={(_, newValue: any) => {
        onChange(newValue);
        if (newValue) {
          const account = newValue?.user?.account || newValue?.account;
          let displayName = '';
          if (account) {
            const { title = '', firstName = '', lastName = '' } = account;
            displayName = `${title}${firstName} ${lastName}`.trim();
          } else if (newValue.fullName) {
            displayName = `${newValue.title || ''}${newValue.fullName}`;
          } else {
            displayName = newValue.studentId || newValue.id || '';
          }
          setLocalInputValue(displayName);
        } else {
          setLocalInputValue('');
        }
      }}
      getOptionLabel={(option: any) => {
        if (typeof option === 'string') return option;
        const account = option?.user?.account || option?.account;
        if (account) {
          const { title = '', firstName = '', lastName = '' } = account;
          const label = `${title}${firstName} ${lastName}`.trim();
          if (label) return label;
        }
        if (option?.fullName) {
          return `${option?.title || ''}${option.fullName}`;
        }
        return option?.studentId || option?.id || '';
      }}
      isOptionEqualToValue={(option: any, val: any) => {
        if (!option || !val) return false;
        return option.id === val.id;
      }}
      renderOption={(props, option: any) => {
        const { key, ...optionProps } = props;
        const account = option?.user?.account || option?.account;
        let displayText = '';
        if (account) {
          const { title = '', firstName = '', lastName = '' } = account;
          displayText = `${title}${firstName} ${lastName}`.trim();
        } else if (option?.fullName) {
          displayText = `${option?.title || ''}${option.fullName}`;
        } else {
          displayText = option?.studentId || option?.id || '';
        }
        return (
          <li {...optionProps} key={option.id || key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon='mdi:account-outline' fontSize='1.25rem' color='primary.main' />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>{displayText}</Typography>
                <Typography variant='caption' color='text.secondary'>{option.studentId || ''}</Typography>
              </Box>
            </Box>
          </li>
        );
      }}
      slotProps={{
        listbox: { sx: { maxHeight: 400, p: 2 } },
        popper: { sx: { zIndex: 1300 } },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label='ค้นหารายชื่อนักเรียน'
          placeholder='ระบุชื่อ หรือ รหัสประจำตัว'
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <>
                  <Icon icon='mdi:account-search-outline' fontSize='1.25rem' style={{ marginRight: 8, opacity: 0.6 }} />
                  {params.InputProps.startAdornment}
                </>
              ),
              sx: { height: { xs: 44, sm: 48 }, borderRadius: 2, bgcolor: 'background.paper' },
            },
            inputLabel: {
              shrink: true,
              sx: { fontWeight: 600, transform: 'translate(14px, -9px) scale(0.75)' }
            },
          }}
        />
      )}
      noOptionsText='ไม่พบรายชื่อนักเรียน'
    />
  );
};

const TableHeader = (props: TableHeaderProps) => {
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
    <Box
      id='goodness-report-header-container'
      sx={{
        p: { xs: 4, sm: 6 },
        mb: 8,
        borderRadius: 4,
        bgcolor: (theme) => (theme.palette.mode === 'light' ? 'background.paper' : 'background.default'),
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => `0 8px 32px -4px ${hexToRGBA(theme.palette.mode === 'light' ? '#3A3541' : '#000000', 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, gap: 3 }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 1.5, 
            bgcolor: (theme) => hexToRGBA(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex'
          }}
        >
          <Icon icon='mdi:filter-variant' fontSize='1.5rem' />
        </Box>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
            ตัวกรองข้อมูล
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            ค้นหาและสรุปรายงานความดีรายบุคคล/รายห้อง
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={6} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 3.5 }}>
          <FormControl fullWidth>
            <Controller
              name='student'
              control={control}
              render={({ field: { onChange, value } }) => (
                <StudentAutocomplete
                  value={value}
                  onChange={onChange}
                  inputValue={inputValue}
                  students={students}
                  loadingStudents={loadingStudents}
                  onSearchChange={onSearchChange}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <Controller
              name='classroom'
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  id='goodness-report-classroom-autocomplete'
                  value={value || null}
                  options={Array.isArray(classrooms) ? classrooms : []}
                  loading={classroomLoading}
                  onChange={(_, newValue) => onChange(newValue)}
                  getOptionLabel={(option: any) => option?.name ?? ''}
                  isOptionEqualToValue={(option: any, val: any) => option?.id === val?.id}
                  renderOption={(props, option: any) => (
                    <li {...props} key={option.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Icon icon='mdi:google-classroom' fontSize='1.2rem' color='info.main' />
                        {option.name}
                      </Box>
                    </li>
                  )}
                  slotProps={{ popper: { sx: { zIndex: 1300 } } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='ชั้นเรียน'
                      placeholder='เลือกชั้นเรียน'
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: (
                            <Icon icon='mdi:google-classroom' fontSize='1.25rem' style={{ marginRight: 8, opacity: 0.6 }} />
                          ),
                          sx: { height: { xs: 44, sm: 48 }, borderRadius: 2, bgcolor: 'background.paper' },
                        },
                        inputLabel: {
                          shrink: true,
                          sx: { fontWeight: 600, transform: 'translate(14px, -9px) scale(0.75)' }
                        },
                      }}
                    />
                  )}
                  noOptionsText='ไม่พบข้อมูลชั้นเรียน'
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2.5 }}>
          <FormControl fullWidth>
            <Controller
              name='goodDate'
              control={control}
              render={({ field: { value, onChange } }) => (
                <ThaiDatePicker
                  label={datePickLabel}
                  value={value}
                  onChange={onChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: 'ระบุวันที่',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          height: { xs: 44, sm: 48 },
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          transform: 'translate(14px, -9px) scale(0.75)'
                        }
                      },
                      slotProps: {
                        input: {
                          startAdornment: (
                            <Icon icon='mdi:calendar-range' fontSize='1.25rem' style={{ marginRight: 8, opacity: 0.6 }} />
                          ),
                        }
                      }
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button
              fullWidth
              variant='contained'
              onClick={onSubmit}
              loading={isPending}
              disabled={isPending}
              startIcon={<Icon icon='mdi:magnify' />}
              sx={{
                height: { xs: 44, sm: 48 },
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: (theme) => `0 8px 24px ${hexToRGBA(theme.palette.primary.main, 0.25)}`,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => `0 12px 32px ${hexToRGBA(theme.palette.primary.main, 0.4)}`,
                },
                '&:active': { transform: 'translateY(0)' }
              }}
            >
              แสดงรายงาน
            </Button>
            <Tooltip title='ล้างค่าทั้งหมด' arrow>
              <Button
                variant='outlined'
                color='secondary'
                onClick={onClear}
                sx={{
                  minWidth: { xs: 44, sm: 48 },
                  width: { xs: 44, sm: 48 },
                  height: { xs: 44, sm: 48 },
                  borderRadius: 2.5,
                  p: 0,
                  bgcolor: (theme) => hexToRGBA(theme.palette.secondary.main, 0.05),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    bgcolor: (theme) => hexToRGBA(theme.palette.secondary.main, 0.1),
                    borderColor: 'secondary.main',
                    color: 'secondary.main'
                  }
                }}
              >
                <Icon icon='mdi:filter-off-outline' fontSize='1.25rem' />
              </Button>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableHeader;
