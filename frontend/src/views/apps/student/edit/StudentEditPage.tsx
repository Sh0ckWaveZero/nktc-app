'use client';

import * as yup from 'yup';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Fragment, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';

interface StudentEditPageProps {
  id: string;
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `กรุณากรอก ${field}`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
  } else {
    return '';
  }
};

const schema = yup.object().shape({
  studentId: yup
    .string()
    .required('กรุณากรอกรหัสนักศึกษา')
    .min(10, (obj) => showErrors('รหัสนักเรียน', obj.value.length, obj.min)),
  title: yup.string().required('กรุณาเลือกคำนำหน้า'),
  firstName: yup
    .string()
    .min(3, (obj) => showErrors('ชื่อ', obj.value.length, obj.min))
    .required(),
  lastName: yup
    .string()
    .min(3, (obj) => showErrors('นามสกุล', obj.value.length, obj.min))
    .required(),
  idCard: yup.string().optional(),
  phone: yup.string().optional(),
  status: yup.string().required('กรุณาเลือกสถานะ'),
});

interface FormData {
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  idCard?: string;
  phone?: string;
  status: string;
}

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius,
}));

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
}));

const StudentEditPage = ({ id }: StudentEditPageProps) => {
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onBlur',
    defaultValues: {
      studentId: id || '',
      title: '',
      firstName: '',
      lastName: '',
      idCard: '',
      phone: '',
      status: 'active'
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Student Edit Data:', data);
    toast.success('ข้อมูลนักเรียนได้รับการแก้ไขแล้ว');
  };

  const onChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <Card>
      <CardHeader title='แก้ไขข้อมูลนักเรียน' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImgStyled src={imgSrc} alt='Profile Pic' />
                <Box>
                  <Typography variant='h6'>อัปโหลดรูปโปรไฟล์</Typography>
                  <Typography variant='body2' sx={{ marginTop: 5 }}>
                    อนุญาตไฟล์ JPG, GIF หรือ PNG ขนาดไม่เกิน 800K
                  </Typography>
                  <Button
                    component='label'
                    variant='contained'
                    htmlFor='account-settings-upload-image'
                    sx={{ marginTop: 4 }}
                  >
                    อัปโหลดรูปใหม่
                    <input
                      hidden
                      type='file'
                      onChange={onChange}
                      accept='image/png, image/jpeg'
                      id='account-settings-upload-image'
                    />
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='studentId'
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    value={value}
                    onBlur={onBlur}
                    label='รหัสนักเรียน'
                    onChange={onChange}
                    placeholder='กรอกรหัสนักเรียน'
                    error={Boolean(errors.studentId)}
                    helperText={errors.studentId?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='title'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControl fullWidth error={Boolean(errors.title)}>
                    <InputLabel>คำนำหน้า</InputLabel>
                    <Select
                      value={value}
                      label='คำนำหน้า'
                      onChange={onChange}
                    >
                      <MenuItem value='นาย'>นาย</MenuItem>
                      <MenuItem value='นางสาว'>นางสาว</MenuItem>
                      <MenuItem value='นาง'>นาง</MenuItem>
                    </Select>
                    {errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='firstName'
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    value={value}
                    onBlur={onBlur}
                    label='ชื่อ'
                    onChange={onChange}
                    placeholder='กรอกชื่อ'
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='lastName'
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    value={value}
                    onBlur={onBlur}
                    label='นามสกุล'
                    onChange={onChange}
                    placeholder='กรอกนามสกุล'
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='idCard'
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    value={value}
                    onBlur={onBlur}
                    label='เลขประจำตัวประชาชน'
                    onChange={onChange}
                    placeholder='กรอกเลขประจำตัวประชาชน'
                    error={Boolean(errors.idCard)}
                    helperText={errors.idCard?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='phone'
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    fullWidth
                    value={value}
                    onBlur={onBlur}
                    label='เบอร์โทรศัพท์'
                    onChange={onChange}
                    placeholder='กรอกเบอร์โทรศัพท์'
                    error={Boolean(errors.phone)}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='status'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <InputLabel>สถานะ</InputLabel>
                    <Select
                      value={value}
                      label='สถานะ'
                      onChange={onChange}
                    >
                      <MenuItem value='active'>เรียนอยู่</MenuItem>
                      <MenuItem value='inactive'>ไม่เรียนแล้ว</MenuItem>
                      <MenuItem value='graduated'>จบการศึกษา</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
                  บันทึกการเปลี่ยนแปลง
                </Button>
                <Button
                  type='reset'
                  variant='outlined'
                  color='secondary'
                  onClick={() => router.back()}
                >
                  ยกเลิก
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentEditPage;