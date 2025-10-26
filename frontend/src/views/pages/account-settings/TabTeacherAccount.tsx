import { z } from 'zod';

import {
  Autocomplete,
  Box,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useClassroomStore, useDepartmentStore, useUserStore } from '@/store/index';

import { FcCalendar } from 'react-icons/fc';
import Icon from '@/@core/components/icon';
import { generateErrorMessages } from '@/utils/event';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import useImageQuery from '@/hooks/useImageQuery';
import useImageCompression from '@/hooks/useImageCompression';
import { useTeacherStore } from '../../../store/apps/teacher/index';
import { zodResolver } from '@hookform/resolvers/zod';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

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

const schema = z.object({
  title: z.string().min(1, 'กรุณาเลือกคำนำหน้าชื่อ'),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  jobTitle: z.string(),
  academicStanding: z.string(),
  department: z.string().min(1, 'กรุณาเลือกแผนกวิชา'),
  teacherOnClassroom: z.array(z.any()),
  avatar: z.string(),
  birthDate: z.date().nullable(),
  idCard: z.string(),
});

const TabTeacherAccount = () => {
  // Hooks
  const { getMe }: any = useUserStore(
    (state) => ({
      getMe: state.getMe,
    }),
    shallow,
  );
  const auth = useAuth();

  const { fetchClassroom }: any = useClassroomStore(
    (state) => ({ classroom: state.classroom, fetchClassroom: state.fetchClassroom }),
    shallow,
  );
  const { fetchDepartment } = useDepartmentStore((state) => ({ fetchDepartment: state.fetchDepartment }), shallow);
  const { updateProfile } = useTeacherStore((state) => ({ updateProfile: state.updateProfile }), shallow);

  // ** State
  const [imgSrc, setImgSrc] = useState<string>((auth?.user?.account?.avatar as any) || '/images/avatars/1.png');
  const [classrooms, setClassrooms] = useState<any>([]);
  const [classroomSelected, setClassroomSelected] = useState<any>([]);
  const [departmentValues, setDepartmentValues] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { imageCompressed, handleInputImageChange, isCompressing } = useImageCompression();
  const { isLoading, image } = useImageQuery(imgSrc);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load departments
        const departments = await fetchDepartment();
        setDepartmentValues(Array.isArray(departments) ? departments : []);

        // Validate and reset department value if it doesn't exist in the loaded options
        if (auth?.user?.teacher?.department?.id) {
          const currentDeptId = auth.user.teacher.department.id;
          const deptExists = Array.isArray(departments) && departments.some((dept: any) => dept.id === currentDeptId);
          if (!deptExists) {
            // Reset department field to empty if current department not found in options
            reset({
              ...defaultValues,
              department: '',
            });
          }
        }

        // Load classrooms
        setLoading(true);
        const classroomsData = await fetchClassroom();

        // Handle both null and empty array
        if (!classroomsData) {
          setClassrooms([]);
          setClassroomSelected([]);
          setLoading(false);
          return;
        }

        setClassrooms(classroomsData);

        // Filter selected classrooms
        if (classroomsData.length > 0 && auth?.user?.teacherOnClassroom) {
          const teacherClassrooms = auth.user.teacherOnClassroom;

          // Support both array of IDs and array of objects
          const teacherClassroomIds = teacherClassrooms.map((item: any) =>
            typeof item === 'string' ? item : item?.id || item,
          );

          const defaultClassroom = classroomsData.filter((item: any) => teacherClassroomIds.includes(item.id));

          setClassroomSelected(defaultClassroom);
        } else {
          setClassroomSelected([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setClassrooms([]);
        setClassroomSelected([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (imageCompressed) {
      setImgSrc(imageCompressed);
    }
  }, [imageCompressed]);

  const defaultValues = {
    title: auth?.user?.account?.title ?? '',
    firstName: auth?.user?.account?.firstName ?? '',
    lastName: auth?.user?.account?.lastName ?? '',
    jobTitle: auth?.user?.teacher?.jobTitle ?? '',
    academicStanding: auth?.user?.teacher?.academicStanding ?? '',
    department: auth?.user?.teacher?.department?.id ?? '',
    teacherOnClassroom: auth?.user?.teacherOnClassroom ?? [],
    avatar: auth?.user?.account?.avatar ?? '',
    birthDate: auth?.user?.account?.birthDate ? new Date(auth?.user?.account?.birthDate) : null,
    idCard: auth?.user?.account?.idCard ?? '',
  };

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const onHandleChange = (event: any, value: any) => {
    event.preventDefault();
    setClassroomSelected(value);
  };

  const onSubmit = async (data: any, e: any) => {
    e.preventDefault();

    if (!auth?.user?.id) {
      return toast.error('กรุณาเข้าสู่ระบบก่อนทำการบันทึกโปรไฟล์');
    }
    const image = imgSrc === '/images/avatars/1.png' ? data?.account?.avatar : imgSrc;

    const profile = {
      id: auth?.user?.id,
      teacherInfo: auth?.user?.teacher?.id,
      accountId: auth?.user?.account?.id,
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      jobTitle: data.jobTitle,
      academicStanding: data.academicStanding,
      department: data.department,
      avatar: image ? image : null,
      birthDate: data.birthDate === '' ? null : data.birthDate ? new Date(data.birthDate) : null,
      idCard: data.idCard,
      classrooms: classroomSelected.map((item: any) => item.id),
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await updateProfile(profile).then(async (res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });

        await getMe().then(async (data: any) => {
          auth?.setUser({ ...(await data) });
          window.localStorage.setItem('userData', JSON.stringify(data));
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent>
          <Grid container spacing={5}>
            <Grid sx={{ mt: 4.8, mb: 3 }} size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isLoading || isCompressing ? (
                  <CircularProgress
                    size={80}
                    sx={{
                      mr: (theme) => theme.spacing(6.25),
                    }}
                  />
                ) : (
                  <ImgStyled src={image as string} alt='Profile Pic' loading='lazy' />
                )}
                <Box>
                  <Button
                    loading={isCompressing}
                    startIcon={<Icon icon={'uil:image-upload'} />}
                    variant='contained'
                    component='label'
                    htmlFor='account-settings-upload-image'
                  >
                    อัปโหลดรูปภาพส่วนตัว
                    <input
                      hidden
                      type='file'
                      onChange={handleInputImageChange}
                      accept='image/png, image/jpeg, image/webp'
                      id='account-settings-upload-image'
                    />
                  </Button>
                  <ResetButtonStyled
                    color='error'
                    variant='outlined'
                    onClick={() => {
                      setImgSrc('/images/avatars/1.png');
                    }}
                  >
                    รีเซ็ต
                  </ResetButtonStyled>
                  <Typography variant='body2' sx={{ mt: 5 }}>
                    ไฟล์ที่อนุญาต PNG หรือ JPEG ขนาดสูงสุด 800K.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 2,
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
                        required
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main',
                          },
                        }}
                      >
                        คำนำหน้า
                      </InputLabel>
                      <Select label='คำนำหน้า' onChange={onChange} value={value}>
                        <MenuItem value=''>
                          <em>เลือกคำนำหน้า</em>
                        </MenuItem>
                        <MenuItem value='นาง'>นาง</MenuItem>
                        <MenuItem value='นาย'>นาย</MenuItem>
                        <MenuItem value='นางสาว'>นางสาว</MenuItem>
                        <MenuItem value='ดร'>ดร.</MenuItem>
                        <MenuItem value='ผ.ศ.'>ผ.ศ.</MenuItem>
                        <MenuItem value='ร.ศ.'>ร.ศ.</MenuItem>
                        <MenuItem value='ศ.'>ศ.</MenuItem>
                      </Select>
                      {errors.title ? <FormHelperText>{errors.title.message as string}</FormHelperText> : null}
                    </>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <FormControl fullWidth error={!!errors.firstName}>
                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      id='ชื่อ'
                      label='ชื่อ'
                      placeholder='ชื่อ'
                      value={value}
                      onChange={onChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName ? (errors.firstName.message as string) : ''}
                      required
                      slotProps={{
                        inputLabel: {
                          sx: {
                            '& .MuiInputLabel-asterisk': {
                              color: 'error.main',
                            },
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
              <FormControl fullWidth error={!!errors.lastName}>
                <Controller
                  name='lastName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      id='นามสกุล'
                      label='นามสกุล'
                      placeholder='นามสกุล'
                      value={value}
                      onChange={onChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName ? (errors.lastName.message as string) : ''}
                      required
                      slotProps={{
                        inputLabel: {
                          sx: {
                            '& .MuiInputLabel-asterisk': {
                              color: 'error.main',
                            },
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
                  name='jobTitle'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <>
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
                  name='academicStanding'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <InputLabel>วิทยฐานะ</InputLabel>
                      <Select label='วิทยฐานะ' value={value} onChange={onChange}>
                        <MenuItem value=''>
                          <em>เลือกวิทยฐานะ</em>
                        </MenuItem>
                        <MenuItem value='ไม่มีวิทยฐานะ'>ไม่มีวิทยฐานะ</MenuItem>
                        <MenuItem value='ชำนาญการ'>ชำนาญการ</MenuItem>
                        <MenuItem value='ชำนาญการพิเศษ'>ชำนาญการพิเศษ</MenuItem>
                        <MenuItem value='เชี่ยวชาญ'>เชี่ยวชาญ</MenuItem>
                        <MenuItem value='เชี่ยวชาญพิเศษ'>เชี่ยวชาญพิเศษ</MenuItem>
                      </Select>
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
                  name='department'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel
                        required
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main',
                          },
                        }}
                      >
                        แผนกวิชา
                      </InputLabel>
                      <Select label='แผนกวิชา' value={value} onChange={onChange} required>
                        <MenuItem value=''>
                          <em>เลือกแผนกวิชา</em>
                        </MenuItem>
                        {!isEmpty(departmentValues) && Array.isArray(departmentValues)
                          ? departmentValues.map((department: any) => (
                              <MenuItem key={department.id} value={department.id}>
                                {department.name}
                              </MenuItem>
                            ))
                          : null}
                      </Select>
                      {errors.department ? (
                        <FormHelperText>{errors.department.message as string}</FormHelperText>
                      ) : null}
                    </FormControl>
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
                      value={value}
                      onChange={onChange}
                      type={'number'}
                      id='idCard'
                      label='รหัสบัตรประจำตัวประชาชน'
                      placeholder='รหัสบัตรประจำตัวประชาชน'
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
              <Autocomplete
                id='checkboxes-tags-teacher-classroom'
                multiple={true}
                limitTags={15}
                value={classroomSelected}
                options={classrooms}
                loading={loading}
                onChange={(_, newValue: any) => onHandleChange(_, newValue)}
                getOptionLabel={(option: any) => option?.name ?? ''}
                isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                renderOption={(props: any, option: any, { selected }: any) => {
                  const { key, onClick, className, ...otherProps } = props;
                  return (
                    <li key={option.id} onClick={onClick} className={className} {...(otherProps as any)}>
                      {option.name}
                    </li>
                  );
                }}
                renderInput={(params: any) => {
                  return (
                    <TextField
                      {...params}
                      label='ครูที่ปรึกษาระดับชั้น'
                      placeholder='เลือกห้องเรียน'
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
                slotProps={{
                  paper: {
                    sx: { maxHeight: 200 },
                  },
                }}
                groupBy={(option: any) => option.department?.name}
                noOptionsText='ไม่พบข้อมูล'
              />
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
                      value={value}
                      onChange={onChange}
                      format='dd/MM/yyyy'
                      maxDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          inputProps: {
                            placeholder: 'วัน/เดือน/ปี (พ.ศ.)',
                          },
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
            <Grid size={12}>
              <Button
                id={'submit-account'}
                variant='contained'
                sx={{ mr: 3.5 }}
                type='submit'
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
              <Button type='reset' variant='outlined' color='secondary' onClick={() => reset()}>
                รีเซ็ต
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </form>
    </>
  );
};

export default TabTeacherAccount;
