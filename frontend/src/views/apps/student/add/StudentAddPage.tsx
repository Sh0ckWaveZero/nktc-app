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
import { useTheme } from '@mui/material/styles';
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
import { styled } from '@mui/material/styles';
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

const ImgStyled = styled('img')(() => ({
  width: 120,
  height: 120,
  borderRadius: 1,
}));

const RequiredTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
}));

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
    display: 'block',
    background: 'none',
    boxSizing: 'border-box',
    letterSpacing: 'inherit',
    borderRadius: '4px',
    lineHeight: '1.4375em',
    color: theme.palette.text.primary,
    border: `1px solid rgba(58, 53, 65, 0.24)`,
    ...theme.applyStyles('dark', {
      border: `1px solid ${hexToRGBA(theme.palette.secondary.main, 0.55)}`,
    }),
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

  const trail = useTrail(12, { // 12 main sections/fields
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
            variant='contained'
            color='secondary'
            startIcon={<Icon icon='ion:arrow-back-circle-outline' />}
            component={Link}
            href='/apps/student/list'
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
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
              overflow: 'visible',
              borderRadius: 1,
              boxShadow: (theme) => `0 12px 24px -4px ${theme.palette.divider}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              },
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 1 }} aria-label='add-student'>
                  <Icon icon='line-md:account-add' />
                </Avatar>
              }
              title='เพิ่มข้อมูลนักเรียนคนใหม่'
              titleTypographyProps={{ variant: 'h5', fontWeight: 700, letterSpacing: -0.5 }}
              subheader='กรอกข้อมูลพื้นฐานและที่อยู่ของนักเรียน'
              sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, p: 8 }}
            />
            <CardContent sx={{ p: 8 }}>
              <form id='student-add-form' onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={8}>
                  <AnimatedGrid size={12} style={trail[0]} sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ImgStyled 
                        src={imgSrc} 
                        alt='Profile Pic' 
                        sx={(theme) => ({ 
                          width: 120, 
                          height: 120, 
                          borderRadius: 1,
                          boxShadow: `0 4px 12px ${theme.palette.action.focus}` 
                        })} 
                      />
                      <Box>
                        <Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>รูปโปรไฟล์</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          <Button
                            id='student-add-upload-btn'
                            loading={loadingImg}
                            startIcon={<Icon icon={'uil:image-upload'} />}
                            variant='contained'
                            component='label'
                            htmlFor='account-settings-upload-image'
                            sx={{ borderRadius: 1, textTransform: 'none', px: 6 }}
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
                            sx={{ borderRadius: 1, textTransform: 'none' }}
                          >
                            รีเซ็ต
                          </Button>
                        </Box>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 3 }}>
                          อนุญาต PNG, JPEG หรือ WEBP ขนาดไม่เกิน 2MB
                        </Typography>
                      </Box>
                    </Box>
                  </AnimatedGrid>

                  <AnimatedGrid size={12} style={trail[1]} sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main', mb: 4 }}>
                      <Icon icon='bxs:user-detail' fontSize='1.25rem' />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>ข้อมูลส่วนตัว</Typography>
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            slotProps={{
                              htmlInput: {
                                maxLength: 11,
                                onKeyDown(e: KeyboardEvent) { handleKeyDown(e); },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={{ xs: 12, sm: 6 }} style={trail[3]}>
                    <FormControl fullWidth error={!!errors.title}>
                      <Controller
                        name='title'
                        control={control}
                        render={({ field }) => (
                          <>
                            <InputLabel id='student-add-title-label' required>คำนำหน้า</InputLabel>
                            <Select 
                              {...field}
                              id='student-add-title-select' 
                              labelId='student-add-title-label' 
                              label='คำนำหน้า'
                              sx={{ borderRadius: 2 }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            slotProps={{
                              htmlInput: {
                                maxLength: 13,
                                onKeyDown(e: KeyboardEvent) { handleKeyDown(e); },
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
                                sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            slotProps={{
                              htmlInput: {
                                maxLength: 10,
                                onKeyDown(e: KeyboardEvent) { handleKeyDown(e); },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </AnimatedGrid>

                  <AnimatedGrid size={12} style={trail[10]} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main', mb: 2 }}>
                      <Icon icon='icon-park-outline:guide-board' fontSize='1.25rem' />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>ที่อยู่ปัจจุบัน</Typography>
                    </Box>
                    <FormControl fullWidth sx={{ mb: 5 }}>
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        )}
                      />
                    </FormControl>
                    
                    <ThailandAddressTypeahead value={currentAddress} onValueChange={(val) => setCurrentAddress(val)}>
                      <Grid container spacing={5}>
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
                      <ThailandAddressTypeahead.Suggestion optionItemProps={{ style: { cursor: 'pointer', borderRadius: '4px' } }} />
                    </ThailandAddressTypeahead>
                  </AnimatedGrid>

                  <AnimatedGrid size={12} style={trail[11]} sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Button
                        id='student-add-submit-btn'
                        type='submit'
                        variant='contained'
                        disabled={!isDirty || !isValid}
                        sx={(theme) => ({ 
                          px: 10, 
                          py: 3, 
                          borderRadius: 1,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textTransform: 'none',
                          boxShadow: `0 8px 16px -4px ${hexToRGBA(theme.palette.primary.main, 0.4)}`,
                          '&:hover': { transform: 'translateY(-2px)' }
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
                          px: 10, 
                          py: 3, 
                          borderRadius: 2.5,
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          textTransform: 'none'
                        }}
                      >
                        ล้างข้อมูทั้งหมด
                      </Button>
                    </Box>
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
