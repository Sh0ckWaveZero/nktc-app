'use client';

import { z } from 'zod';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { useState, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { type Theme } from '@mui/material/styles';
import { useStudent, useUpdateStudent } from '@/hooks/queries/useStudents';
import { useClassrooms } from '@/hooks/queries/useClassrooms';
import type { Classroom } from '@/types/apps/teacherTypes';
import { useSpring, animated } from 'react-spring';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import Icon from '@/@core/components/icon';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { FcCalendar } from 'react-icons/fc';

interface StudentEditPageProps {
  id: string;
}

const schema = z.object({
  studentId: z.string().min(1, 'กรุณากรอกรหัสนักศึกษา').min(10, 'รหัสนักเรียนต้องมีอย่างน้อย 10 ตัวอักษร'),
  title: z.string().min(1, 'กรุณาเลือกคำนำหน้า'),
  firstName: z.string().min(3, 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'),
  lastName: z.string().min(3, 'นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร'),
  classroom: z
    .object({
      id: z.string(),
      name: z.string(),
      department: z.object({ id: z.string(), name: z.string() }).optional(),
      level: z.object({ id: z.string(), levelName: z.string() }).optional(),
    })
    .nullable(),
  idCard: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{13}$/.test(val), 'เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก'),
  birthDate: z.date().nullable(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
  addressLine1: z.string().optional(),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
});

type FormDataType = z.infer<typeof schema>;

// Shared styles for form items to ensure visual rhythm
const FORM_ITEM_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
  },
};

const AnimatedCard = animated(Card);
const AnimatedGrid = animated(Grid);

const StudentEditPage = ({ id }: StudentEditPageProps) => {
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const router = useRouter();

  // React Query hooks
  const { data: studentData, isLoading } = useStudent(id);
  const { data: classroomsData = [], isLoading: isClassroomLoading } = useClassrooms();
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormDataType>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      studentId: '',
      title: '',
      firstName: '',
      lastName: '',
      classroom: null,
      idCard: '',
      birthDate: null,
      phone: '',
      addressLine1: '',
      status: 'normal',
    },
  });

  // Animations
  const cardSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 20 },
  });

  // Snappier entrance for the form
  const formSpring = useSpring({
    from: { opacity: 0, scale: 0.98 },
    to: { opacity: 1, scale: 1 },
    config: { tension: 400, friction: 30 },
  });

  // Populate form when student data loads
  useEffect(() => {
    if (!studentData) return;

    const account = studentData.user?.account;

    reset({
      studentId: studentData.studentId || '',
      title: account?.title || '',
      firstName: account?.firstName || '',
      lastName: account?.lastName || '',
      classroom: studentData.classroom
        ? {
            id: studentData.classroom.id,
            name: studentData.classroom.name,
            department: studentData.classroom.department,
            level: studentData.classroom.level,
          }
        : null,
      idCard: account?.idCard || '',
      birthDate: account?.birthDate ? new Date(account.birthDate) : null,
      phone: account?.phone || '',
      addressLine1: account?.addressLine1 || '',
      status: studentData.status || 'normal',
    });

    // Load existing profile picture if available
    const avatar = account?.avatar;
    if (avatar) {
      setImgSrc(avatar);
    } else {
      setImgSrc('/images/avatars/1.png');
    }
  }, [studentData, reset]);

  const onSubmit = (data: FormDataType) => {
    // Structure data for backend update parity
    const updatePayload = {
      studentId: data.studentId,
      status: data.status,
      classroomId: data.classroom?.id,
      account: {
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        idCard: data.idCard,
        phone: data.phone,
        birthDate: data.birthDate,
        addressLine1: data.addressLine1,
      },
    };

    updateStudent(
      { studentId: id, params: updatePayload },
      {
        onSuccess: () => {
          toast.success('ข้อมูลนักเรียนได้รับการแก้ไขแล้ว');
          router.back();
        },
        onError: (error) => {
          console.error('Error updating student:', error);
          toast.error('ไม่สามารถแก้ไขข้อมูลนักเรียนได้');
        },
      },
    );
  };

  const handleAvatarChange = (event: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = event.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatedCard
      id='student-edit-card'
      style={cardSpring}
      sx={(theme: Theme) => ({
        position: 'relative',
        overflow: 'visible',
        borderRadius: 1,
        boxShadow: `0 12px 24px -4px ${theme.palette.divider}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        },
      })}
    >
      <CardHeader
        title='แก้ไขข้อมูลนักเรียน'
        titleTypographyProps={{ variant: 'h5', fontWeight: 700, letterSpacing: -0.5 }}
        subheader='จัดการข้อมูลส่วนตัวและรูปภาพของนักเรียน'
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, pb: 4 }}
      />
      <CardContent sx={{ p: 8 }}>
        <form id='student-edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <AnimatedGrid size={12} style={formSpring} sx={{ mb: 2, mt: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <Avatar
                  alt='Profile Pic'
                  src={imgSrc}
                  variant='rounded'
                  sx={{ width: 120, height: 120, borderRadius: '10px' }}
                  imgProps={{
                    onError: () => setImgSrc('/images/avatars/1.png')
                  }}
                />
                <Box>
                  <Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
                    รูปโปรไฟล์นักเรียน
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    อนุญาตไฟล์ JPG, GIF หรือ PNG ขนาดไม่เกิน 800K
                  </Typography>
                  <Button
                    id='student-edit-upload-btn'
                    component='label'
                    variant='outlined'
                    htmlFor='account-settings-upload-image'
                    sx={{
                      marginTop: 4,
                      borderRadius: 1,
                      textTransform: 'none',
                      px: 6,
                      borderWidth: 1.5,
                      '&:hover': { borderWidth: 1.5 },
                    }}
                  >
                    อัปโหลดรูปใหม่
                    <input
                      hidden
                      type='file'
                      onChange={handleAvatarChange}
                      accept='image/png, image/jpeg'
                      id='account-settings-upload-image'
                    />
                  </Button>
                </Box>
              </Box>
            </AnimatedGrid>

            <AnimatedGrid size={12} style={formSpring} sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main', mb: 4 }}>
                <Icon icon='bxs:user-detail' fontSize='1.25rem' />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  ข้อมูลส่วนตัว
                </Typography>
              </Box>
            </AnimatedGrid>

            {/* Profile Section */}
            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='studentId'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='student-edit-id-field'
                    fullWidth
                    label='รหัสนักเรียน'
                    placeholder='กรอกรหัสนักเรียน'
                    error={Boolean(errors.studentId)}
                    helperText={errors.studentId?.message}
                    sx={FORM_ITEM_SX}
                  />
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.title)} sx={FORM_ITEM_SX}>
                    <InputLabel id='student-edit-title-label'>คำนำหน้า</InputLabel>
                    <Select
                      {...field}
                      id='student-edit-title-select'
                      labelId='student-edit-title-label'
                      label='คำนำหน้า'
                    >
                      <MenuItem value='นาย'>นาย</MenuItem>
                      <MenuItem value='นางสาว'>นางสาว</MenuItem>
                      <MenuItem value='นาง'>นาง</MenuItem>
                    </Select>
                    {errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='firstName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='student-edit-first-name-field'
                    fullWidth
                    label='ชื่อ'
                    placeholder='กรอกชื่อ'
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                    sx={FORM_ITEM_SX}
                  />
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='lastName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='student-edit-last-name-field'
                    fullWidth
                    label='นามสกุล'
                    placeholder='กรอกนามสกุล'
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                    sx={FORM_ITEM_SX}
                  />
                )}
              />
            </AnimatedGrid>

            {/* Educational Section */}
            <AnimatedGrid size={12} style={formSpring} sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main', mb: 4 }}>
                <Icon icon='ph:graduation-cap-bold' fontSize='1.25rem' />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  ข้อมูลการศึกษา
                </Typography>
              </Box>
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='classroom'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    disablePortal
                    id='student-edit-classroom-autocomplete'
                    value={value ?? null}
                    options={classroomsData}
                    loading={isClassroomLoading}
                    onChange={(_, newValue) => onChange(newValue)}
                    getOptionLabel={(option) => option.name || ''}
                    isOptionEqualToValue={(option, val) => option.id === val.id}
                    groupBy={(option: Classroom) => option.department?.name || ''}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='ชั้นเรียน'
                        error={Boolean(errors.classroom)}
                        helperText={errors.classroom?.message as string}
                        sx={FORM_ITEM_SX}
                      />
                    )}
                    renderOption={(props, option) => (
                      <ListItem {...props} key={option.id}>
                        <ListItemText primary={option.name} secondary={`${option.level?.levelName || ''}`} />
                      </ListItem>
                    )}
                  />
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.status)} sx={FORM_ITEM_SX}>
                    <InputLabel id='student-edit-status-label'>สถานะ</InputLabel>
                    <Select
                      {...field}
                      id='student-edit-status-select'
                      labelId='student-edit-status-label'
                      label='สถานะ'
                    >
                      <MenuItem value='normal'>เรียนอยู่</MenuItem>
                      <MenuItem value='dropout'>ไม่เรียนแล้ว</MenuItem>
                      <MenuItem value='graduated'>จบการศึกษา</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </AnimatedGrid>

            {/* Contact Section */}
            <AnimatedGrid size={12} style={formSpring} sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main', mb: 4 }}>
                <Icon icon='ph:phone-bold' fontSize='1.25rem' />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  ข้อมูลการติดต่อและที่อยู่
                </Typography>
              </Box>
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='idCard'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='student-edit-id-card-field'
                    fullWidth
                    label='เลขประจำตัวประชาชน'
                    placeholder='กรอกเลขประจำตัวประชาชน'
                    error={Boolean(errors.idCard)}
                    helperText={errors.idCard?.message}
                    sx={FORM_ITEM_SX}
                  />
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='birthDate'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <ThaiDatePicker
                    label='วันเกิด'
                    format='dd MMMM yyyy'
                    value={value}
                    onChange={onChange}
                    placeholder='วัน/เดือน/ปี (พ.ศ.)'
                    id='student-edit-birth-date-picker'
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: FORM_ITEM_SX,
                        input: {
                          endAdornment: <FcCalendar fontSize='1.5rem' />,
                        },
                      },
                    }}
                  />
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={{ xs: 12, sm: 6 }} style={formSpring}>
              <Controller
                name='phone'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='student-edit-phone-field'
                    fullWidth
                    label='เบอร์โทรศัพท์'
                    placeholder='กรอกเบอร์โทรศัพท์'
                    error={Boolean(errors.phone)}
                    helperText={errors.phone?.message}
                    sx={FORM_ITEM_SX}
                  />
                )}
              />
            </AnimatedGrid>

            <AnimatedGrid size={12} style={formSpring}>
              <Controller
                name='addressLine1'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id='student-edit-address-field'
                    fullWidth
                    label='ที่อยู่'
                    placeholder='บ้านเลขที่, หมู่, ซอย, ถนน'
                    error={Boolean(errors.addressLine1)}
                    helperText={errors.addressLine1?.message}
                    sx={FORM_ITEM_SX}
                  />
                )}
              />
            </AnimatedGrid>

            <Grid size={12} sx={{ mt: 8, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Button
                  id='student-edit-submit-btn'
                  variant='contained'
                  type='submit'
                  sx={(theme: Theme) => ({
                    px: 10,
                    py: 3,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    boxShadow: `0 8px 16px -4px ${hexToRGBA(theme.palette.primary.main, 0.4)}`,
                    '&:hover': { transform: 'translateY(-2px)' },
                  })}
                  disabled={isUpdating}
                >
                  {isUpdating ? <CircularProgress size={20} color='inherit' sx={{ mr: 2 }} /> : null}
                  บันทึกข้อมูล
                </Button>
                <Button
                  id='student-edit-cancel-btn'
                  variant='outlined'
                  color='secondary'
                  onClick={() => router.back()}
                  sx={{
                    px: 10,
                    py: 3,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}
                >
                  ยกเลิก
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </AnimatedCard>
  );
};

export default StudentEditPage;
