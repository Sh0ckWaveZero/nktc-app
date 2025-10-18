import { z } from 'zod';

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
import React, { Fragment, useState } from 'react';

import { BoxProps } from '@mui/material/Box';
import Close from 'mdi-material-ui/Close';
import { FcCalendar } from 'react-icons/fc';
import IconifyIcon from '@/@core/components/icon';
import PasswordStrengthBar from 'react-password-strength-bar';
import { PatternFormat } from 'react-number-format';
import { styled } from '@mui/material/styles';
import { zodResolver } from '@hookform/resolvers/zod';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

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
  birthDate: Date | null;
  jobTitle: string;
}

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
  const { open, toggle, onSubmitForm } = props;

  const schema = z
    .object({
      fullName: z
        .string()
        .min(3, 'ชื่อ-นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร')
        .refine((value) => value.split(' ').length > 1, 'ต้องมีเว้นวรรคระหว่าง ชื่อและนามสกุล')
        .regex(/^[\u0E00-\u0E7F\s]+$/, 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น'),
      username: z
        .string()
        .min(3, 'ชื่อผู้ใช้งานระบบต้องมีอย่างน้อย 3 ตัวอักษร')
        .regex(/^[A-Za-z0-9]+$/, 'กรุณากรอกเฉพาะภาษาอังกฤษและตัวเลขเท่านั้น'),
      password: z
        .string()
        .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        .regex(
          /^[A-Za-z0-9!@#\$%\^&\*\(\)-_+=\[\]\{\}\\\|;:'",<.>\/?`~]+$/,
          'กรุณากรอกเฉพาะภาษาอังกฤษและตัวเลขเท่านั้น',
        ),
      birthDate: z.date().nullable(),
      idCard: z.string().optional(),
      jobTitle: z.string().optional(),
    })
    .refine(
      async (data) => {
        if (data.username) {
          return !props.data.find((item: any) => item.username === data.username);
        }
        return true;
      },
      {
        message: 'ชื่อผู้ใช้งานนี้มีอยู่แล้ว',
        path: ['username'],
      },
    );

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
    resolver: zodResolver(schema),
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
                <React.Fragment>
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
                    slotProps={{
                      input: {
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
                      },
                    }}
                  />
                  <PasswordStrengthBar scoreWords={scoreWords} shortScoreWord={scoreWords[0]} password={value} />
                </React.Fragment>
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
                <ThaiDatePicker
                  label='วันเกิด'
                  value={value ? new Date(value) : null}
                  onChange={onChange}
                  format='d MMMM yyyy'
                  maxDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      inputProps: {
                        placeholder: 'วัน/เดือน/ปี (พ.ศ.)',
                      },
                      InputProps: {
                        endAdornment: <FcCalendar />,
                      },
                    },
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='jobTitle'
              control={control}
              render={({ field: { value, onChange } }) => (
                <React.Fragment>
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
                </React.Fragment>
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
