// ** React Imports
import { useState, useEffect } from 'react';

// ** MUI Imports
import {
  Box,
  Grid,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  FormHelperText,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

import { styled } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';

// ** Form Imports
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// ** Icons Imports
import { FcCalendar } from 'react-icons/fc';
import Icon from '@/@core/components/icon';

// ** Hooks & Services
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import useImageCompression from '@/hooks/useImageCompression';
import { useClassroomStore, useDepartmentStore } from '@/store/index';
import { useTeacherStore } from '@/store/apps/teacher';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import { shallow } from 'zustand/shallow';
import { isEmpty } from '@/@core/utils/utils';
import { generateErrorMessages } from '@/utils/event';
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

const TabAccount = () => {
  // Hooks
  const auth = useAuth();
  const { refetch: refetchCurrentUser } = useCurrentUser();

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
  const { isLoading, image } = useGetImage(imgSrc);

  useEffect(() => {
    (async () => {
      await fetchDepartment().then(async (data: any) => {
        setDepartmentValues(await data);
      });
    })();
  }, []);

  useEffect(() => {
    if (imageCompressed) {
      setImgSrc(imageCompressed);
    }
  }, [imageCompressed]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchClassroom().then(async (data: any) => {
        setClassrooms(await data);
        const defaultClassroom: any =
          (await data.filter((item: any) => auth?.user?.teacherOnClassroom?.includes(item.id))) ?? [];
        setClassroomSelected(defaultClassroom);
        setLoading(false);
      });
    })();
  }, [departmentValues]);

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
    formState: { errors },
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

        // Refetch current user data
        const { data: updatedUser } = await refetchCurrentUser();
        if (updatedUser) {
          auth?.setUser(updatedUser);
          window.localStorage.setItem('userData', JSON.stringify(updatedUser));
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              <FormControl fullWidth>
                <Controller
                  name='title'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <InputLabel id='title-label'>คำนำหน้า *</InputLabel>
                      <Select id='title' labelId='title-label' label='คำนำหน้า *' onChange={onChange} value={value}>
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
              <FormControl fullWidth>
                <Controller
                  name='firstName'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      fullWidth
                      id='firstName'
                      label='ชื่อ *'
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
                    <TextField
                      fullWidth
                      id='lastName'
                      label='นามสกุล *'
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
                  name='jobTitle'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <InputLabel id='jobTitle-label'>ตำแหน่ง</InputLabel>
                      <Select
                        id='jobTitle'
                        labelId='jobTitle-label'
                        label='ตำแหน่ง'
                        defaultValue={value}
                        value={value}
                        onChange={onChange}
                      >
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
                      <InputLabel id='academicStanding-label'>วิทยฐานะ</InputLabel>
                      <Select
                        id='academicStanding'
                        labelId='academicStanding-label'
                        label='วิทยฐานะ'
                        value={value}
                        onChange={onChange}
                      >
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
                    <FormControl error={!!errors.department}>
                      <InputLabel id='department-label'>แผนกวิชา *</InputLabel>
                      <Select
                        id='department'
                        labelId='department-label'
                        label='แผนกวิชา *'
                        value={value}
                        onChange={onChange}
                      >
                        <MenuItem value=''>
                          <em>เลือกแผนกวิชา</em>
                        </MenuItem>
                        {!isEmpty(departmentValues)
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
                id='teacherOnClassroom'
                multiple={true}
                limitTags={15}
                value={classroomSelected}
                options={classrooms}
                loading={loading}
                onChange={(_, newValue: any) => onHandleChange(_, newValue)}
                getOptionLabel={(option: any) => option?.name ?? ''}
                isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
                renderOption={(props: any, option: any) => {
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
                      id='teacherOnClassroom-input'
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
                          id: 'birthDate',
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
              <Button id={'submit-account'} variant='contained' sx={{ mr: 3.5 }} type='submit'>
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

export default TabAccount;
