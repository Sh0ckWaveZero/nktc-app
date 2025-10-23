'use client';

import { z } from 'zod';
import {
  Box,
  Button,
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
  CircularProgress,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import httpClient from '@/@core/utils/http';

interface StudentEditPageProps {
  id: string;
}

const schema = z.object({
  studentId: z.string().min(1, 'กรุณากรอกรหัสนักศึกษา').min(10, 'รหัสนักเรียนต้องมีอย่างน้อย 10 ตัวอักษร'),
  title: z.string().min(1, 'กรุณาเลือกคำนำหน้า'),
  firstName: z.string().min(3, 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'),
  lastName: z.string().min(3, 'นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร'),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
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

const StudentEditPage = ({ id }: StudentEditPageProps) => {
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      studentId: '',
      title: '',
      firstName: '',
      lastName: '',
      idCard: '',
      phone: '',
      status: 'normal',
    },
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/students/profile/${id}`);

        const data = response.data;
        reset({
          studentId: data.studentId || '',
          title: data.title || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          idCard: data.idCard || '',
          phone: data.phone || '',
          status: data.status || 'normal',
        });

        // Load existing profile picture if available
        if (data.avatar) {
          setImgSrc(data.avatar);
        } else {
          // Use default avatar if no avatar is set
          setImgSrc('/images/avatars/1.png');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('ไม่สามารถโหลดข้อมูลนักเรียนได้');
        // Set default avatar on error
        setImgSrc('/images/avatars/1.png');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data: FormData) => {
    try {
      await httpClient.put(`${process.env.NEXT_PUBLIC_API_URL}/students/profile/${id}`, data);

      toast.success('ข้อมูลนักเรียนได้รับการแก้ไขแล้ว');
      router.back();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('ไม่สามารถแก้ไขข้อมูลนักเรียนได้');
    }
  };

  const onChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

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
                    <Select value={value} label='คำนำหน้า' onChange={onChange}>
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
                    <Select value={value} label='สถานะ' onChange={onChange}>
                      <MenuItem value='normal'>เรียนอยู่</MenuItem>
                      <MenuItem value='dropout'>ไม่เรียนแล้ว</MenuItem>
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
                <Button type='reset' variant='outlined' color='secondary' onClick={() => router.back()}>
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
