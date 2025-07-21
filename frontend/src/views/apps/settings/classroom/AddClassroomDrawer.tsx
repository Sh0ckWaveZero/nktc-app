import * as yup from 'yup';

import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Fragment, useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { BoxProps } from '@mui/material/Box';
import Close from 'mdi-material-ui/Close';
import IconifyIcon from '@/@core/components/icon';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { styled } from '@mui/material/styles';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { useClassroomStore, useDepartmentStore, useProgramStore } from '@/store/index';
import { shallow } from 'zustand/shallow';
import { LocalStorageService } from '@/services/localStorageService';
import { toast } from 'react-hot-toast';
import { useLevelStore } from '@/store/apps/level';

dayjs.extend(buddhistEra);

interface SidebarAddTeacherType {
  open: boolean;
  toggle: () => void;
  onSubmitForm: (data: any) => void;
}

interface ClassroomInfo {
  classroomId: string;
  name: string;
  levelId: string;

  classroomNumber: string;
  programId: string;
  departmentId: string;
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `กรุณากรอก${field}`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
  } else {
    return '';
  }
};

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& label': {
    display: 'flex',
  },
  '& label .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
  '& label .MuiInputLabel-asterisk:after': {
    content: "'\\2009'",
  },
  '& .Mui-disabled': {
    backgroundColor: theme.palette.background.default,
  },
}));

const CustomFormControl = styled(FormControl)(({ theme }) => ({
  '& label .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
}));

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

const localStorageService = new LocalStorageService();
const accessToken = localStorageService.getToken() || '';

const AddClassroomDrawer = (props: SidebarAddTeacherType) => {
  // ** Props
  const { open, toggle, onSubmitForm } = props;
  const [loadingClassroomId, setLoadingClassroomId] = useState<boolean>(false);
  const [levelList, setLevelList] = useState<any[]>([]);
  const [programList, setProgramList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [classroomList, setClassroomList] = useState<any[]>([]);
  const [hideProgram, setHideProgram] = useState<boolean>(false);
  const [levelChange, setLevelChange] = useState<boolean>(false);

  const { fetchClassroom }: any = useClassroomStore(
    (state) => ({
      fetchClassroom: state.fetchClassroom,
    }),
    shallow,
  );

  const { fetchPrograms }: any = useProgramStore(
    (state) => ({
      fetchPrograms: state.fetchPrograms,
    }),
    shallow,
  );

  const { fetchLevels }: any = useLevelStore((state) => ({ fetchLevels: state.fetchLevels }), shallow);
  const { fetchDepartment }: any = useDepartmentStore((state) => ({ fetchDepartment: state.fetchDepartment }), shallow);

  const schema = yup.object().shape({
    classroomId: yup.string().required('กรุณากรอกรหัสห้องเรียน'),
    levelId: yup.string().required('กรุณาเลือกระดับชั้น'),
    classroomNumber: yup
      .string()
      .required('กรุณากรอกหมายเลขห้องเรียน')
      .matches(
        /^[A-Za-z0-9!@#\$%\^&\*\(\)-_+=\[\]\{\}\\\|;:'",<.>\/?`~]+$/,
        'กรุณากรอกเฉพาะภาษาอังกฤษและตัวเลขเท่านั้น',
      ),
    programId: yup.string().required('กรุณาเลือกสาชาวิชา'),
    departmentId: yup.string().required('กรุณาเลือกแผนก'),
    name: yup
      .string()
      .required('กรุณากรอกชื่อห้องเรียน')
      .test('ready exist classroom', 'ชื่อห้องเรียนนี้มีอยู่แล้ว', async (value: any) => {
        if (value) {
          return classroomList.find((item: any) => item.name === value) ? false : true;
        }
        return true;
      }),
  });

  const defaultValues = {
    classroomId: '',
    name: '',
    levelId: '',
    classroomNumber: '',
    programId: '',
    departmentId: '',
  };

  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    fetchLevels(accessToken).then((res: any) => {
      setLevelList(res || []);
    });
  }, []);

  useEffect(() => {
    if (hideProgram) {
      fetchPrograms(accessToken).then((res: any) => {
        if (res.length > 0) {
          setProgramList(res.filter((item: any) => item.levelId === getValues('levelId')));
        }
      });
    }
  }, [levelChange]);

  useEffect(() => {
    fetchDepartment(accessToken).then((res: any) => {
      if (res.length > 0) {
        setDepartmentList(res);
      }
    });
  }, []);

  const onSubmit: any = (info: ClassroomInfo) => {
    toggle();
    reset();
    onSubmitForm(info);
  };

  const handleClose = () => {
    toggle();
    reset();
  };

  const handleRandomClassroomId = async () => {
    setLoadingClassroomId(true);
    try {
      const res = await fetchClassroom(accessToken);
      setClassroomList(res);
      const splitClassroomId = res.map((item: any) => {
        const splitNumber = item.classroomId.split(/(\d+)/);
        return splitNumber[1];
      });
      if (!splitClassroomId) {
        return toast.error('ไม่สามารถสร้างรหัสห้องเรียนได้');
      }
      const sortClassroomId = splitClassroomId.sort((a: any, b: any) => b - a);
      const lastClassroomId = parseInt(sortClassroomId[0]) + 1;
      const classroomId = `CR${lastClassroomId}`;
      setValue('classroomId', classroomId);
    } catch (error) {
      setLoadingClassroomId(false);
    } finally {
      setLoadingClassroomId(false);
    }
  };

  const handleClassroomNameChange = () => {
    setValue('name', '');
    const levelName = levelList.find((item: any) => item.id === getValues('levelId'))?.levelName || '';
    const programName = programList.find((item: any) => item.id === getValues('programId'))?.name || '';
    const name = `${levelName}${getValues('classroomNumber')}-${programName}`;
    setValue('name', name);
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, borderRadius: 1 } }}
    >
      <Header>
        <Typography variant='h6'>เพิ่มรายชื่อห้องเรียน</Typography>
        <Close fontSize='small' onClick={handleClose} sx={{ cursor: 'pointer' }} />
      </Header>
      <Box sx={{ p: 5 }}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='classroomId'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  id='classroomId'
                  value={value}
                  label='รหัสห้องเรียน'
                  onChange={onChange}
                  placeholder='CRxxx'
                  required
                  error={Boolean(errors.classroomId)}
                  helperText={errors.classroomId ? errors.classroomId.message : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        {!value ? (
                          <Tooltip title='สร้างรหัสห้องเรียน' arrow>
                            <span>
                              <LoadingButton
                                id='generate-classroomId'
                                color='success'
                                loading={loadingClassroomId}
                                loadingPosition='start'
                                startIcon={<IconifyIcon icon='fad:random-1dice' />}
                                onClick={handleRandomClassroomId}
                                variant='contained'
                              >
                                <span>สุ่มรหัส</span>
                              </LoadingButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title='ล้างค่า' arrow>
                            <span>
                              <IconButton
                                onClick={() => {
                                  setValue('classroomId', '');
                                }}
                              >
                                <IconifyIcon icon='uil:times' width={20} height={20} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='name'
              control={control}
              rules={{ required: false }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  value={value}
                  label='ชื่อห้องเรียน'
                  onChange={onChange}
                  placeholder='ระดับชั้น-เลขที่ห้องเรียน-ชื่อสาขาวิชา'
                  error={Boolean(errors.name)}
                  helperText={errors.name ? errors.name.message : ''}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </FormControl>
          <CustomFormControl
            fullWidth
            sx={{
              mb: 6,
            }}
            required
            error={Boolean(errors.levelId)}
          >
            <Controller
              name='levelId'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Fragment>
                  <InputLabel htmlFor='levelId'>ระดับชั้น</InputLabel>
                  <Select
                    label='ระดับชั้น'
                    name='levelId'
                    id='levelId'
                    defaultValue={value}
                    value={value}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setHideProgram(false);
                      } else {
                        setHideProgram(true);
                      }
                      setLevelChange(!levelChange);
                      setValue('programId', '');
                      onChange(e);
                      handleClassroomNameChange();
                    }}
                  >
                    <MenuItem value=''>
                      <em>เลือกระดับชั้น</em>
                    </MenuItem>
                    {levelList &&
                      levelList.map((item: any) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.levelName}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.levelId && <FormHelperText>{errors.levelId.message}</FormHelperText>}
                </Fragment>
              )}
            />
          </CustomFormControl>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Controller
              name='classroomNumber'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  id='classroomNumber'
                  value={value}
                  label='เลขที่ห้องเรียน'
                  onChange={(e) => {
                    onChange(e);
                    handleClassroomNameChange();
                  }}
                  placeholder='x/x'
                  error={Boolean(errors.classroomNumber)}
                  helperText={errors.classroomNumber ? errors.classroomNumber.message : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        {value && (
                          <Tooltip title='ล้างค่า' arrow>
                            <span>
                              <IconButton
                                onClick={() => {
                                  setValue('classroomNumber', '');
                                  handleClassroomNameChange();
                                }}
                              >
                                <IconifyIcon icon='uil:times' width={20} height={20} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              )}
            />
          </FormControl>
          {hideProgram && (
            <CustomFormControl
              fullWidth
              sx={{
                mb: 6,
              }}
              required
              error={Boolean(errors.programId)}
            >
              <Controller
                name='programId'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Fragment>
                    <InputLabel htmlFor='programId'>สาขาวิชา</InputLabel>
                    <Select
                      label='สาขาวิชา'
                      name='programId'
                      id='programId'
                      defaultValue={value}
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        handleClassroomNameChange();
                      }}
                    >
                      <MenuItem value=''>
                        <em>เลือกสาขาวิชา</em>
                      </MenuItem>
                      {programList &&
                        programList.map((item: any) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.programId && <FormHelperText>{errors.programId.message}</FormHelperText>}
                  </Fragment>
                )}
              />
            </CustomFormControl>
          )}
          <CustomFormControl
            fullWidth
            sx={{
              mb: 6,
            }}
            required
            error={Boolean(errors.departmentId)}
          >
            <Controller
              name='departmentId'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Fragment>
                  <InputLabel htmlFor='departmentId'>แผนก</InputLabel>
                  <Select
                    label='แผนก'
                    name='departmentId'
                    id='departmentId'
                    defaultValue={value}
                    value={value}
                    onChange={onChange}
                  >
                    <MenuItem value=''>
                      <em>เลือกแผนก</em>
                    </MenuItem>
                    {departmentList &&
                      departmentList.map((item: any) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.departmentId && <FormHelperText>{errors.departmentId.message}</FormHelperText>}
                </Fragment>
              )}
            />
          </CustomFormControl>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              id='submit-add-classroom'
              fullWidth
              size='large'
              type='submit'
              variant='contained'
              sx={{ mr: 3 }}
              startIcon={<IconifyIcon icon='ci:house-add' />}
            >
              เพิ่ม
            </Button>
            <Button
              id='clear-classroom'
              fullWidth
              size='large'
              variant='outlined'
              color='error'
              startIcon={<IconifyIcon icon='uil:times' />}
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default AddClassroomDrawer;
