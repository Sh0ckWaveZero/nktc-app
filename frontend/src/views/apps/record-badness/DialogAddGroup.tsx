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
import { generateErrorMessages } from '@/utils/event';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import useImageCompression from '@/hooks/useImageCompression';
import { deepOrange } from '@mui/material/colors';
import { badnessIndividualStore } from '@/store/index';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

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
  const { createBadnessGroup }: any = badnessIndividualStore(
    (state: any) => ({ createBadnessGroup: state.createBadnessGroup }),
    shallow,
  );

  // ** States
  const [badTypeScore, setBadTypeScore] = useState<string>(''); // คะแนนที่ได้
  const [imgSrc, setImgSrc] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [onSubmit, setOnSubmit] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
    } else if (target.name === 'badTypeScore') {
      setBadTypeScore(target.value);
    }
  };

  const handleInputImageReset = useCallback(() => {
    setInputValue('');
    setImgSrc('');
  }, [setInputValue, setImgSrc]);

  const onHandleClose = () => {
    setImgSrc('');
    setBadTypeScore('');
    setDetails('');
    setOnSubmit(false);
    handleClose();
  };

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOnSubmit(true);
    if (badTypeScore === '') {
      return;
    }
    handleClose();
    const body = {
      students: data,
      image: imgSrc,
      badnessScore: badTypeScore,
      badnessDetail: details,
      badDate: selectedDate,
      createdBy: auth?.user?.id,
      updatedBy: auth?.user?.id,
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await createBadnessGroup(body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });
        // clear form
        setImgSrc('');
        setBadTypeScore('');
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
    (newDate: Date | null) => {
      setSelectedDate(newDate);
    },
    [setSelectedDate],
  );

  return (
    <Dialog
      fullWidth
      open={onOpen}
      maxWidth='sm'
      scroll='body'
      onClose={onHandleClose}
      TransitionComponent={Transition}
    >
      <DialogContent sx={{ pb: 8, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton size='small' onClick={onHandleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 20, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3, color: deepOrange[800] }}>
            บันทึกพฤติกรรมที่ไม่เหมาะสม
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
                  value={selectedDate}
                  onChange={handleSelectedDate}
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
                <FormControl required fullWidth error={onSubmit && !badTypeScore}>
                  <InputLabel id='badTypeScore-label'>คะแนนพฤติกรรมที่ไม่เหมาะสม</InputLabel>
                  <Select
                    labelId='badTypeScore-label'
                    id='badTypeScore'
                    name='badTypeScore'
                    value={badTypeScore}
                    label='คะแนนพฤติกรรมที่ไม่เหมาะสม'
                    onChange={handleInputChange}
                  >
                    <MenuItem value=''>
                      <em>คะแนนพฤติกรรมที่ไม่เหมาะสม</em>
                    </MenuItem>
                    <MenuItem value={0}>ตักเตือน</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={40}>40</MenuItem>
                  </Select>
                  {onSubmit && !badTypeScore && <FormHelperText>กรุณากรอกคะแนนพฤติกรรมที่ไม่เหมาะสม</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={5}
                  name='details'
                  label='รายละเอียดของพฤติกรรมที่ไม่เหมาะสม'
                  value={details}
                  autoComplete='off'
                  onChange={handleInputChange}
                  placeholder='รายละเอียดของพฤติกรรมที่ไม่เหมาะสม'
                />
              </Grid>

              <Grid sx={{ mt: 4.8, mb: 3 }} size={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {imgSrc && <ImgStyled src={imgSrc} alt='Profile Pic' />}
                  <Box>
                    <Button
                      loading={loadingImg}
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
                    </Button>
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
