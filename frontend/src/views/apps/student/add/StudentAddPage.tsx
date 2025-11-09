'use client';

import { z } from 'zod';

import {
  Autocomplete,
  Avatar,
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
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { ThailandAddressTypeahead, ThailandAddressValue, ThailandAddressValueHelper } from '@/@core/styles/libs/thailand-address';
import { useCreateStudent } from '@/hooks/queries/useStudents';
import { useClassrooms } from '@/hooks/queries/useClassrooms';

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
import { zodResolver } from '@hookform/resolvers/zod';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

interface Data {
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  classroom: Record<string, any> | null;
  idCard?: string;
  birthDate: Date | null;
  addressLine1?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
}

const initialData: Data = {
  studentId: '',
  title: '',
  firstName: '',
  lastName: '',
  classroom: null,
  idCard: '',
  birthDate: null,
  addressLine1: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
  phone: '',
};

const schema = z.object({
  studentId: z.string().min(1, 'กรุณากรอกรหัสนักศึกษา').min(11, 'รหัสนักเรียนต้องมีอย่างน้อย 11 ตัวอักษร'),
  title: z.string().min(1, 'กรุณาเลือกคำนำหน้าชื่อ'),
  firstName: z.string().min(3, 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'),
  lastName: z.string().min(3, 'นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร'),
  classroom: z
    .record(z.string(), z.any())
    .refine((obj) => obj && Object.keys(obj).length > 0, 'กรุณาเลือกชั้นเรียน')
    .nullable(),
  idCard: z.string().optional(),
  birthDate: z
    .date()
    .nullable()
    .refine((date) => !date || date <= new Date(), 'วันเกิดไม่ถูกต้อง'),
  addressLine1: z.string().optional(),
  subdistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
});

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

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const RequiredTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
}));

const StudentAddPage = () => {
  // hooks
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // React Query hooks
  const { data: classroomsData = [], isLoading: isClassroomLoading } = useClassrooms();
  const { mutate: createStudent, isPending: isCreating } = useCreateStudent();

  // ** State
  const [classroom, setClassroom] = useState([initialData.classroom]);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [inputValue, setInputValue] = useState<string>('');
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<ThailandAddressValue>(ThailandAddressValueHelper.empty());

  // Filter classrooms based on user role
  useEffect(() => {
    if (!classroomsData) return;

    if (user?.role?.toLowerCase() === 'admin') {
      setClassroom(classroomsData);
    } else {
      const teacherClassroom = classroomsData.filter((item: any) =>
        user?.teacherOnClassroom?.includes(item.id)
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
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<Data>({
    defaultValues: initialData,
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any, e: any) => {
    e.preventDefault();

    const { classroom: c, ...rest } = data;
    const student = {
      ...rest,
      ...currentAddress,
      classroom: c.id,
      level: c.level.id,
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
        onError: (error: any) => {
          toast.dismiss(toastId);
          toast.error(error?.response?.data?.error || 'เกิดข้อผิดพลาด');
        },
      }
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
    borderRadius: '8px',
    lineHeight: '1.4375em',
    color: theme.palette.text.primary,
    border: `1px solid rgba(58, 53, 65, 0.24)`,
    ...theme.applyStyles('dark', {
      border: `1px solid ${hexToRGBA(theme.palette.secondary.main, 0.55)}`,
    }),
  };

  const handleInputImageReset = () => {
    setInputValue('');
    setImgSrc('/images/avatars/1.png');
  };

  return (
    <>
      <Grid id='student-add-page' container spacing={4}>
        {/* Student Details */}
        <Grid size={12}>
          <LinkStyled href={`/apps/student/list`} passHref>
            <Button
              id='back-button'
              variant='contained'
              color='secondary'
              startIcon={<Icon icon='ion:arrow-back-circle-outline' />}
            >
              ย้อนกลับ
            </Button>
          </LinkStyled>
        </Grid>
        <Grid size={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                  <Icon icon='line-md:account-add' />
                </Avatar>
              }
              sx={{ color: 'text.primary' }}
              title={`เพิ่มข้อมูลนักเรียน`}
            />
            <CardContent>
              <form id='student-add-form' onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={5}>
                  <Grid sx={{ mt: 4.8, mb: 3 }} size={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ImgStyled src={imgSrc} alt='Profile Pic' />
                      <Box>
                        <Button
                          id='upload-image-button'
                          loading={loadingImg}
                          startIcon={<Icon icon={'uil:image-upload'} />}
                          variant='contained'
                          component='label'
                          htmlFor='account-settings-upload-image'
                        >
                          อัปโหลดรูปภาพส่วนตัว
                          <input
                            hidden
                            type='file'
                            value={inputValue}
                            onChange={handleInputImageChange}
                            accept='image/png, image/jpeg, image/webp'
                            id='account-settings-upload-image'
                          />
                        </Button>
                        <ResetButtonStyled
                          id='reset-image-button'
                          color='error'
                          variant='outlined'
                          onClick={handleInputImageReset}
                        >
                          รีเซ็ต
                        </ResetButtonStyled>
                        <Typography variant='body2' sx={{ mt: 5 }}>
                          อนุญาต PNG, JPEG หรือ WEBP
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <Grid container spacing={2} sx={{ color: 'secondary.main' }}>
                      <Grid>
                        <Icon icon='bxs:user-detail' />
                      </Grid>
                      <Grid>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ข้อมูลนักเรียน
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='studentId'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <RequiredTextField
                            fullWidth
                            required
                            type='tel'
                            id='studentId'
                            label='รหัสนักเรียน'
                            placeholder='รหัสนักเรียน'
                            value={value}
                            onChange={onChange}
                            error={!!errors.studentId}
                            helperText={errors.studentId ? (errors.studentId.message as string) : ''}
                            slotProps={{
                              htmlInput: {
                                maxLength: 11,
                                onKeyDown(e: any) {
                                  handleKeyDown(e);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth error={!!errors.title}>
                      <Controller
                        name='title'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <>
                            <InputLabel
                              id='title-label'
                              required
                              sx={{
                                '& .MuiInputLabel-asterisk': {
                                  color: 'error.main',
                                },
                              }}
                            >
                              คำนำหน้า
                            </InputLabel>
                            <Select id='title' labelId='title-label' label='คำนำหน้า' value={value} onChange={onChange}>
                              <MenuItem value=''>
                                <em>เลือกคำนำหน้า</em>
                              </MenuItem>
                              <MenuItem value='นาย'>นาย</MenuItem>
                              <MenuItem value='น.ส.'>นางสาว</MenuItem>
                            </Select>
                            {!!errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
                          </>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='firstName'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <RequiredTextField
                            fullWidth
                            required
                            id='firstName'
                            label='ชื่อ'
                            placeholder='ชื่อ'
                            value={value}
                            onChange={onChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName ? (errors.firstName.message as string) : ''}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='lastName'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <RequiredTextField
                            fullWidth
                            required
                            id='lastName'
                            label='นามสกุล'
                            placeholder='นามสกุล'
                            value={value}
                            onChange={onChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName ? (errors.lastName.message as string) : ''}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='classroom'
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <Autocomplete
                            disablePortal
                            id='classroom-autocomplete'
                            limitTags={15}
                            value={value}
                            options={classroom}
                            loading={isClassroomLoading}
                            onChange={(_, newValue: any) => onChange(newValue)}
                            getOptionLabel={(option: any) => option.name || ''}
                            isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                            renderInput={(params: any) => {
                              return (
                                <RequiredTextField
                                  {...params}
                                  required
                                  id='classroom'
                                  label='ชั้นเรียน'
                                  placeholder='เลือกชั้นเรียน'
                                  error={!!errors.classroom}
                                  helperText={errors.classroom?.message ? String(errors.classroom.message) : ''}
                                  slotProps={{
                                    input: {
                                      ref: undefined,
                                    },
                                    inputLabel: {
                                      shrink: true,
                                    },
                                  }}
                                />
                              );
                            }}
                            renderOption={(props, option, { selected }: any) => (
                              <ListItem {...props}>
                                <ListItemText primary={option.name} />
                              </ListItem>
                            )}
                            groupBy={(option: any) => option.department?.name}
                            noOptionsText='ไม่พบข้อมูล'
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='idCard'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <TextField
                            fullWidth
                            id='idCard'
                            type={'tel'}
                            label='เลขประจำตัวประชาชน'
                            placeholder='เลขประจำตัวประชาชน'
                            value={value}
                            onChange={onChange}
                            slotProps={{
                              htmlInput: {
                                maxLength: 13,
                                onKeyDown(e: any) {
                                  handleKeyDown(e);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='birthDate'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <ThaiDatePicker
                            label='วันเกิด'
                            format='dd MMMM yyyy'
                            minDate={new Date(new Date().getFullYear() - 20, 0, 1)}
                            maxDate={new Date()}
                            value={value}
                            onChange={onChange}
                            error={!!errors.birthDate}
                            helperText={errors.birthDate ? (errors.birthDate.message as string) : ''}
                            placeholder='วัน/เดือน/ปี (พ.ศ.)'
                            slotProps={{
                              textField: {
                                id: 'birthDate',
                                fullWidth: true,
                                input: {
                                  endAdornment: <FcCalendar />,
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='phone'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <TextField
                            fullWidth
                            id='phone'
                            type={'tel'}
                            label='เบอร์โทรศัพท์'
                            placeholder='เบอร์โทรศัพท์'
                            value={value}
                            onChange={onChange}
                            slotProps={{
                              htmlInput: {
                                maxLength: 10,
                                onKeyDown(e: any) {
                                  handleKeyDown(e);
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <Grid container spacing={2} sx={{ color: 'secondary.main' }}>
                      <Grid>
                        <Icon icon='icon-park-outline:guide-board' />
                      </Grid>
                      <Grid>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ที่อยู่ปัจจุบัน
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <Controller
                        name='addressLine1'
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <TextField
                            fullWidth
                            id='addressLine1'
                            label='ที่อยู่'
                            placeholder='ที่อยู่'
                            value={value}
                            onChange={onChange}
                            error={!!errors.addressLine1}
                            helperText={errors.addressLine1 ? (errors.addressLine1.message as string) : ''}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <ThailandAddressTypeahead value={currentAddress} onValueChange={(val) => setCurrentAddress(val)}>
                        <Grid container spacing={5}>
                          <Grid
                            size={{
                              xs: 12,
                              sm: 6,
                            }}
                          >
                            <ThailandAddressTypeahead.SubdistrictInput
                              className='sub-district-input'
                              style={addressInputStyle as any}
                              placeholder='ตำบล / แขวง'
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              sm: 6,
                            }}
                          >
                            <ThailandAddressTypeahead.DistrictInput
                              className='district-input'
                              style={addressInputStyle as any}
                              placeholder='อำเภอ / เขต'
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              sm: 6,
                            }}
                          >
                            <ThailandAddressTypeahead.ProvinceInput
                              className='province-input'
                              style={addressInputStyle as any}
                              placeholder='จังหวัด'
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              sm: 6,
                            }}
                          >
                            <ThailandAddressTypeahead.PostalCodeInput
                              className='postal-code-input'
                              style={addressInputStyle as any}
                              placeholder='รหัสไปรษณีย์'
                            />
                          </Grid>
                        </Grid>
                        <style>{`
                          .province-input:focus:not(:focus-visible) {
                            outline: none;
                          }
                          .district-input:focus:not(:focus-visible) {
                            outline: none;
                          }
                          .sub-district-input:focus:not(:focus-visible) {
                            outline: none;
                          }
                          .postal-code-input:focus:not(:focus-visible) {
                            outline: none;
                          }

                          .province-input:focus-visible {
                            outline: 2px solid #16b1ff;
                          }
                          .district-input:focus-visible {
                            outline: 2px solid #16b1ff;
                          }
                          .sub-district-input:focus-visible {
                            outline: 2px solid #16b1ff;
                          }
                          .postal-code-input:focus-visible {
                            outline: 2px solid #16b1ff;
                          }
                        `}</style>
                        <ThailandAddressTypeahead.Suggestion optionItemProps={{ style: { cursor: 'pointer' } }} />
                      </ThailandAddressTypeahead>
                      {/* </StyledContainer> */}
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <Button
                      id='submit-button'
                      type='submit'
                      variant='contained'
                      sx={{ mr: 4 }}
                      disabled={!isDirty || !isValid}
                    >
                      บันทึกการเพิ่มข้อมูล
                    </Button>
                    <Button
                      id='reset-button'
                      type='reset'
                      variant='outlined'
                      color='secondary'
                      onClick={() => {
                        reset();
                        setCurrentAddress(ThailandAddressValueHelper.empty());
                      }}
                      sx={{ mr: 4 }}
                    >
                      ล้างข้อมูล
                    </Button>
                    <LinkStyled href={`/apps/student/list`} passHref>
                      <Button
                        id='back-button-bottom'
                        variant='outlined'
                        color='secondary'
                        startIcon={<Icon icon='ion:arrow-back-circle-outline' />}
                      >
                        ย้อนกลับ
                      </Button>
                    </LinkStyled>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
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
