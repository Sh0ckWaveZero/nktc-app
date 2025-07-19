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
import { MouseEvent, ReactElement, Ref, forwardRef, useEffect, useState, useCallback } from 'react';
import Fade, { FadeProps } from '@mui/material/Fade';

import Icon from '@/@core/components/icon';
import LoadingButton from '@mui/lab/LoadingButton';
import { LocalStorageService } from '@/services/localStorageService';
import { generateErrorMessages } from '@/utils/event';
import { goodnessIndividualStore } from '@/store/apps/goodness-individual';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import useImageCompression from '@/hooks/useImageCompression';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import th from 'dayjs/locale/th';
import dayjs, { Dayjs } from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
dayjs.extend(buddhistEra);

const localStorageService = new LocalStorageService();
const storedToken = localStorageService.getToken()!;

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

  // hooks
  const { createGoodnessGroup }: any = goodnessIndividualStore(
    (state: any) => ({ createGoodnessGroup: state.createGoodnessGroup }),
    shallow,
  );

  // ** States
  const [goodTypeScore, setGoodTypeScore] = useState<string>(''); // คะแนนที่ได้
  const [imgSrc, setImgSrc] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [onSubmit, setOnSubmit] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs(new Date()));

  const { imageCompressed, handleInputImageChange } = useImageCompression();

  useEffect(() => {
    if (imageCompressed) {
      setLoadingImg(true);
      setImgSrc(imageCompressed);
      setLoadingImg(false);
    }
  }, [imageCompressed]);

  const handleInputChange = ({ target }: any) => {
    if (target.name === 'details') {
      setDetails(target.value);
    } else if (target.name === 'goodTypeScore') {
      setGoodTypeScore(target.value);
    }
  };

  const handleInputImageReset = useCallback(() => {
    setInputValue('');
    setImgSrc('');
  }, [setInputValue, setImgSrc]);

  const onHandleClose = () => {
    setImgSrc('');
    setGoodTypeScore('');
    setDetails('');
    setOnSubmit(false);
    handleClose();
  };

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOnSubmit(true);
    if (goodTypeScore === '') {
      return;
    }
    handleClose();

    const body = {
      students: data,
      image: imgSrc,
      goodnessScore: goodTypeScore,
      goodnessDetail: details,
      goodDate: selectedDate,
      createdBy: auth?.user?.id,
      updatedBy: auth?.user?.id,
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await createGoodnessGroup(storedToken, body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });
        // clear form
        setImgSrc('');
        setGoodTypeScore('');
        setDetails('');
        setOnSubmit(false);
        handleSusses();
      } else {
        const { data } = res?.response || {};
        const message = generateErrorMessages[data?.message] || data?.message;
        toast.error(message || 'เกิดข้อผิดพลาด', { id: toastId });
      }
    });
  };

  const handleSelectedDate = useCallback(
    (newDate: Dayjs | null) => {
      setSelectedDate(newDate);
    },
    [setSelectedDate],
  );

  return (
    <Dialog fullWidth open={onOpen} maxWidth='sm' scroll='body' onClose={onHandleClose} TransitionComponent={Transition}>
      <DialogContent sx={{ pb: 8, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton size='small' onClick={onHandleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
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
                  sm: 6
                }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={th}>
                  <DatePicker
                    label='เลือกวันที่'
                    value={selectedDate}
                    inputFormat='DD MMMM BBBB'
                    minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
                    maxDate={dayjs(new Date())}
                    onChange={(newDate) => handleSelectedDate(newDate)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        inputProps={{
                          ...params.inputProps,
                          placeholder: 'วัน เดือน ปี',
                        }}
                      />
                    )}
                    disableMaskedInput
                  />
                </LocalizationProvider>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <FormControl required fullWidth error={onSubmit && !goodTypeScore}>
                  <InputLabel id='goodTypeScore-label'>คะแนนความดี</InputLabel>
                  <Select
                    labelId='goodTypeScore-label'
                    id='goodTypeScore'
                    name='goodTypeScore'
                    value={goodTypeScore}
                    label='คะแนนความดี'
                    onChange={handleInputChange}
                  >
                    <MenuItem value=''>
                      <em>คะแนนความดี</em>
                    </MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                  </Select>
                  {onSubmit && !goodTypeScore && <FormHelperText>กรุณากรอกคะแนนความดี</FormHelperText>}
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
                  value={details}
                  autoComplete='off'
                  onChange={handleInputChange}
                  placeholder='รายละเอียดของการทำความดี'
                />
              </Grid>

              <Grid sx={{ mt: 4.8, mb: 3 }} size={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {imgSrc && <ImgStyled src={imgSrc} alt='Profile Pic' />}
                  <Box>
                    <LoadingButton
                      loading={loadingImg}
                      loadingPosition='start'
                      startIcon={<Icon icon={'uil:image-upload'} />}
                      variant='contained'
                      component='label'
                      htmlFor='account-settings-upload-image'
                    >
                      แนบไฟล์รูปภาพ
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
        <Button variant='contained' sx={{ mr: 1 }} onClick={handleSubmit}>
          บันทึก
        </Button>
        <Button variant='outlined' color='secondary' onClick={onHandleClose}>
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddGroup;
