// ** MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  styled,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Fade, { FadeProps } from '@mui/material/Fade';
// ** React Imports
import { ReactElement, Ref, forwardRef, useState, Fragment } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import IconifyIcon from '@/@core/components/icon';
import { PatternFormat } from 'react-number-format';

import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { FcCalendar } from 'react-icons/fc';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import thLocale from 'date-fns/locale/th';

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

const DialogEditUserInfo = ({ show, data, onClose }: DialogEditUserInfoType) => {
  // ** States
  const [languages, setLanguages] = useState<string[]>([]);

  const defaultValues = {
    firstName: data?.firstName,
    lastName: data?.lastName,
    username: data?.username,
    jobTitle: data?.jobTitle,
    idCard: data?.idCard,
    birthDate: data?.birthDate,
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
    email: yup.string().email().required(),
    lastName: yup
      .string()
      .min(3, (obj) => showErrors('นามสกุล', obj.value.length, obj.min))
      .matches(/^[\u0E00-\u0E7F\s]+$/, 'กรุณากรอกภาษาไทยเท่านั้น')
      .required(),
    password: yup
      .string()
      .min(8, (obj) => showErrors('password', obj.value.length, obj.min))
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
  });

  const handleChange = (event: SelectChangeEvent<typeof languages>) => {
    const {
      target: { value },
    } = event;
    setLanguages(typeof value === 'string' ? value.split(',') : value);
  };

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = () => toast.success('Form Submitted');

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
                      InputLabelProps={{
                        required: true,
                      }}
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
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={thLocale}>
                      <DatePicker
                        label='วันเกิด'
                        value={value}
                        inputFormat='dd/MM/yyyy'
                        minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 90))}
                        maxDate={new Date()}
                        onChange={onChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            inputProps={{
                              ...params.inputProps,
                              placeholder: 'วัน/เดือน/ปี',
                            }}
                          />
                        )}
                        components={{
                          OpenPickerIcon: () => <FcCalendar />,
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
            <Grid item xs={12}>
              <FormControlLabel control={<Switch defaultChecked />} label='เปิด/ปิด การใช้งานบัญชี' />
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
