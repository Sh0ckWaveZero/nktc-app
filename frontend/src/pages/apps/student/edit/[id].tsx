// ** React Imports
import { useState, Fragment } from 'react';

// ** MUI Imports
import {
  Autocomplete,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

// ** Next Import
import { useRouter } from 'next/router';
import Link from 'next/link';

// ** Icon Imports
import Icon from '@/@core/components/icon';

// ** Third Party Imports
import { useEffectOnce } from '@/hooks/userCommon';
import { useClassroomStore, useDepartmentStore, useProgramStore, useStudentStore, useUserStore } from '@/store/index';
import shallow from 'zustand/shallow';
import { authConfig } from '@/configs/auth';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { FcCalendar } from 'react-icons/fc';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import th from 'dayjs/locale/th';
import dayjs, { Dayjs } from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { ThailandAddressTypeahead, ThailandAddressValue } from '@/@core/styles/libs/thailand-address';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetServerSideProps } from 'next';
import httpClient from '@/@core/utils/http';

dayjs.extend(buddhistEra);

interface Data {
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  classroom: object | null;
  department: object | null;
  program: object | null;
  idCard: number | string;
  birthDate: Dayjs | null;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: number | string;
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
  department: yup.object().required('กรุณาเลือกแผนก').nullable(),
  program: yup.object().required('กรุณาเลือกสาขาวิชา').nullable(),
  idCard: yup.string(),
  birthDate: yup.date().nullable().default(null).max(new Date(), 'วันเกิดไม่ถูกต้อง'),
  state: yup.string(),
  addressLine1: yup.string(),
  subdistrict: yup.string(),
  district: yup.string(),
  province: yup.string(),
  postalCode: yup.string(),
});

const StudentEditPage = ({ users }: any) => {
  const initialData: Data = {
    studentId: users.student.studentId || '',
    title: users.account.title || '',
    firstName: users.account.firstName || '',
    lastName: users.account.lastName || '',
    classroom: users.student.classroom || null,
    department: users.student.department || null,
    program: users.student.program || null,
    idCard: users.account.idCard || '',
    birthDate: users.account.birthDate ? dayjs(users.account.birthDate) : null,
    addressLine1: users.account.addressLine1 || '',
    subdistrict: users.account.subdistrict || '',
    district: users.account.district || '',
    province: users.account.province || '',
    postalCode: users.account.postcode || '',
  };

  // ** State
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('yes');
  const [formData, setFormData] = useState<Data>(initialData);
  const [secondDialogOpen, setSecondDialogOpen] = useState<boolean>(false);
  const [classroom, setClassroom] = useState([initialData.classroom]);
  const [loading, setLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState([initialData.department]);
  const [loadingDepartment, setLoadingDepartment] = useState<boolean>(false);
  const [program, setProgram] = useState([initialData.program]);
  const [loadingProgram, setLoadingProgram] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<ThailandAddressValue>(
    ThailandAddressValue.fromDataSourceItem({
      d: users.account.district || '',
      p: users.account.province || '',
      po: users.account.postcode || '',
      s: users.account.subdistrict || '',
    }),
  );

  const storedToken = localStorage.getItem(authConfig.accessToken as string)!;

  const { fetchClassroom }: any = useClassroomStore(
    (state) => ({ classroom: state.classroom, fetchClassroom: state.fetchClassroom }),
    shallow,
  );
  const { fetchDepartment }: any = useDepartmentStore((state) => ({ fetchDepartment: state.fetchDepartment }), shallow);
  const { fetchProgram }: any = useProgramStore((state) => ({ fetchProgram: state.fetchProgram }), shallow);
  const { fetchUserById }: any = useUserStore((state) => ({ fetchUserById: state.fetchUserById }), shallow);
  const { updateStudentProfile }: any = useStudentStore(
    (state) => ({ updateStudentProfile: state.updateStudentProfile }),
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

  // get department
  useEffectOnce(() => {
    setLoadingDepartment(true);
    (async () => {
      await fetchDepartment(storedToken).then(async (data: any) => {
        setDepartments(await data);
        setLoadingDepartment(false);
      });
    })();
  });

  // get program
  useEffectOnce(() => {
    setLoadingProgram(true);
    (async () => {
      await fetchProgram(storedToken).then(async (data: any) => {
        setProgram(await data);
        setLoadingProgram(false);
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
      department: d.id,
      program: p.id,
    };
    toast.promise(updateStudentProfile(storedToken, users.id, student), {
      loading: 'กำลังบันทึกข้อมูล...',
      success: 'บันทึกข้อมูลสำเร็จ',
      error: 'เกิดข้อผิดพลาด',
    });

    route.push(`/apps/student/list?classroom=${c.id}`);
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

  return (
    // back button to previous page
    <Grid container spacing={6}>
      {/* Student Details */}
      <Grid item xs={12}>
        <Link href={`/apps/student/list`} passHref>
          <Button variant='contained' color='secondary' startIcon={<Icon icon='ion:arrow-back-circle-outline' />}>
            ย้อนกลับ
          </Button>
        </Link>
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Grid container spacing={5}>
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
                          label='รหัสนักเรียน'
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
                          <InputLabel>คำนำหน้า</InputLabel>
                          <Select label='คำนำหน้า' value={value} onChange={onChange}>
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
                              label='ชั้นเรียน'
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
                          groupBy={(option: any) => option.program?.description}
                          noOptionsText='ไม่พบข้อมูล'
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='program'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Autocomplete
                          disablePortal
                          id='checkboxes-tags-teacher-program'
                          limitTags={15}
                          value={value}
                          options={program}
                          loading={loadingProgram}
                          onChange={(_, newValue: any) => onChange({ target: { value: newValue } })}
                          getOptionLabel={(option: any) => option?.description || ''}
                          isOptionEqualToValue={(option: any, value: any) => option.id === value}
                          renderOption={(props, option) => (
                            <li key={option.programId} {...props}>
                              {option.description}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='สาขาวิชา'
                              placeholder='เลือกสาขาวิชา'
                              error={!!errors.program}
                              helperText={errors.program ? (errors.program.message as string) : ''}
                            />
                          )}
                          filterSelectedOptions
                          noOptionsText='ไม่พบข้อมูล'
                        />
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
                        <Autocomplete
                          disablePortal
                          id='checkboxes-tags-teacher-department'
                          limitTags={15}
                          value={value}
                          options={departments}
                          loading={loadingDepartment}
                          onChange={(_, newValue: any) => onChange({ target: { value: newValue } })}
                          getOptionLabel={(option: any) => option?.name || ''}
                          isOptionEqualToValue={(option: any, value: any) => option.name === value}
                          renderOption={(props, option) => (
                            <li key={option.id} {...props}>
                              {option.name}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='แผนก'
                              placeholder='เลือกแผนก'
                              error={!!errors.department}
                              helperText={errors.department ? (errors.department.message as string) : ''}
                            />
                          )}
                          filterSelectedOptions
                          groupBy={(option: any) => option.program?.name}
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
                      rules={{ required: false }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          fullWidth
                          label='เลขประจำตัวประชาชน'
                          placeholder='เลขประจำตัวประชาชน'
                          value={value}
                          onChange={onChange}
                          error={!!errors.idCard}
                          helperText={errors.idCard ? (errors.idCard.message as string) : ''}
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
                      setFormData(initialData);
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
            </CardContent>
          </form>
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
  const token = context?.query?.token;
  const { data } = await httpClient.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return {
    props: { users: data },
  };
};
