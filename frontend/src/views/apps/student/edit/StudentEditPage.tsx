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
import { useStudent, useUpdateStudent } from '@/hooks/queries/useStudents';
import { useClassrooms } from '@/hooks/queries/useClassrooms';
import type { Classroom } from '@/types/apps/teacherTypes';
import { useSpring, animated } from 'react-spring';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import Icon from '@/@core/components/icon';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { FcCalendar } from 'react-icons/fc';
import { alpha, styled } from '@mui/material/styles';

interface StudentEditPageProps {
  id: string;
}

const ID_CARD_REGEX = /^\d{13}$/;
const MASKED_ID_CARD_REGEX = /^x-xxxx-xxxxx-x-\d{2}$/i;

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
    .refine(
      (val) => !val || ID_CARD_REGEX.test(val) || MASKED_ID_CARD_REGEX.test(val),
      'เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก',
    ),
  birthDate: z.date().nullable(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'),
  addressLine1: z.string().optional(),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
});

type FormDataType = z.infer<typeof schema>;

const PANEL_RADIUS = 16;
const SECTION_RADIUS = 14;
const CONTROL_RADIUS = 12;

const getPanelBorderColor = (theme: any) =>
  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1);
const getPanelShadowColor = (theme: any) =>
  theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.24) : alpha(theme.palette.primary.main, 0.05);
const getSurfaceBackground = (theme: any) =>
  theme.palette.mode === 'dark'
    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.background.paper, 0.985)} 18%, ${alpha(theme.palette.background.paper, 0.995)} 100%)`
    : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.035)} 0%, ${alpha(theme.palette.background.paper, 0.99)} 16%, ${theme.palette.background.paper} 100%)`;
const getSectionSurfaceBackground = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.72 : 0.82);
const getControlSurfaceColor = (theme: any) =>
  alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.84);

const SectionSurface = styled(Box)(({ theme }) => ({
  borderRadius: SECTION_RADIUS,
  border: `1px solid ${getPanelBorderColor(theme)}`,
  backgroundColor: getSectionSurfaceBackground(theme),
  boxShadow:
    theme.palette.mode === 'dark'
      ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.03)}`
      : `0 8px 18px ${alpha(theme.palette.primary.main, 0.035)}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: 'clamp(0.92rem, 0.86rem + 0.16vw, 1rem)',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.88 : 0.82),
  '&::before': {
    content: '""',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.72 : 0.64),
    boxShadow:
      theme.palette.mode === 'dark'
        ? `0 0 0 6px ${alpha(theme.palette.primary.main, 0.08)}`
        : `0 0 0 5px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const SectionDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  maxWidth: '58ch',
  fontSize: 'clamp(0.94rem, 0.9rem + 0.18vw, 1.04rem)',
  fontWeight: 500,
  lineHeight: 1.6,
  color: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.8) : theme.palette.text.secondary,
}));

const FORM_ITEM_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${CONTROL_RADIUS}px`,
    backgroundColor: (theme: any) => getControlSurfaceColor(theme),
    color: 'text.primary',
    fontSize: 'clamp(1rem, 0.96rem + 0.12vw, 1.05rem)',
    transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
    '& fieldset': {
      borderColor: (theme: any) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.12),
    },
    '&:hover fieldset': {
      borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.28),
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputBase-input': {
    letterSpacing: '-0.01em',
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'text.secondary',
    opacity: 1,
    fontWeight: 500,
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.92rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  '& .MuiInputLabel-shrink': {
    fontSize: '0.86rem',
  },
  '& .MuiFormHelperText-root': {
    color: 'text.secondary',
    fontWeight: 500,
  },
} as const;

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
    formState: { dirtyFields, errors },
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
    const accountPayload: {
      title: string;
      firstName: string;
      lastName: string;
      phone?: string;
      birthDate: Date | null;
      addressLine1?: string;
      idCard?: string;
    } = {
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      birthDate: data.birthDate,
      addressLine1: data.addressLine1,
    };

    if (dirtyFields.idCard && data.idCard && !MASKED_ID_CARD_REGEX.test(data.idCard)) {
      accountPayload.idCard = data.idCard;
    }

    if (dirtyFields.idCard && !data.idCard) {
      accountPayload.idCard = '';
    }

    // Structure data for backend update parity
    const updatePayload = {
      studentId: data.studentId,
      status: data.status,
      classroomId: data.classroom?.id,
      account: accountPayload,
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
      <Card
        sx={{
          borderRadius: `${PANEL_RADIUS}px`,
          border: (theme) => `1px solid ${getPanelBorderColor(theme)}`,
          boxShadow: (theme) => `0 18px 42px ${getPanelShadowColor(theme)}`,
          background: (theme) => getSurfaceBackground(theme),
        }}
      >
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
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${PANEL_RADIUS}px`,
        border: (theme) => `1px solid ${getPanelBorderColor(theme)}`,
        boxShadow: (theme) => `0 18px 42px ${getPanelShadowColor(theme)}`,
        background: (theme) => getSurfaceBackground(theme),
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              width: { xs: 52, sm: 56 },
              height: { xs: 52, sm: 56 },
            }}
            aria-label='edit-student'
          >
            <Icon icon='tabler:edit-circle' />
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Typography
              component='span'
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.35rem', sm: '1.9rem' },
                letterSpacing: { xs: '-0.02em', sm: '-0.03em' },
                lineHeight: { xs: 1.14, sm: 1.08 },
                color: 'text.primary',
              }}
            >
              แก้ไขข้อมูลนักเรียน
            </Typography>
          </Box>
        }
        subheader='อัปเดตข้อมูลส่วนตัว การศึกษา และช่องทางติดต่อของนักเรียนจากแผงเดียว'
        subheaderTypographyProps={{
          sx: {
            mt: 1,
            maxWidth: '60ch',
            fontSize: 'clamp(0.94rem, 0.9rem + 0.18vw, 1.04rem)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'text.secondary',
          },
        }}
        sx={{
          px: { xs: 2.25, sm: 4, lg: 5 },
          pt: { xs: 2.5, sm: 4 },
          pb: { xs: 2, sm: 2.5 },
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          '& .MuiCardHeader-avatar': {
            mr: { xs: 1.75, sm: 2.25 },
          },
          '& .MuiCardHeader-content': {
            minWidth: 0,
          },
        }}
      />
      <CardContent sx={{ px: { xs: 2.25, sm: 4, lg: 5 }, py: { xs: 2.5, sm: 4 } }}>
        <form id='student-edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            <AnimatedGrid size={12} style={formSpring}>
              <SectionSurface sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, sm: 3.5 },
                  }}
                >
                  <Avatar
                    alt='Profile Pic'
                    src={imgSrc}
                    variant='rounded'
                    sx={{
                      width: { xs: 96, sm: 120 },
                      height: { xs: 96, sm: 120 },
                      borderRadius: `${CONTROL_RADIUS}px`,
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                      boxShadow: (theme) =>
                        `0 12px 28px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
                    }}
                    imgProps={{
                      onError: () => setImgSrc('/images/avatars/1.png'),
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <SectionTitle>รูปโปรไฟล์</SectionTitle>
                    <SectionDescription>อัปเดตรูปสำหรับใช้แสดงผลและช่วยให้ค้นหานักเรียนได้ง่ายขึ้น</SectionDescription>
                    <Button
                      id='student-edit-upload-btn'
                      component='label'
                      variant='outlined'
                      htmlFor='account-settings-upload-image'
                      sx={{
                        mt: 2.5,
                        minHeight: 48,
                        borderRadius: `${CONTROL_RADIUS}px`,
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 700,
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
              </SectionSurface>
            </AnimatedGrid>

            <AnimatedGrid size={12} style={formSpring} sx={{ pt: { xs: 1, sm: 2 } }}>
              <Box>
                <SectionTitle>ข้อมูลส่วนตัว</SectionTitle>
                <SectionDescription>แก้ไขข้อมูลหลักของนักเรียนและรายละเอียดที่ใช้แสดงบนระบบ</SectionDescription>
              </Box>
            </AnimatedGrid>

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

            <AnimatedGrid size={12} style={formSpring} sx={{ pt: { xs: 1, sm: 2 } }}>
              <Box>
                <SectionTitle>ข้อมูลการศึกษา</SectionTitle>
                <SectionDescription>ตรวจสอบห้องเรียนและสถานะปัจจุบันของนักเรียนให้ถูกต้อง</SectionDescription>
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

            <AnimatedGrid size={12} style={formSpring} sx={{ pt: { xs: 1, sm: 2 } }}>
              <Box>
                <SectionTitle>ข้อมูลการติดต่อและที่อยู่</SectionTitle>
                <SectionDescription>ใช้สำหรับติดต่อและอ้างอิงข้อมูลสำคัญของนักเรียนในภายหลัง</SectionDescription>
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

            <Grid size={12} sx={{ pt: { xs: 1.5, sm: 2.5 } }}>
              <SectionSurface sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2 }}>
                  <Button
                    id='student-edit-submit-btn'
                    variant='contained'
                    type='submit'
                    sx={(theme) => ({
                      minHeight: 50,
                      px: { xs: 3, sm: 4.5 },
                      py: 1.5,
                      borderRadius: `${CONTROL_RADIUS}px`,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      boxShadow: `0 10px 24px ${hexToRGBA(theme.palette.primary.main, 0.22)}`,
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
                      minHeight: 50,
                      px: { xs: 3, sm: 4.5 },
                      py: 1.5,
                      borderRadius: `${CONTROL_RADIUS}px`,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    ยกเลิก
                  </Button>
                </Box>
              </SectionSurface>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </AnimatedCard>
  );
};

export default StudentEditPage;
