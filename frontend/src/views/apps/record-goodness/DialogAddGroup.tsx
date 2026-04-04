import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  styled,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { MouseEvent, ReactElement, Ref, forwardRef } from 'react';
import Fade, { FadeProps } from '@mui/material/Fade';

import Icon from '@/@core/components/icon';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { useGoodnessGroupForm } from '@/hooks/features/goodness';

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

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

interface DialogAddGoodnessGroupProps {
  onOpen: boolean;
  data: any;
  handleClose: () => void;
  handleSusses: () => void;
  auth: any;
}
const DialogAddGroup = (props: DialogAddGoodnessGroupProps) => {
  const { onOpen, data, handleClose, auth, handleSusses } = props;

  // Use custom hook for form management
  const form = useGoodnessGroupForm({
    students: data,
    onSuccess: handleSusses,
    onClose: handleClose,
  });

  return (
    <Dialog
      fullWidth
      open={onOpen}
      maxWidth='sm'
      scroll='body'
      onClose={form.handleClose}
      TransitionComponent={Transition}
    >
      <DialogContent sx={{ pb: 8, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton size='small' onClick={form.handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 20, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            บันทึกการทำความดีแบบกลุ่ม
          </Typography>
        </Box>
        <Grid container spacing={6}>
          <Grid size={12}>
            <Grid container spacing={6}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <ThaiDatePicker
                  label='เลือกวันที่'
                  value={form.selectedDate}
                  onChange={form.handleSelectedDate}
                  format='dd MMMM yyyy'
                  minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
                  maxDate={new Date()}
                  placeholder='วัน เดือน ปี (พ.ศ.)'
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <FormControl required fullWidth error={form.onSubmit && !form.goodTypeScore}>
                  <InputLabel id='goodTypeScore-label'>คะแนนความดี</InputLabel>
                  <Select
                    labelId='goodTypeScore-label'
                    id='goodTypeScore'
                    name='goodTypeScore'
                    value={form.goodTypeScore}
                    label='คะแนนความดี'
                    onChange={form.handleInputChange}
                  >
                    <MenuItem value=''>
                      <em>คะแนนความดี</em>
                    </MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                  </Select>
                  {form.onSubmit && !form.goodTypeScore && <FormHelperText>กรุณากรอกคะแนนความดี</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={5}
                  name='details'
                  label='รายละเอียดของการทำความดี'
                  value={form.details}
                  autoComplete='off'
                  onChange={form.handleInputChange}
                  placeholder='รายละเอียดของการทำความดี'
                />
              </Grid>

              <Grid sx={{ mt: 4.8, mb: 3 }} size={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {form.imgSrc && <ImgStyled src={form.imgSrc} alt='Profile Pic' />}
                  <Box>
                    <Button
                      loading={form.loadingImg}
                      startIcon={<Icon icon={'uil:image-upload'} />}
                      variant='contained'
                      component='label'
                      htmlFor='account-settings-upload-image'
                    >
                      แนบไฟล์รูปภาพ
                      <input
                        hidden
                        type='file'
                        value={form.inputValue}
                        onChange={form.handleInputImageChange}
                        accept='image/png, image/jpeg, image/webp'
                        id='account-settings-upload-image'
                      />
                    </Button>
                    <ResetButtonStyled color='error' variant='outlined' onClick={form.handleInputImageReset}>
                      รีเซ็ต
                    </ResetButtonStyled>
                    <Typography variant='body2' sx={{ mt: 5 }}>
                      อนุญาต PNG, JPEG หรือ WEBP
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
        <Button variant='contained' sx={{ mr: 1 }} onClick={form.handleSubmit} disabled={form.isSubmitting}>
          บันทึก
        </Button>
        <Button variant='outlined' color='secondary' onClick={form.handleClose}>
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddGroup;
