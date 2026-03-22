'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { type ButtonProps } from '@mui/material/Button';
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
  const { mutate: createStudent } = useCreateStudent();

  // ** State
  const [classroom, setClassroom] = useState<ClassroomOption[]>([]);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [inputValue, setInputValue] = useState<string>('');
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
          <Button
            id='back-button'
            variant='contained'
            color='secondary'
            startIcon={<Icon icon='ion:arrow-back-circle-outline' />}
            component={Link}
            href='/apps/student/list'
          >
            ย้อนกลับ
          </Button>
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
                    <Grid container spacing={2} sx={{ color: 'secondary.main' }} id='student-info-section'>
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
                            label='รหัสนักเรียน'
                            placeholder='รหัสนักศึกษา'
                            value={value}
                            onChange={onChange}
                            error={!!errors.studentId}
                            helperText={errors.studentId ? (errors.studentId.message as string) : ''}
                            id='studentId'
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
                            label='ชื่อ'
                            placeholder='ชื่อ'
                            value={value}
                            onChange={onChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName ? (errors.firstName.message as string) : ''}
                            id='firstName'
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
                            label='นามสกุล'
                            placeholder='นามสกุล'
                            value={value}
                            onChange={onChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName ? (errors.lastName.message as string) : ''}
                            id='lastName'
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
                            value={value ?? null}
                            options={classroom}
                            loading={isClassroomLoading}
                            onChange={(_, newValue) => onChange(newValue)}
                            getOptionLabel={(option: ClassroomOption) => option.name || ''}
                            isOptionEqualToValue={(option: ClassroomOption, value: ClassroomOption) =>
                              option.id === value.id
                            }
                            renderInput={(params) => {
                              return (
                                <RequiredTextField
                                  {...params}
                                  required
                                  label='ชั้นเรียน'
                                  placeholder='เลือกชั้นเรียน'
                                  error={!!errors.classroom}
                                  helperText={errors.classroom?.message ? String(errors.classroom.message) : ''}
                                  id='classroom'
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
                            renderOption={(props, option: ClassroomOption, { selected }: { selected: boolean }) => (
                              <ListItem {...props}>
                                <ListItemText primary={option.name} />
                              </ListItem>
                            )}
                            groupBy={(option: ClassroomOption) => option.department?.name || ''}
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
                            type={'tel'}
                            label='เลขประจำตัวประชาชน'
                            placeholder='เลขประจำตัวประชาชน'
                            value={value}
                            onChange={onChange}
                            id='idCard'
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
                            id='birthDate'
                            slotProps={{
                              textField: {
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
                            type={'tel'}
                            label='เบอร์โทรศัพท์'
                            placeholder='เบอร์โทรศัพท์'
                            value={value}
                            onChange={onChange}
                            id='phone'
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
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <Grid container spacing={2} sx={{ color: 'secondary.main' }} id='address-section'>
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
                            label='ที่อยู่'
                            placeholder='ที่อยู่'
                            value={value}
                            onChange={onChange}
                            error={!!errors.addressLine1}
                            helperText={errors.addressLine1 ? (errors.addressLine1.message as string) : ''}
                            id='addressLine1'
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
                              id='subdistrict'
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
                              id='district'
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
                              id='province'
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
                              id='postalCode'
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
