'use client';

// ** React Imports
import React, { useState } from 'react';

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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import KeyOutline from 'mdi-material-ui/KeyOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';

// ** Custom Components Imports
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FormHelperText } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useChangePassword } from '@/hooks/queries/useUser';
import { useLogin } from '@/hooks/queries/useAuth';

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

const schema = z.object({
  currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  newPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านใหม่').min(8, 'รหัสผ่านใหม่ต้องมีความยาว 8 ตัวอักษร'),
  confirmNewPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่านใหม่').min(8, 'ยืนยันรหัสผ่านต้องมีความยาว 8 ตัวอักษร'),
}) satisfies z.ZodType<IFormInputs>;

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
    resolver: zodResolver(schema),
  });

  const auth = useAuth();
  const { mutate: changePassword, isPending } = useChangePassword();
  const { mutate: login } = useLogin();

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

    changePassword(
      {
        old_password: data.currentPassword,
        new_password: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
          reset();

          // Re-login with new password
          login(
            {
              username: auth?.user?.username as string,
              password: data.newPassword,
            },
            {
              onSuccess: (loginData) => {
                auth?.setUser(loginData);
                setTimeout(() => {
                  location.reload();
                }, 500);
              },
              onError: () => {
                toast.error('กรุณาเข้าสู่ระบบอีกครั้ง');
              },
            },
          );
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        },
      },
    );
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent sx={{ pb: 0 }}>
          <Box sx={{ mb: 5.75, display: 'flex', alignItems: 'center' }}>
            <KeyOutline sx={{ mr: 3 }} />
            <Typography variant='h6'>เปลี่ยนรหัสผ่าน</Typography>
          </Box>
          <Grid container spacing={5}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Grid container spacing={5}>
                <Grid sx={{ mt: 4.75 }} size={12}>
                  <FormControl fullWidth>
                    <Controller
                      name='currentPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <React.Fragment>
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
                        </React.Fragment>
                      )}
                    />
                    {errors.currentPassword && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.currentPassword.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid sx={{ mt: 6 }} size={12}>
                  <FormControl fullWidth>
                    <Controller
                      name='newPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <React.Fragment>
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
                        </React.Fragment>
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
                <Grid size={12}>
                  <FormControl fullWidth>
                    <Controller
                      name='confirmNewPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <React.Fragment>
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
                        </React.Fragment>
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
            <Button variant='contained' sx={{ mr: 3.5 }} type='submit' disabled={isPending}>
              {isPending ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
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
    </React.Fragment>
  );
};

export default TabSecurity;
