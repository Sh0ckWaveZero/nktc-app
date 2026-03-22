import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Fade from '@mui/material/Fade';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import { Controller } from 'react-hook-form';

import { useEditTeacherForm } from '@/hooks/features/teacher/useEditTeacherForm';
import IconifyIcon from '@/@core/components/icon';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { Teacher } from '@/views/apps/teacher/list/utils/teacherUtils';
import { JOB_TITLES, STATUS_OPTIONS } from '@/views/apps/teacher/list/constants';
import { FcCalendar } from 'react-icons/fc';
import { PatternFormat } from 'react-number-format';

interface DialogEditUserInfoProps {
  show: boolean;
  data: Teacher | null;
  onClose: () => void;
  onSubmitForm: (data: Teacher) => Promise<void> | void;
}

const textFieldStyles = {
  '& .MuiFormLabel-asterisk': {
    color: 'error.main',
  },
};

const DialogEditUserInfo = ({ show, data, onClose, onSubmitForm }: DialogEditUserInfoProps) => {
  const { control, errors, handleSubmit, reset } = useEditTeacherForm(data);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit((formData) => {
    const teacherData: Teacher = {
      id: data?.id ?? '',
      username: formData.username,
      email: data?.email ?? '',
      role: data?.role ?? '',
      firstName: formData.firstName,
      lastName: formData.lastName,
      idCard: formData.idCard,
      birthDate: formData.birthDate,
      jobTitle: formData.jobTitle,
      status: formData.status,
      accountId: data?.accountId,
      teacherId: data?.teacherId,
    };
    onSubmitForm(teacherData);
  });

  return (
    <Dialog fullWidth open={show} maxWidth='md' scroll='body' onClose={handleClose} slots={{ transition: Fade }}>
      <form onSubmit={onSubmit}>
        <DialogContent
          sx={{
            position: 'relative',
            pb: 8,
            px: [5, 15],
            pt: [8, 12.5],
          }}
        >
          <IconButton
            size='small'
            onClick={handleClose}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            aria-label='close dialog'
          >
            <IconifyIcon icon='mdi:close' />
          </IconButton>

          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              แก้ไขข้อมูลของครู/อาจารย์
            </Typography>
            <Typography variant='body2'>การแก้ไข้ข้อมูลนี้จะมีผลทันที</Typography>
          </Box>

          <Grid container spacing={6}>
            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth error={Boolean(errors.firstName)}>
                <Controller
                  name='firstName'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id='firstName'
                      label='ชื่อ'
                      placeholder='ป้อนชื่อ'
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName?.message}
                      required
                      sx={textFieldStyles}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth error={Boolean(errors.lastName)}>
                <Controller
                  name='lastName'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id='lastName'
                      label='นามสกุล'
                      placeholder='ป้อนนามสกุล'
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName?.message}
                      required
                      sx={textFieldStyles}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth>
                <Controller
                  name='username'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id='username'
                      label='ชื่อผู้ใช้งาน'
                      placeholder='ป้อนชื่อผู้ใช้งาน'
                      disabled
                      error={Boolean(errors.username)}
                      helperText={errors.username?.message}
                      required
                      sx={textFieldStyles}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth error={Boolean(errors.idCard)}>
                <Controller
                  name='idCard'
                  control={control}
                  render={({ field }) => (
                    <PatternFormat
                      {...field}
                      id='idCard'
                      label='เลขที่บัตรประจำตัวประชาชน'
                      format='# #### ##### ## #'
                      allowEmptyFormatting
                      mask='x'
                      customInput={TextField}
                      error={Boolean(errors.idCard)}
                      helperText={errors.idCard?.message}
                      sx={textFieldStyles}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth error={Boolean(errors.birthDate)}>
                <Controller
                  name='birthDate'
                  control={control}
                  render={({ field }) => (
                    <ThaiDatePicker
                      {...field}
                      id='birthDate'
                      label='วันเกิด'
                      value={field.value ? new Date(field.value) : null}
                      onChange={(newValue) => field.onChange(newValue)}
                      format='d MMMM yyyy'
                      maxDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(errors.birthDate),
                          helperText: errors.birthDate?.message,
                          inputProps: {
                            placeholder: 'วัน/เดือน/ปี (พ.ศ.)',
                          },
                          input: {
                            endAdornment: <FcCalendar />,
                          },
                        },
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth error={Boolean(errors.jobTitle)}>
                <InputLabel id='jobTitle-label'>ตำแหน่ง</InputLabel>
                <Controller
                  name='jobTitle'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id='jobTitle'
                      labelId='jobTitle-label'
                      label='ตำแหน่ง'
                      error={Boolean(errors.jobTitle)}
                    >
                      {JOB_TITLES.map((title) => (
                        <MenuItem key={title} value={title}>
                          {title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth error={Boolean(errors.status)}>
                <InputLabel id='status-label'>สถานะบัญชีใช้งาน</InputLabel>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id='status'
                      labelId='status-label'
                      label='สถานะบัญชีใช้งาน'
                      error={Boolean(errors.status)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            px: [5, 15],
            pb: [8, 12.5],
          }}
        >
          <Button variant='contained' sx={{ mr: 1 }} type='submit'>
            บันทึกการเปลี่ยนแปลง
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            ยกเลิก
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default memo(DialogEditUserInfo);
