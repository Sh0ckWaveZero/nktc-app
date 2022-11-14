// ** React Imports
import { Fragment, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import PasswordStrengthBar from 'react-password-strength-bar';

// ** Third Party Imports
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import KeyOutline from 'mdi-material-ui/KeyOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';

// ** Custom Components Imports
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FormHelperText } from '@mui/material';
import { useUserStore } from '@/store/index';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { authConfig } from '@/configs/auth';
import shallow from 'zustand/shallow';

interface State {
  showNewPassword: boolean;
  showCurrentPassword: boolean;
  showConfirmNewPassword: boolean;
}

interface IFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const schema = yup.object().shape({
  currentPassword: yup.string().required('กรุณากรอกรหัสผ่านปัจจุบัน'),
  newPassword: yup.string().required('กรุณากรอกรหัสผ่านใหม่').min(8, 'รหัสผ่านใหม่ต้องมีความยาว 8 ตัวอักษร'),
  confirmNewPassword: yup.string().required('กรุณายืนยันรหัสผ่านใหม่').min(8, 'ยืนยันรหัสผ่านต้องมีความยาว 8 ตัวอักษร'),
});

const TabSecurity = () => {
  // hooks
  const {
    formState: { errors },
    handleSubmit,
    watch,
    control,
    setError,
    reset,
  } = useForm<IFormInputs>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const auth = useAuth();
  const { changePassword, login }: any = useUserStore(
    (state) => ({ changePassword: state.changePassword, login: state.login }),
    shallow,
  );
  const storedToken = window.localStorage.getItem(authConfig.accessToken as string)!;

  // ** States
  const [values, setValues] = useState<State>({
    showNewPassword: false,
    showCurrentPassword: false,
    showConfirmNewPassword: false,
  });

  const watchNewPassword = watch('newPassword', '');
  const watchConfirmNewPassword = watch('confirmNewPassword', '');

  const scoreWords = ['สั้นเกินไป', 'ง่าย', 'พอใช้ได้', 'ดี', 'ยอดเยี่ยม'];

  const handleClickShowCurrentPassword = () => {
    setValues({ ...values, showCurrentPassword: !values.showCurrentPassword });
  };

  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword });
  };

  const handleClickShowConfirmNewPassword = () => {
    setValues({
      ...values,
      showConfirmNewPassword: !values.showConfirmNewPassword,
    });
  };

  const onSubmit: SubmitHandler<IFormInputs> = async (data: IFormInputs, e: any) => {
    e.preventDefault();
    if (watchNewPassword !== watchConfirmNewPassword) {
      setError('confirmNewPassword', { type: 'string', message: 'รหัสผ่านไม่ตรงกัน' });
      return;
    }

    await toast.promise(
      changePassword(storedToken, { old_password: data.currentPassword, new_password: data.newPassword }),
      {
        loading: 'กำลังเปลี่ยนรหัสผ่าน...',
        success: 'เปลี่ยนรหัสผ่านสำเร็จ',
        error: 'เกิดข้อผิดพลาด',
      },
    );
    reset();
    await login({ username: auth?.user?.username as string, password: data.newPassword }).then(async (data: any) => {
      auth?.setUser({ ...(await data) });
      localStorage.setItem('userData', JSON.stringify(data));
      location.reload();
    });
    // await login({ username: userInfo.username, password: data.newPassword });
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent sx={{ pb: 0 }}>
          <Box sx={{ mb: 5.75, display: 'flex', alignItems: 'center' }}>
            <KeyOutline sx={{ mr: 3 }} />
            <Typography variant='h6'>เปลี่ยนรหัสผ่าน</Typography>
          </Box>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={5}>
                <Grid item xs={12} sx={{ mt: 4.75 }}>
                  <FormControl fullWidth>
                    <Controller
                      name='currentPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Fragment>
                          <InputLabel htmlFor='account-settings-current-password'>รหัสผ่านปัจจุบัน</InputLabel>
                          <OutlinedInput
                            label='รหัสผ่านปัจจุบัน'
                            value={value}
                            id='account-settings-current-password'
                            type={values.showCurrentPassword ? 'text' : 'password'}
                            onChange={onChange}
                            error={Boolean(errors.currentPassword)}
                            endAdornment={
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  aria-label='สลับการแสดงรหัสผ่านปัจจุบัน'
                                  onClick={handleClickShowCurrentPassword}
                                  onMouseDown={(event) => event.preventDefault()}
                                >
                                  {values.showCurrentPassword ? <EyeOutline /> : <EyeOffOutline />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                        </Fragment>
                      )}
                    />
                    {errors.currentPassword && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.currentPassword.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sx={{ mt: 6 }}>
                  <FormControl fullWidth>
                    <Controller
                      name='newPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Fragment>
                          <InputLabel htmlFor='account-settings-new-password'>รหัสผ่านใหม่</InputLabel>
                          <OutlinedInput
                            label='รหัสผ่านใหม่'
                            value={value}
                            id='account-settings-new-password'
                            type={values.showNewPassword ? 'text' : 'password'}
                            onChange={onChange}
                            error={Boolean(errors.newPassword)}
                            endAdornment={
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  aria-label='สลับการแสดงรหัสผ่านปัจจุบัน'
                                  onClick={handleClickShowNewPassword}
                                  onMouseDown={(event) => event.preventDefault()}
                                >
                                  {values.showNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                        </Fragment>
                      )}
                    />
                    {errors.newPassword && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.newPassword.message}</FormHelperText>
                    )}
                    <PasswordStrengthBar
                      scoreWords={scoreWords}
                      shortScoreWord={scoreWords[0]}
                      password={watchNewPassword}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Controller
                      name='confirmNewPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <Fragment>
                          <InputLabel htmlFor='account-settings-confirm-new-password'>ยืนยันรหัสผ่านใหม่</InputLabel>
                          <OutlinedInput
                            label='ยืนยันรหัสผ่านใหม่'
                            value={value}
                            id='account-settings-confirm-new-password'
                            type={values.showConfirmNewPassword ? 'text' : 'password'}
                            onChange={onChange}
                            error={Boolean(errors.confirmNewPassword)}
                            endAdornment={
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  aria-label='สลับการแสดงรหัสผ่านปัจจุบัน'
                                  onClick={handleClickShowConfirmNewPassword}
                                  onMouseDown={(event) => event.preventDefault()}
                                >
                                  {values.showConfirmNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                        </Fragment>
                      )}
                    />
                    {errors.confirmNewPassword && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.confirmNewPassword.message}</FormHelperText>
                    )}
                    <PasswordStrengthBar
                      scoreWords={scoreWords}
                      shortScoreWord={scoreWords[0]}
                      password={watchConfirmNewPassword}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <CardContent>
          <Box>
            <Button variant='contained' sx={{ mr: 3.5 }} type='submit'>
              บันทึกการเปลี่ยนแปลง
            </Button>
            <Button
              type='reset'
              variant='outlined'
              color='secondary'
              onClick={() => {
                setValues({
                  ...values,
                });
                reset();
              }}
            >
              รีเซ็ต
            </Button>
          </Box>
        </CardContent>
      </form>
    </Fragment>
  );
};

export default TabSecurity;
