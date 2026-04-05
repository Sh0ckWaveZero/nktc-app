'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
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
import { Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
  ThailandAddressTypeahead,
  ThailandAddressValue,
  ThailandAddressValueHelper,
} from '@/@core/styles/libs/thailand-address';
import { useCreateStudent } from '@/hooks/queries/useStudents';
import { useClassrooms } from '@/hooks/queries/useClassrooms';

import { useSpring, useTrail, animated } from 'react-spring';
import { FcCalendar } from 'react-icons/fc';
import Icon from '@/@core/components/icon';
import Link from 'next/link';
import { handleKeyDown } from '@/utils/event';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import useImageCompression from '@/hooks/useImageCompression';
import { useRouter } from 'next/navigation';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { useStudentAddForm, type StudentAddFormData } from '@/hooks/features/student';
import type { Classroom } from '@/types/apps/teacherTypes';

interface ClassroomOption extends Classroom {
  id: string;
  name: string;
  department?: { id?: string; name?: string };
  level?: { id?: string; levelName?: string };
}

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

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: CONTROL_RADIUS,
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
  boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
  objectFit: 'cover',
}));

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

const RequiredTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
}));

const FORM_CONTROL_SX = {
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

const StudentAddPage = () => {
  // hooks
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // React Query hooks
  const { data: classroomsData = [], isLoading: isClassroomLoading } = useClassrooms();
  const { mutate: createStudent } = useCreateStudent();

  // ** State
  const [classroom, setClassroom] = useState<ClassroomOption[]>([]);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<ThailandAddressValue>(ThailandAddressValueHelper.empty());

  // Filter classrooms based on user role
  useEffect(() => {
    if (!classroomsData) return;

    if (user?.role?.toLowerCase() === 'admin') {
      setClassroom(classroomsData as ClassroomOption[]);
    } else {
      const teacherClassroom = classroomsData.filter((item: ClassroomOption) =>
        user?.teacherOnClassroom?.includes(item.id),
      );
      setClassroom(teacherClassroom);
    }
  }, [classroomsData, user]);

  const { imageCompressed, handleInputImageChange } = useImageCompression();

  useEffect(() => {
    if (imageCompressed) {
      setLoadingImg(true);
      setImgSrc(imageCompressed);
      setLoadingImg(false);
    }
  }, [imageCompressed]);

  // ** Hook
  const { reset, control, handleSubmit, errors, isDirty, isValid } = useStudentAddForm();

  const onSubmit = (data: StudentAddFormData) => {
    if (!data.classroom) return;

    const { classroom: c, ...rest } = data;
    const student = {
      ...rest,
      ...currentAddress,
      classroom: c.id,
      level: c.level?.id,
      avatar: imgSrc === '/images/avatars/1.png' ? null : imgSrc,
    };

    const toastId = toast.info('กำลังบันทึกข้อมูล...', {
      autoClose: false,
      hideProgressBar: true,
    });

    createStudent(
      { userId: user?.id || '', params: student },
      {
        onSuccess: () => {
          toast.dismiss(toastId);
          toast.success('บันทึกข้อมูลสำเร็จ');
          router.push(`/apps/student/list?classroom=${c.id}`);
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { error?: string } } };
          toast.dismiss(toastId);
          toast.error(err?.response?.data?.error || 'เกิดข้อผิดพลาด');
        },
      },
    );
  };

  const addressInputStyle = {
    padding: '15px 14px',
    width: '100%',
    font: 'inherit',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'block',
    background: 'none',
    boxSizing: 'border-box',
    letterSpacing: '-0.01em',
    borderRadius: `${CONTROL_RADIUS}px`,
    lineHeight: '1.4375em',
    color: theme.palette.text.primary,
    backgroundColor: getControlSurfaceColor(theme),
    border: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.12)}`,
  };

  const handleInputImageReset = () => {
    setImgSrc('/images/avatars/1.png');
  };

  // Animations
  const cardSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(24px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 22 },
  });

  const trail = useTrail(12, {
    // 12 main sections/fields
    from: { opacity: 0, transform: 'translateY(12px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 300,
  });

  return (
    <>
      <Grid id='student-add-container' container spacing={4}>
        <Grid size={12}>
          <Button
            id='student-add-back-btn'
            variant='outlined'
            color='secondary'
            startIcon={<Icon icon='ion:arrow-back-circle-outline' />}
            component={Link}
            href='/apps/student/list'
            sx={{
              borderRadius: `${CONTROL_RADIUS}px`,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 700,
              borderColor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.18 : 0.14),
              bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.48 : 0.72),
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
              },
            }}
          >
            ย้อนกลับ
          </Button>
        </Grid>
        <Grid size={12}>
          <AnimatedCard
            id='student-add-card'
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
                  aria-label='add-student'
                >
                  <Icon icon='line-md:account-add' />
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
                    เพิ่มข้อมูลนักเรียนคนใหม่
                  </Typography>
                </Box>
              }
              subheader='กรอกข้อมูลพื้นฐาน รูปโปรไฟล์ และที่อยู่ของนักเรียนจากแผงเดียว'
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
              <form id='student-add-form' onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={{ xs: 3, sm: 4 }}>
                  <AnimatedGrid size={12} style={trail[0]}>
                    <SectionSurface sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: { xs: 2, sm: 3.5 },
                        }}
                      >
                        <ImgStyled
                          src={imgSrc}
                          alt='Profile Pic'
                          sx={{
                            width: { xs: 96, sm: 120 },
                            height: { xs: 96, sm: 120 },
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <SectionTitle>รูปโปรไฟล์</SectionTitle>
                          <SectionDescription>
                            อัปโหลดรูปสำหรับบัญชีนักเรียนเพื่อให้การค้นหาและยืนยันตัวตนทำได้ง่ายขึ้น
                          </SectionDescription>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2.5 }}>
                            <Button
                              id='student-add-upload-btn'
                              loading={loadingImg}
                              startIcon={<Icon icon={'uil:image-upload'} />}
                              variant='contained'
                              component='label'
                              htmlFor='account-settings-upload-image'
                              sx={{
                                minHeight: 48,
                                borderRadius: `${CONTROL_RADIUS}px`,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 700,
                                boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
                              }}
                            >
                              อัปโหลดรูปภาพ
                              <input
                                hidden
                                type='file'
                                onChange={handleInputImageChange}
                                accept='image/png, image/jpeg, image/webp'
                                id='account-settings-upload-image'
                              />
                            </Button>
                            <Button
                              id='student-add-image-reset-btn'
                              color='error'
                              variant='outlined'
                              onClick={handleInputImageReset}
                              sx={{
                                minHeight: 48,
                                borderRadius: `${CONTROL_RADIUS}px`,
                                textTransform: 'none',
                                px: 2.5,
                                fontWeight: 700,
                              }}
                            >
                              รีเซ็ต
                            </Button>
                          </Box>
                          <Typography variant='body2' color='text.secondary' sx={{ mt: 2, fontWeight: 500 }}>
                            อนุญาต PNG, JPEG หรือ WEBP ขนาดไม่เกิน 2MB
                          </Typography>
                        </Box>
                      </Box>
                    </SectionSurface>
                  </AnimatedGrid>

                  <AnimatedGrid size={12} style={trail[1]} sx={{ pt: { xs: 1, sm: 2 } }}>
                    <Box>
                      <SectionTitle>ข้อมูลส่วนตัว</SectionTitle>
                      <SectionDescription>
                        กรอกข้อมูลหลักที่ใช้สร้างบัญชีและผูกนักเรียนเข้ากับห้องเรียน
                      </SectionDescription>
                    </Box>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[2]}>
                    <FormControl fullWidth>
                      <Controller
                        name='studentId'
                        control={control}
                        render={({ field }) => (
                          <RequiredTextField
                            {...field}
                            id='student-add-id-field'
                            fullWidth
                            required
                            label='รหัสนักเรียน'
                            placeholder='รหัสนักศึกษา 10-11 หลัก'
                            error={!!errors.studentId}
                            helperText={errors.studentId?.message as string}
                            sx={FORM_CONTROL_SX}
                            slotProps={{
                              htmlInput: {
                                maxLength: 11,
                                onKeyDown(e: KeyboardEvent) {
                                  handleKeyDown(e);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[3]}>
                    <FormControl fullWidth error={!!errors.title} sx={FORM_CONTROL_SX}>
                      <Controller
                        name='title'
                        control={control}
                        render={({ field }) => (
                          <>
                            <InputLabel id='student-add-title-label' required>
                              คำนำหน้า
                            </InputLabel>
                            <Select
                              {...field}
                              id='student-add-title-select'
                              labelId='student-add-title-label'
                              label='คำนำหน้า'
                              sx={FORM_CONTROL_SX}
                            >
                              <MenuItem value='นาย'>นาย</MenuItem>
                              <MenuItem value='น.ส.'>นางสาว</MenuItem>
                            </Select>
                            {!!errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
                          </>
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[4]}>
                    <FormControl fullWidth>
                      <Controller
                        name='firstName'
                        control={control}
                        render={({ field }) => (
                          <RequiredTextField
                            {...field}
                            id='student-add-first-name-field'
                            fullWidth
                            required
                            label='ชื่อ'
                            placeholder='กรอกชื่อภาษาไทย'
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message as string}
                            sx={FORM_CONTROL_SX}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[5]}>
                    <FormControl fullWidth>
                      <Controller
                        name='lastName'
                        control={control}
                        render={({ field }) => (
                          <RequiredTextField
                            {...field}
                            id='student-add-last-name-field'
                            fullWidth
                            required
                            label='นามสกุล'
                            placeholder='กรอกนามสกุลภาษาไทย'
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message as string}
                            sx={FORM_CONTROL_SX}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[6]}>
                    <FormControl fullWidth>
                      <Controller
                        name='classroom'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Autocomplete
                            disablePortal
                            id='student-add-classroom-autocomplete'
                            value={value ?? null}
                            options={classroom}
                            loading={isClassroomLoading}
                            onChange={(_, newValue) => onChange(newValue)}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, val) => option.id === val.id}
                            groupBy={(option) => option.department?.name || ''}
                            renderInput={(params) => (
                              <RequiredTextField
                                {...params}
                                required
                                label='ชั้นเรียน'
                                error={!!errors.classroom}
                                helperText={errors.classroom?.message as string}
                                sx={FORM_CONTROL_SX}
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
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[7]}>
                    <FormControl fullWidth>
                      <Controller
                        name='idCard'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            id='student-add-id-card-field'
                            fullWidth
                            label='เลขประจำตัวประชาชน'
                            placeholder='กรอกเลข 13 หลัก'
                            error={!!errors.idCard}
                            helperText={errors.idCard?.message as string}
                            sx={FORM_CONTROL_SX}
                            slotProps={{
                              htmlInput: {
                                maxLength: 13,
                                onKeyDown(e: KeyboardEvent) {
                                  handleKeyDown(e);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[8]}>
                    <FormControl fullWidth>
                      <Controller
                        name='birthDate'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <ThaiDatePicker
                            label='วันเกิด'
                            format='dd MMMM yyyy'
                            value={value}
                            onChange={onChange}
                            error={!!errors.birthDate}
                            helperText={errors.birthDate?.message as string}
                            placeholder='วัน/เดือน/ปี (พ.ศ.)'
                            id='student-add-birth-date-picker'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                sx: FORM_CONTROL_SX,
                                input: {
                                  endAdornment: <FcCalendar fontSize='1.5rem' />,
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[9]}>
                    <FormControl fullWidth>
                      <Controller
                        name='phone'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            id='student-add-phone-field'
                            fullWidth
                            label='เบอร์โทรศัพท์'
                            placeholder='0XXXXXXXXX'
                            error={!!errors.phone}
                            helperText={errors.phone?.message as string}
                            sx={FORM_CONTROL_SX}
                            slotProps={{
                              htmlInput: {
                                maxLength: 10,
                                onKeyDown(e: KeyboardEvent) {
                                  handleKeyDown(e);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={12} style={trail[10]} sx={{ pt: { xs: 1, sm: 2 } }}>
                    <Box sx={{ mb: 2.5 }}>
                      <SectionTitle>ที่อยู่ปัจจุบัน</SectionTitle>
                      <SectionDescription>ใช้สำหรับข้อมูลติดต่อและเอกสารที่เกี่ยวข้องกับนักเรียน</SectionDescription>
                    </Box>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <Controller
                        name='addressLine1'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            id='student-add-address-field'
                            fullWidth
                            label='ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)'
                            placeholder='กรอกที่อยู่'
                            error={!!errors.addressLine1}
                            helperText={errors.addressLine1?.message as string}
                            sx={FORM_CONTROL_SX}
                          />
                        )}
                      />
                    </FormControl>

                    <ThailandAddressTypeahead value={currentAddress} onValueChange={(val) => setCurrentAddress(val)}>
                      <Grid container spacing={{ xs: 2, sm: 3 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ThailandAddressTypeahead.SubdistrictInput
                            id='student-add-subdistrict-input'
                            className='sub-district-input'
                            style={addressInputStyle as any}
                            placeholder='ตำบล / แขวง'
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ThailandAddressTypeahead.DistrictInput
                            id='student-add-district-input'
                            className='district-input'
                            style={addressInputStyle as any}
                            placeholder='อำเภอ / เขต'
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ThailandAddressTypeahead.ProvinceInput
                            id='student-add-province-input'
                            className='province-input'
                            style={addressInputStyle as any}
                            placeholder='จังหวัด'
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ThailandAddressTypeahead.PostalCodeInput
                            id='student-add-postal-code-input'
                            className='postal-code-input'
                            style={addressInputStyle as any}
                            placeholder='รหัสไปรษณีย์'
                          />
                        </Grid>
                      </Grid>
                      <style>{`
                        .sub-district-input, .district-input, .province-input, .postal-code-input {
                          transition: border-color 0.2s, box-shadow 0.2s;
                        }
                        .sub-district-input:focus, .district-input:focus, .province-input:focus, .postal-code-input:focus {
                          outline: none;
                          border-color: ${theme.palette.primary.main} !important;
                          box-shadow: 0 0 0 2px ${hexToRGBA(theme.palette.primary.main, 0.2)};
                        }
                      `}</style>
                      <ThailandAddressTypeahead.Suggestion
                        optionItemProps={{ style: { cursor: 'pointer', borderRadius: '10px' } }}
                      />
                    </ThailandAddressTypeahead>
                  </AnimatedGrid>

                  <AnimatedGrid size={12} style={trail[11]} sx={{ pt: { xs: 1.5, sm: 2.5 } }}>
                    <SectionSurface sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2 }}>
                        <Button
                          id='student-add-submit-btn'
                          type='submit'
                          variant='contained'
                          disabled={!isDirty || !isValid}
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
                        >
                          บันทึกข้อมูลนักเรียน
                        </Button>
                        <Button
                          id='student-add-reset-btn'
                          type='reset'
                          variant='outlined'
                          color='secondary'
                          onClick={() => {
                            reset();
                            setCurrentAddress(ThailandAddressValueHelper.empty());
                          }}
                          sx={{
                            minHeight: 50,
                            px: { xs: 3, sm: 4.5 },
                            py: 1.5,
                            borderRadius: `${CONTROL_RADIUS}px`,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                          }}
                        >
                          ล้างข้อมูลทั้งหมด
                        </Button>
                      </Box>
                    </SectionSurface>
                  </AnimatedGrid>
                </Grid>
              </form>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>
    </>
  );
};

StudentAddPage.acl = {
  action: 'create',
  subject: 'add-student-page',
};

export default StudentAddPage;
