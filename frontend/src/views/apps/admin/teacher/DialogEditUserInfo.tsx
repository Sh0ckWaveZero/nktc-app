import * as yup from 'yup';

// ** MUI Imports
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Fade, { FadeProps } from '@mui/material/Fade';
// ** React Imports
import { Fragment, ReactElement, Ref, forwardRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { FcCalendar } from 'react-icons/fc';
import IconifyIcon from '@/@core/components/icon';
import { PatternFormat } from 'react-number-format';
import Select from '@mui/material/Select';
import newAdapter from 'utils/newAdapter';
import th from 'dayjs/locale/th';
import { yupResolver } from '@hookform/resolvers/yup';

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

interface DialogEditUserInfoType {
  show: boolean;
  data: any;
  onClose: () => void;
  onSubmitForm: (data: any) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  jobTitle: string;
  idCard: string;
  birthDate: Dayjs | null;
  status: string;
}

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFormLabel-asterisk': {
    color: theme.palette.error.main,
  },
  // when disable background color grey
  '& .Mui-disabled': {
    backgroundColor: theme.palette.background.default,
  },
}));

const DialogEditUserInfo = ({ show, data, onClose, onSubmitForm }: DialogEditUserInfoType) => {
  const defaultValues = {
    firstName: data?.firstName,
    lastName: data?.lastName,
    username: data?.username,
    jobTitle: data?.jobTitle,
    idCard: data?.idCard,
    birthDate: data?.birthDate ? dayjs(new Date(data?.birthDate)) : null,
    status: data?.status,
  };

  const showErrors = (field: string, valueLen: number, min: number) => {
    if (valueLen === 0) {
      return `กรุณากรอก${field}`;
    } else if (valueLen > 0 && valueLen < min) {
      return `${field} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
    } else {
      return '';
    }
  };

  const schema = yup.object().shape({
    lastName: yup
      .string()
      .min(3, (obj) => showErrors('นามสกุล', obj.value.length, obj.min))
      .matches(/^[\u0E00-\u0E7F\s]+$/, 'กรุณากรอกภาษาไทยเท่านั้น')
      .required(),
    firstName: yup
      .string()
      .min(3, (obj) => showErrors('ชื่อ', obj.value.length, obj.min))
      .matches(/^[\u0E00-\u0E7F\s]+$/, 'กรุณากรอกภาษาไทยเท่านั้น')
      .required(),
    username: yup
      .string()
      .min(3, (obj) => showErrors('ชื่อผู้ใช้งาน', obj.value.length, obj.min))
      .matches(/^[A-Za-z0-9]+$/, 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น')
      .required(),
    jobTitle: yup.string(),
    idCard: yup.string().matches(/^[0-9]+$/, 'กรุณากรอกเฉพาะตัวเลขเท่านั้น'),
    birthDate: yup.date().nullable(),
    status: yup.string(),
  });

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = (info: FormData) => {
    onSubmitForm({
      ...info,
      id: data?.teacherId,
    });
  };

  return (
    <Dialog fullWidth open={show} maxWidth='md' scroll='body' onClose={onClose} TransitionComponent={Transition}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{
            position: 'relative',
            pb: (theme) => `${theme.spacing(8)} !important`,
            px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: (theme) => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          }}
        >
          <IconButton size='small' onClick={onClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <IconifyIcon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              แก้ไขข้อมูลของครู/อาจารย์
            </Typography>
            <Typography variant='body2'>การแก้ไข้ข้อมูลนี้จะมีผลทันที</Typography>
          </Box>

          <Grid container spacing={6}>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      value={value}
                      onChange={onChange}
                      id='firstName'
                      label='ชื่อ'
                      placeholder='ป้อนชื่อ'
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName?.message as string}
                      aria-describedby='validation-schema-first-name'
                      InputLabelProps={{
                        required: true,
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='lastName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      value={value}
                      onChange={onChange}
                      id='lastName'
                      label='นามสกุล'
                      placeholder='ป้อนนามสกุล'
                      InputLabelProps={{
                        required: true,
                      }}
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName?.message as string}
                      aria-describedby='validation-schema-last-name'
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='username'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      value={value}
                      onChange={onChange}
                      id='lastName'
                      label='ขื่อผู้ใช้งาน'
                      placeholder='ป้อนชื่อผู้ใช้งาน'
                      InputLabelProps={{
                        required: true,
                      }}
                      InputProps={{
                        readOnly: true,
                      }}
                      disabled
                      error={Boolean(errors.username)}
                      helperText={errors.username?.message as string}
                      aria-describedby='validation-schema-username'
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='idCard'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <PatternFormat
                      value={value}
                      onChange={onChange}
                      id='idCard'
                      label='เลขที่บัตรประจำตัวประชาชน'
                      format='# #### ##### ## #'
                      allowEmptyFormatting
                      mask='x'
                      customInput={TextField}
                      sx={{
                        '& .MuiFormLabel-asterisk': {
                          color: (theme: any) => theme.palette.error.main,
                        },
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='birthDate'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <LocalizationProvider dateAdapter={newAdapter} adapterLocale={th as any}>
                      <DatePicker
                        label='วันเกิด'
                        format='D MMMM YYYY'
                        value={value}
                        disableFuture
                        onChange={onChange}
                        slotProps={{
                          textField: {
                            inputProps: {
                              placeholder: 'วัน/เดือน/ปี',
                            },
                          },
                        }}
                        slots={{
                          openPickerIcon: () => <FcCalendar />,
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='jobTitle'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Fragment>
                      <InputLabel>ตำแหน่ง</InputLabel>
                      <Select label='ตำแหน่ง' defaultValue={value} value={value} onChange={onChange}>
                        <MenuItem value=''>
                          <em>เลือกตำแหน่ง</em>
                        </MenuItem>
                        <MenuItem value='ผู้อำนวยการ'>ผู้อำนวยการ</MenuItem>
                        <MenuItem value='รองผู้อำนวยการ'>รองผู้อำนวยการ</MenuItem>
                        <MenuItem value='ข้าราชการ'>ข้าราชการ</MenuItem>
                        <MenuItem value='พนักงานราชการ'>พนักงานราชการ</MenuItem>
                        <MenuItem value='ครูอัตราจ้าง'>ครูอัตราจ้าง</MenuItem>
                        <MenuItem value='เจ้าหน้าที่ธุรการ'>เจ้าหน้าที่ธุรการ</MenuItem>
                        <MenuItem value='นักการภารโรง'>นักการภารโรง</MenuItem>
                        <MenuItem value='ลูกจ้างประจำ'>ลูกจ้างประจำ</MenuItem>
                        <MenuItem value='อื่น ๆ'>อื่น ๆ</MenuItem>
                      </Select>
                    </Fragment>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item sm={6} xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='status'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Fragment>
                      <InputLabel>สถานะบัญชีใช้งาน</InputLabel>
                      <Select label='สถานะบัญชีใช้งาน' defaultValue={value} value={value} onChange={onChange}>
                        <MenuItem value=''>
                          <em>เลือกสถานะ</em>
                        </MenuItem>
                        <MenuItem value='true'>เปิดใช้งาน</MenuItem>
                        <MenuItem value='false'>ปิดใช้งาน</MenuItem>
                      </Select>
                    </Fragment>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: (theme) => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          }}
        >
          <Button variant='contained' sx={{ mr: 1 }} type='submit'>
            บันทึกการเปลี่ยนแปลง
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose}>
            ยกเลิก
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DialogEditUserInfo;
