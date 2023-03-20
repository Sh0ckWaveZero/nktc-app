import * as yup from 'yup';

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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Fragment, useEffect, useState } from 'react';
import { useClassroomStore, useDepartmentStore, useUserStore } from '@/store/index';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FcCalendar } from 'react-icons/fc';
import Icon from '@/@core/components/icon';
import LoadingButton from '@mui/lab/LoadingButton';
import { LocalStorageService } from '@/services/localStorageService';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import dayjs from 'dayjs';
import { generateErrorMessages } from 'utils/event';
import { isEmpty } from '@/@core/utils/utils';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';
import th from 'dayjs/locale/th';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import useImageCompression from '@/hooks/useImageCompression';
import { useTeacherStore } from '../../../store/apps/teacher/index';
import { yupResolver } from '@hookform/resolvers/yup';

dayjs.extend(buddhistEra);

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

const schema = yup.object().shape({
  title: yup.string().required('กรุณาเลือกคำนำหน้าชื่อ'),
  firstName: yup.string().required('กรุณากรอกชื่อ'),
  lastName: yup.string().required('กรุณากรอกนามสกุล'),
  jobTitle: yup.string(),
  academicStanding: yup.string(),
  department: yup.string().required('กรุณาเลือกแผนกวิชา'),
  teacherOnClassroom: yup.array(),
  avatar: yup.string(),
  birthDate: yup.date().nullable().default(null),
  idCard: yup.string(),
});

const localStorage = new LocalStorageService();
const storedToken = localStorage.getToken()!;

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
  const { isLoading, image } = useGetImage(imgSrc, storedToken);

  useEffect(() => {
    (async () => {
      await fetchDepartment(storedToken).then(async (data: any) => {
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
      await fetchClassroom(storedToken).then(async (data: any) => {
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
    avatar: auth?.user?.account?.avatar ?? '',
    birthDate: auth?.user?.account?.birthDate ? dayjs(new Date(auth?.user?.account?.birthDate)) : null,
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
    resolver: yupResolver(schema),
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
      birthDate: data.birthDate === '' ? null : data.birthDate ? dayjs(new Date(data.birthDate)) : null,
      idCard: data.idCard,
      classrooms: classroomSelected.map((item: any) => item.id),
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await updateProfile(storedToken, profile).then(async (res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });

        await getMe(storedToken).then(async (data: any) => {
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
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sx={{ mt: 4.8, mb: 3 }}>
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
                  <LoadingButton
                    loading={isCompressing}
                    loadingPosition='start'
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
                  </LoadingButton>
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
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <Controller
                  name='title'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Fragment>
                      <InputLabel>คำนำหน้า</InputLabel>
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
                    </Fragment>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
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
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='jobTitle'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Fragment>
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
                    </Fragment>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='academicStanding'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Fragment>
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
                    </Fragment>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='department'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <FormControl error={!!errors.department}>
                      <InputLabel>แผนกวิชา</InputLabel>
                      <Select label='แผนกวิชา' value={value} onChange={onChange}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <Autocomplete
                id='checkboxes-tags-teacher-classroom'
                multiple={true}
                limitTags={15}
                value={classroomSelected}
                options={classrooms}
                loading={loading}
                onChange={(_, newValue: any) => onHandleChange(_, newValue)}
                getOptionLabel={(option: any) => option?.name ?? ''}
                isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
                renderOption={(props, option) => (
                  <li key={option.classroomId} {...props}>
                    {option.name}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label='ครูที่ปรึกษาระดับชั้น' placeholder='เลือกห้องเรียน' />
                )}
                disableCloseOnSelect
                filterSelectedOptions
                groupBy={(option: any) => option.department?.name}
                noOptionsText='ไม่พบข้อมูล'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='birthDate'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={th}>
                      <DatePicker
                        label='วันเกิด'
                        value={value}
                        inputFormat='dd/MM/BBBB'
                        maxDate={dayjs(new Date())}
                        onChange={onChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            inputProps={{
                              ...params.inputProps,
                              placeholder: 'วัน/เดือน/ปี',
                            }}
                          />
                        )}
                        mask='__/__/____'
                        components={{
                          OpenPickerIcon: () => <FcCalendar />,
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
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
    </Fragment>
  );
};

export default TabTeacherAccount;
