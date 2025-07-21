import * as yup from 'yup';

import {
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Fragment, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BoxProps } from '@mui/material/Box';
import Close from 'mdi-material-ui/Close';
import { FcCalendar } from 'react-icons/fc';
import IconifyIcon from '@/@core/components/icon';
import PasswordStrengthBar from 'react-password-strength-bar';
import { PatternFormat } from 'react-number-format';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { styled } from '@mui/material/styles';
import th from 'dayjs/locale/th';
import { yupResolver } from '@hookform/resolvers/yup';

dayjs.extend(buddhistEra);

interface SidebarAddTeacherType {
  open: boolean;
  toggle: () => void;
  data: any;
  onSubmitForm: (data: any) => void;
}

interface UserData {
  fullName: string;
  username: string;
  password: string;
  idCard: string;
  birthDate: Dayjs | null;
  jobTitle: string;
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `กรุณากรอก${field}`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
  } else {
    return '';
  }
};

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& label': {
    display: 'flex',
  },
  '& label .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
  '& label .MuiInputLabel-asterisk:after': {
    content: "'\\2009'",
  },
  '& .Mui-disabled': {
    backgroundColor: theme.palette.background.default,
  },
}));

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

const AddTeacherDrawer = (props: SidebarAddTeacherType) => {
  // ** Props
  const { open, toggle, data, onSubmitForm } = props;

  const schema = yup.object().shape({
    fullName: yup
      .string()
      .min(3, (obj) => showErrors('ชื่อ-นามสกุล', obj.value.length, obj.min))
      .test('fullName', 'ต้องมีเว้นวรรคระหว่าง ชื่อและนามสกุล', async (value: any) => {
        if (value) {
          return value.split(' ').length > 1 ? true : false;
        }
        return true;
      })
      .matches(/^[\u0E00-\u0E7F\s]+$/, 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น')
      .required(),
    username: yup
      .string()
      .min(3, (obj) => showErrors('ชื่อผู้ใช้งานระบบ', obj.value.length, obj.min))
      .test('username', 'ชื่อผู้ใช้งานนี้มีอยู่แล้ว', async (value: any) => {
        if (value) {
          return data.find((item: any) => item.username === value) ? false : true;
        }
        return true;
      })
      .matches( /^[A-Za-z0-9]+$/, 'กรุณากรอกเฉพาะภาษาอังกฤษและตัวเลขเท่านั้น')
      .required(),
    password: yup
      .string()
      .min(8, (obj) => showErrors('รหัสผ่าน', obj.value.length, obj.min))
      .matches(
        /^[A-Za-z0-9!@#\$%\^&\*\(\)-_+=\[\]\{\}\\\|;:'",<.>\/?`~]+$/,
        'กรุณากรอกเฉพาะภาษาอังกฤษและตัวเลขเท่านั้น',
      )
      .required(),
    birthDate: yup.date().nullable(),
  });

  const defaultValues = {
    fullName: '',
    username: '',
    password: '',
    idCard: '',
    birthDate: null,
    jobTitle: '',
  };

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema) as any,
  });

  const onSubmit: any = (info: UserData) => {
    toggle();
    reset();
    onSubmitForm(info);
  };

  const handleClose = () => {
    toggle();
    reset();
  };

  const scoreWords = ['สั้นเกินไป', 'ง่าย', 'พอใช้ได้', 'ดี', 'ยอดเยี่ยม'];
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h6'>เพิ่มรายชื่อครู/อาจารย์</Typography>
        <Close fontSize='small' onClick={handleClose} sx={{ cursor: 'pointer' }} />
      </Header>
      <Box sx={{ p: 5 }}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='fullName'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  value={value}
                  label='ชื่อ-นามสกุล'
                  onChange={onChange}
                  placeholder='อธิฐาน สุขสวัสดิ์'
                  required
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName ? errors.fullName.message : ''}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='username'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  value={value}
                  label='ชื่อเข้าใช้งานระบบ'
                  onChange={onChange}
                  placeholder='nkxxx'
                  error={Boolean(errors.username)}
                  helperText={errors.username ? errors.username.message : ''}
                  required
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Fragment>
                  <CustomTextField
                    value={value}
                    type={showPassword ? 'text' : 'password'}
                    onChange={onChange}
                    id='password'
                    label='รหัสผ่าน'
                    placeholder='รหัสผ่าน'
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message as string}
                    aria-describedby='validation-schema-first-name'
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment aria-label='สลับการแสดงรหัสผ่านปัจจุบัน' position='end'>
                          <Tooltip title='สลับการแสดงรหัสผ่านปัจจุบัน' arrow>
                            <span>
                              <IconButton
                                edge='end'
                                aria-label='สลับการแสดงรหัสผ่านปัจจุบัน'
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={(event) => event.preventDefault()}
                              >
                                {showPassword ? (
                                  <IconifyIcon icon='mdi:eye-remove' />
                                ) : (
                                  <IconifyIcon icon='ic:round-remove-red-eye' />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <PasswordStrengthBar scoreWords={scoreWords} shortScoreWord={scoreWords[0]} password={value} />
                </Fragment>
              )}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
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
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='birthDate'
              control={control}
              render={({ field: { value, onChange } }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={th}>
                  <DatePicker
                    label='วันเกิด'
                    value={value}
                    onChange={onChange}
                    format='D MMMM BBBB'
                    maxDate={dayjs(new Date())}
                    slots={{
                      textField: CustomTextField,
                      openPickerIcon: () => <FcCalendar />
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        inputProps: {
                          placeholder: 'วัน/เดือน/ปี',
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button size='large' type='submit' variant='contained' sx={{ mr: 3 }}>
              เพิ่มรายชื่อ
            </Button>
            <Button size='large' variant='outlined' color='secondary' onClick={handleClose}>
              ยกเลิก
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default AddTeacherDrawer;
