import * as yup from 'yup';

// ** MUI Imports
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import Fade, { FadeProps } from '@mui/material/Fade';
// ** React Imports
import { Fragment, ReactElement, Ref, forwardRef, useState } from 'react';

import IconifyIcon from '@/@core/components/icon';
import PasswordStrengthBar from 'react-password-strength-bar';
import { yupResolver } from '@hookform/resolvers/yup';

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

interface DialogEditUserInfoType {
  show: boolean;
  data: any;
  onClose: () => void;
  onSubmitForm: (data: any) => void;
}

interface FormData {
  password: string;
}

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFormLabel-asterisk': {
    color: theme.palette.error.main,
  },
  // when disable background color grey
  '& .Mui-disabled': {
    backgroundColor: theme.palette.background.default,
  },
}));

const ResetPasswordDialog = ({ show, data, onClose, onSubmitForm }: DialogEditUserInfoType) => {
  const defaultValues = {
    password: '',
  };

  const showErrors = (field: string, valueLen: number, min: number) => {
    if (valueLen === 0) {
      return `กรุณากรอก${field}`;
    } else if (valueLen > 0 && valueLen < min) {
      return `${field} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
    } else {
      return '';
    }
  };

  const schema = yup.object().shape({
    password: yup
      .string()
      .min(8, (obj) => showErrors('รหัสผ่าน', obj.value.length, obj.min))
      .matches(
        /^[A-Za-z0-9!@#\$%\^&\*\(\)-_+=\[\]\{\}\\\|;:'",<.>\/?`~]+$/,
        'กรุณากรอกเฉพาะภาษาอังกฤษและตัวเลขเท่านั้น',
      )
      .required(),
  });

  const scoreWords = ['สั้นเกินไป', 'ง่าย', 'พอใช้ได้', 'ดี', 'ยอดเยี่ยม'];
  const [showPassword, setShowPassword] = useState(false);

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (info: FormData) => {
    onSubmitForm({
      ...info,
      id: data?.id,
    });
  };

  return (
    <Dialog fullWidth open={show} maxWidth='sm' scroll='body' onClose={onClose} TransitionComponent={Transition}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{
            position: 'relative',
            pb: (theme) => `${theme.spacing(8)} !important`,
            px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: (theme) => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          }}
        >
          <IconButton size='small' onClick={onClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
            <IconifyIcon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              เปลี่ยนรหัสผ่านของครู/อาจารย์
            </Typography>
            <Typography variant='body2'>
              การเปลี่ยนรหัสผ่านนี้จะมีผลทันที และจำทำให้เจ้าของบัญชีจะไม่สามารถใช้งานได้
              จนกว่าจะทำการลงชื่อเข้าใจงานด้วย รหัสใหม่อีกครั้ง
            </Typography>
          </Box>

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Fragment>
                      <CustomTextField
                        value={value}
                        type={showPassword ? 'text' : 'password'}
                        onChange={onChange}
                        id='password'
                        label='รหัสผ่าน'
                        placeholder='รหัสผ่าน'
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message as string}
                        aria-describedby='validation-schema-first-name'
                        InputLabelProps={{
                          required: true,
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment aria-label='สลับการแสดงรหัสผ่านปัจจุบัน' position='end'>
                              <Tooltip title='สลับการแสดงรหัสผ่านปัจจุบัน' arrow>
                                <span>
                                  <IconButton
                                    edge='end'
                                    aria-label='สลับการแสดงรหัสผ่านปัจจุบัน'
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseDown={(event) => event.preventDefault()}
                                  >
                                    {showPassword ? (
                                      <IconifyIcon icon='mdi:eye-remove' />
                                    ) : (
                                      <IconifyIcon icon='ic:round-remove-red-eye' />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <PasswordStrengthBar scoreWords={scoreWords} shortScoreWord={scoreWords[0]} password={value} />
                    </Fragment>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: (theme) => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
          }}
        >
          <Button variant='contained' sx={{ mr: 1 }} type='submit'>
            บันทึกการเปลี่ยนแปลง
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose}>
            ยกเลิก
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResetPasswordDialog;
