// ** React Imports
import { ChangeEvent, MouseEvent, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline';
import KeyOutline from 'mdi-material-ui/KeyOutline';
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline';
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

interface State {
  newPassword: string;
  currentPassword: string;
  showNewPassword: boolean;
  confirmNewPassword: string;
  showCurrentPassword: boolean;
  showConfirmNewPassword: boolean;
}

const TabSecurity = () => {
  // ** States
  const [values, setValues] = useState<State>({
    newPassword: '',
    currentPassword: '',
    showNewPassword: false,
    confirmNewPassword: '',
    showCurrentPassword: false,
    showConfirmNewPassword: false,
  });

  // Handle Current Password
  const handleCurrentPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };
  const handleClickShowCurrentPassword = () => {
    setValues({ ...values, showCurrentPassword: !values.showCurrentPassword });
  };
  const handleMouseDownCurrentPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Handle New Password
  const handleNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };
  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword });
  };
  const handleMouseDownNewPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Handle Confirm New Password
  const handleConfirmNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };
  const handleClickShowConfirmNewPassword = () => {
    setValues({
      ...values,
      showConfirmNewPassword: !values.showConfirmNewPassword,
    });
  };
  const handleMouseDownConfirmNewPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <form>
      <CardContent sx={{ pb: 0 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={5}>
              <Grid item xs={12} sx={{ mt: 4.75 }}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-current-password'>รหัสผ่านปัจจุบัน</InputLabel>
                  <OutlinedInput
                    label='รหัสผ่านปัจจุบัน'
                    value={values.currentPassword}
                    id='account-settings-current-password'
                    type={values.showCurrentPassword ? 'text' : 'password'}
                    onChange={handleCurrentPasswordChange('currentPassword')}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowCurrentPassword}
                          onMouseDown={handleMouseDownCurrentPassword}
                        >
                          {values.showCurrentPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 6 }}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-new-password'>รหัสผ่านใหม่</InputLabel>
                  <OutlinedInput
                    label='รหัสผ่านใหม่'
                    value={values.newPassword}
                    id='account-settings-new-password'
                    onChange={handleNewPasswordChange('newPassword')}
                    type={values.showNewPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowNewPassword}
                          aria-label='toggle password visibility'
                          onMouseDown={handleMouseDownNewPassword}
                        >
                          {values.showNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-confirm-new-password'>ยืนยันรหัสผ่านใหม่</InputLabel>
                  <OutlinedInput
                    label='ยืนยันรหัสผ่านใหม่'
                    value={values.confirmNewPassword}
                    id='account-settings-confirm-new-password'
                    type={values.showConfirmNewPassword ? 'text' : 'password'}
                    onChange={handleConfirmNewPasswordChange('confirmNewPassword')}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowConfirmNewPassword}
                          onMouseDown={handleMouseDownConfirmNewPassword}
                        >
                          {values.showConfirmNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            sm={6}
            xs={12}
            sx={{
              display: 'flex',
              mt: [7.5, 2.5],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img width={183} alt='avatar' height={256} src='/images/pages/pose-m-1.png' />
          </Grid>
        </Grid>
      </CardContent>

      <Divider sx={{ mt: 0, mb: 1.75 }} />

      <CardContent>
        <Box sx={{ mb: 5.75, display: 'flex', alignItems: 'center' }}>
          <KeyOutline sx={{ mr: 3 }} />
          <Typography variant='h6'>การยืนยันตัวตนแบบสองขั้นตอน</Typography>
        </Box>

        <Box sx={{ mb: 11, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              maxWidth: 368,
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <CustomAvatar skin='light' variant='rounded' sx={{ mb: 3.5, width: 48, height: 48 }}>
              <LockOpenOutline sx={{ fontSize: '1.75rem' }} />
            </CustomAvatar>
            <Typography sx={{ fontWeight: 600, mb: 3.5 }}>ยังไม่ได้เปิดใช้การตรวจสอบสิทธิ์แบบสองปัจจัย</Typography>
            <Typography variant='body2'>
              การรับรองความถูกต้องด้วยสองปัจจัยเพิ่มชั้นความปลอดภัยเพิ่มเติมให้กับบัญชีของคุณโดยต้องการมากกว่าแค่
              รหัสผ่านเพื่อเข้าสู่ระบบ เรียนรู้เพิ่มเติม
            </Typography>
          </Box>
        </Box>

        <Box>
          <Button variant='contained' sx={{ mr: 3.5 }}>
            บันทึกการเปลี่ยนแปลง
          </Button>
          <Button
            type='reset'
            variant='outlined'
            color='secondary'
            onClick={() =>
              setValues({
                ...values,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
              })
            }
          >
            รีเซ็ต
          </Button>
        </Box>
      </CardContent>
    </form>
  );
};
export default TabSecurity;
