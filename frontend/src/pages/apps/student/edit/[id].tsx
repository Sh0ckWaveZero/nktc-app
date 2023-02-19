import * as yup from 'yup';

import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { ChangeEvent, Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { ThailandAddressTypeahead, ThailandAddressValue } from '@/@core/styles/libs/thailand-address';
import dayjs, { Dayjs } from 'dayjs';
import { generateErrorMessages, handleKeyDown } from 'utils/event';
import { useClassroomStore, useStudentStore } from '@/store/index';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FcCalendar } from 'react-icons/fc';
import { GetServerSideProps } from 'next';
import Icon from '@/@core/components/icon';
import Link from 'next/link';
import LoadingButton from '@mui/lab/LoadingButton';
import { LocalStorageService } from '@/services/localStorageService';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import httpClient from '@/@core/utils/http';
import { shallow } from 'zustand/shallow';
import th from 'dayjs/locale/th';
import toast from 'react-hot-toast';
import { useEffectOnce } from '@/hooks/userCommon';
import useGetImage from '@/hooks/useGetImage';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';

dayjs.extend(buddhistEra);

interface Data {
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  classroom: object | null;
  idCard: number | string;
  birthDate: Dayjs | null;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: number | string;
  phone: number | string;
  status: string;
  avatar: string;
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `กรุณากรอก ${field}`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
  } else {
    return '';
  }
};

const schema = yup.object().shape({
  studentId: yup
    .string()
    .required('กรุณากรอกรหัสนักศึกษา')
    .min(10, (obj) => showErrors('รหัสนักเรียน', obj.value.length, obj.min)),
  title: yup.string().required('กรุณาเลือกคำนำหน้า'),
  firstName: yup
    .string()
    .min(3, (obj) => showErrors('ชื่อ', obj.value.length, obj.min))
    .required(),
  lastName: yup
    .string()
    .min(3, (obj) => showErrors('นามสกุล', obj.value.length, obj.min))
    .required(),
  classroom: yup.object().required('กรุณาเลือกชั้นเรียน').nullable(),
  idCard: yup.string(),
  birthDate: yup.date().nullable().default(null).max(new Date(), 'วันเกิดไม่ถูกต้อง'),
  state: yup.string(),
  addressLine1: yup.string(),
  subdistrict: yup.string(),
  district: yup.string(),
  province: yup.string(),
  postalCode: yup.string(),
  status: yup.string().required('กรุณาเลือกสถานะ'),
});

const localStorageService = new LocalStorageService();
const storedToken = localStorageService.getToken()!;

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

const StudentEditPage = ({ users, classroomId }: any) => {
  const initialData: Data = {
    studentId: users.student.studentId || '',
    title: users.account.title || '',
    firstName: users.account.firstName || '',
    lastName: users.account.lastName || '',
    classroom: users.student.classroom || null,
    idCard: users.account.idCard || '',
    birthDate: users.account.birthDate ? dayjs(users.account.birthDate) : null,
    addressLine1: users.account.addressLine1 || '',
    subdistrict: users.account.subdistrict || '',
    district: users.account.district || '',
    province: users.account.province || '',
    postalCode: users.account.postcode || '',
    phone: users.account.phone || '',
    status: users.student.status || '',
    avatar: users.account.avatar || '/images/avatars/1.png',
  };

  // ** State
  const [inputValue, setInputValue] = useState<string>('');
  const [classroom, setClassroom] = useState([initialData.classroom]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>(initialData.avatar);
  const [currentAddress, setCurrentAddress] = useState<ThailandAddressValue>(
    ThailandAddressValue.fromDataSourceItem({
      d: users.account.district || '',
      p: users.account.province || '',
      po: users.account.postcode || '',
      s: users.account.subdistrict || '',
    }),
  );

  const { fetchClassroom }: any = useClassroomStore(
    (state) => ({ classroom: state.classroom, fetchClassroom: state.fetchClassroom }),
    shallow,
  );
  const { updateStudentProfile }: any = useStudentStore(
    (state) => ({ updateStudentProfile: state.updateStudentProfile, getAvatar: state.getAvatar }),
    shallow,
  );

  // hooks
  const theme = useTheme();
  const route = useRouter();

  useEffectOnce(() => {
    (async () => {
      setLoading(true);
      await fetchClassroom(storedToken).then(async (data: any) => {
        setClassroom(await data);
        setLoading(false);
      });
    })();
  });

  // ** Hook
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any, e: any) => {
    e.preventDefault();

    const { classroom: c, department: d, program: p, ...rest } = data;
    const student = {
      ...rest,
      ...currentAddress,
      classroom: c.id,
      avatar: imgSrc === users?.account?.avatar ? null : imgSrc,
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await updateStudentProfile(storedToken, users.id, student).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });
        route.push(`/apps/student/list?classroom=${c.id}`);
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
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
    border: `1px solid ${
      theme.palette.mode === 'dark' ? hexToRGBA(theme.palette.secondary.main, 0.55) : 'rgba(58, 53, 65, 0.24)'
    }`,
  };

  const handleInputImageChange = (file: ChangeEvent) => {
    setLoadingImg(true);
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;

    if (files && files.length !== 0) {
      if (files[0].size > 1000000) {
        toast.error('ขนาดไฟล์ใหญ่เกินไป');
        setLoadingImg(false);
        return;
      }
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);

      setLoadingImg(false);
    }
  };

  const handleInputImageReset = () => {
    setInputValue('');
    setImgSrc('/images/avatars/1.png');
  };

  const { isLoading, error, image } = useGetImage(imgSrc, storedToken);

  return (
    // back button to previous page
    <Grid container spacing={6}>
      {/* Student Details */}
      <Grid item xs={12}>
        <LinkStyled href={`/apps/student/list?classroom=${classroomId}`} passHref>
          <Button variant='contained' color='secondary' startIcon={<Icon icon='ion:arrow-back-circle-outline' />}>
            ย้อนกลับ
          </Button>
        </LinkStyled>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ color: 'primary.main' }} aria-label='recipe'>
                <Icon icon='line-md:edit-twotone' />
              </Avatar>
            }
            sx={{ color: 'text.primary' }}
            title={`แก้ไขข้อมูลนักเรียน`}
          />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={5}>
                <Grid item xs={12} sx={{ mt: 4.8, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isLoading ? (
                      <CircularProgress
                        size={80}
                        sx={{
                          mr: (theme) => theme.spacing(6.25),
                        }}
                      />
                    ) : (
                      <ImgStyled src={image} alt='Profile Pic' loading='lazy' />
                    )}
                    <Box>
                      <LoadingButton
                        loading={loadingImg}
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
                          value={inputValue}
                          onChange={handleInputImageChange}
                          accept='image/png, image/jpeg, image/webp'
                          id='account-settings-upload-image'
                        />
                      </LoadingButton>
                      <ResetButtonStyled color='error' variant='outlined' onClick={handleInputImageReset}>
                        รีเซ็ต
                      </ResetButtonStyled>
                      <Typography variant='body2' sx={{ mt: 5 }}>
                        อนุญาต PNG, JPEG หรือ WEBP ขนาดสูงสุด 1MB.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Grid container spacing={2} sx={{ color: 'secondary.main' }}>
                    <Grid item>
                      <Icon icon='bxs:user-detail' />
                    </Grid>
                    <Grid item>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        ข้อมูลนักเรียน
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='studentId'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
                          id='รหัสนักเรียน'
                          label='รหัสนักเรียน *'
                          placeholder='รหัสนักเรียน'
                          InputProps={{
                            readOnly: true,
                          }}
                          value={value}
                          onChange={onChange}
                          error={!!errors.studentId}
                          helperText={errors.studentId ? (errors.studentId.message as string) : ''}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.title}>
                    <Controller
                      name='title'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Fragment>
                          <InputLabel>คำนำหน้า *</InputLabel>
                          <Select label='คำนำหน้า *' value={value} onChange={onChange}>
                            <MenuItem value=''>
                              <em>เลือกคำนำหน้า</em>
                            </MenuItem>
                            <MenuItem value='นาย'>นาย</MenuItem>
                            <MenuItem value='น.ส.'>นางสาว</MenuItem>
                          </Select>
                          {!!errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
                        </Fragment>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='firstName'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='lastName'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='classroom'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Autocomplete
                          disablePortal
                          id='checkboxes-tags-teacher-classroom'
                          limitTags={15}
                          value={value}
                          options={classroom}
                          loading={loading}
                          onChange={(_, newValue: any) => onChange({ target: { value: newValue } })}
                          getOptionLabel={(option: any) => option.name || ''}
                          isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='ชั้นเรียน *'
                              placeholder='เลือกชั้นเรียน'
                              error={!!errors.classroom}
                              helperText={errors.classroom ? (errors.classroom.message as string) : ''}
                            />
                          )}
                          renderOption={(props, option) => (
                            <li key={option.classroomId} {...props}>
                              {option.name}
                            </li>
                          )}
                          filterSelectedOptions
                          groupBy={(option: any) => option.department?.name}
                          noOptionsText='ไม่พบข้อมูล'
                        />
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
                          type={'tel'}
                          label='เลขประจำตัวประชาชน'
                          placeholder='เลขประจำตัวประชาชน'
                          value={value}
                          onChange={onChange}
                          inputProps={{
                            maxLength: 13,
                            onKeyDown(e: any) {
                              handleKeyDown(e);
                            },
                          }}
                        />
                      )}
                    />
                  </FormControl>
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
                            inputFormat='DD MMMM BBBB'
                            minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 20)))}
                            maxDate={dayjs(new Date())}
                            value={value}
                            onChange={onChange}
                            disableMaskedInput
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                inputProps={{
                                  ...params.inputProps,
                                  placeholder: 'วัน/เดือน/ปี',
                                }}
                                error={!!errors.birthDate}
                                helperText={errors.birthDate ? (errors.birthDate.message as string) : ''}
                              />
                            )}
                            components={{
                              OpenPickerIcon: () => <FcCalendar />,
                            }}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                          inputProps={{
                            maxLength: 10,
                            onKeyDown(e: any) {
                              handleKeyDown(e);
                            },
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.status}>
                    <Controller
                      name='status'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Fragment>
                          <InputLabel>สถานะ *</InputLabel>
                          <Select label='สถานะ *' value={value} onChange={onChange}>
                            <MenuItem value=''>
                              <em>เลือกสถานะ</em>
                            </MenuItem>
                            <MenuItem value='normal'>ปกติ</MenuItem>
                            <MenuItem value='internship'>ฝึกงาน</MenuItem>
                          </Select>
                          {!!errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                        </Fragment>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Grid container spacing={2} sx={{ color: 'secondary.main' }}>
                    <Grid item>
                      <Icon icon='icon-park-outline:guide-board' />
                    </Grid>
                    <Grid item>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        ที่อยู่ปัจจุบัน
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={12}>
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
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <FormControl fullWidth>
                    <ThailandAddressTypeahead value={currentAddress} onValueChange={(val) => setCurrentAddress(val)}>
                      <Grid container spacing={5}>
                        <Grid item xs={12} sm={6}>
                          <ThailandAddressTypeahead.SubdistrictInput
                            className='sub-district-input'
                            style={addressInputStyle as any}
                            placeholder='ตำบล / แขวง'
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <ThailandAddressTypeahead.DistrictInput
                            className='district-input'
                            style={addressInputStyle as any}
                            placeholder='อำเภอ / เขต'
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <ThailandAddressTypeahead.ProvinceInput
                            className='province-input'
                            style={addressInputStyle as any}
                            placeholder='จังหวัด'
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <ThailandAddressTypeahead.PostalCodeInput
                            className='postal-code-input'
                            style={addressInputStyle as any}
                            placeholder='รหัสไปรษณีย์'
                          />
                        </Grid>
                      </Grid>
                      <style jsx global>{`
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
                <Grid item xs={12}>
                  <Button type='submit' variant='contained' sx={{ mr: 4 }}>
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                  <Button
                    type='reset'
                    variant='outlined'
                    color='secondary'
                    onClick={() => {
                      reset();
                      setCurrentAddress(
                        ThailandAddressValue.fromDataSourceItem({
                          d: users.account.district || '',
                          p: users.account.province || '',
                          po: users.account.postcode || '',
                          s: users.account.subdistrict || '',
                        }),
                      );
                    }}
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
  );
};

StudentEditPage.acl = {
  action: 'update',
  subject: 'student-edit-page',
};

export default StudentEditPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context?.params?.id as string;
  const classroom = context?.query?.classroom;
  const token = context?.query?.token;
  const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return {
    props: {
      users: data,
      classroomId: classroom,
    },
  };
};
