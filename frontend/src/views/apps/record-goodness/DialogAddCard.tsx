import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import Fade, { FadeProps } from '@mui/material/Fade';
import { MouseEvent, ReactElement, Ref, forwardRef, useCallback, useEffect, useState } from 'react';

import CustomAvatar from '@/@core/components/mui/avatar';
import Icon from '@/@core/components/icon';
import { generateErrorMessages } from '@/utils/event';
import { getInitials } from '@/@core/utils/get-initials';
import { goodnessIndividualStore } from '@/store/apps/goodness-individual';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import useGetImage from '@/hooks/useGetImage';
import useImageCompression from '@/hooks/useImageCompression';
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

interface DialogAddCardProps {
  show: boolean;
  data: any;
  handleClose: () => void;
  handleOnSearch: () => void;
  user: any;
}
const DialogAddCard = (props: DialogAddCardProps) => {
  const { show, data, handleClose, handleOnSearch, user } = props;

  // hooks
  const { createGoodnessIndividual }: any = goodnessIndividualStore(
    (state: any) => ({ createGoodnessIndividual: state.createGoodnessIndividual }),
    shallow,
  );

  // ** States
  const [goodTypeScore, setGoodTypeScore] = useState<string>(''); // คะแนนที่ได้
  const [imgSrc, setImgSrc] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [onSubmit, setOnSubmit] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const avatar = data?.account?.avatar;
  const fullName = data.account.title + data.account.firstName + ' ' + data.account.lastName;
  const classroom = data.student?.classroom?.name;

  const { imageCompressed, handleInputImageChange } = useImageCompression();

  useEffect(() => {
    if (imageCompressed) {
      setLoadingImg(true);
      setImgSrc(imageCompressed);
      setLoadingImg(false);
    }
  }, [imageCompressed]);

  const { isLoading, image } = useGetImage(avatar);

  const handleInputChange = ({ target }: any) => {
    if (target.name === 'details') {
      setDetails(target.value);
    } else if (target.name === 'goodTypeScore') {
      setGoodTypeScore(target.value);
    }
  };

  const handleInputImageReset = () => {
    setInputValue('');
    setImgSrc('');
  };

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOnSubmit(true);
    if (goodTypeScore === '') {
      return;
    }
    handleClose();
    const { ...rest } = data;
    const body = {
      studentId: rest?.username,
      studentKey: rest?.student?.id,
      classroomId: rest?.student?.classroomId,
      image: imgSrc,
      goodnessScore: goodTypeScore,
      goodnessDetail: details,
      goodDate: selectedDate,
      createdBy: user?.id,
      updatedBy: user?.id,
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await createGoodnessIndividual(body).then((res: any) => {
      if (res?.name !== 'AxiosError') {
        toast.success('บันทึกข้อมูลสำเร็จ', { id: toastId });
        handleOnSearch();
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
    <Dialog fullWidth open={show} maxWidth='sm' scroll='body' onClose={handleClose} TransitionComponent={Transition}>
      <DialogContent sx={{ pb: 8, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton size='small' onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3 }}>
            บันทึกความดี
          </Typography>
        </Box>
        <Grid container spacing={6}>
          <Grid
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            size={12}
          >
            {isLoading ? (
              <CircularProgress size={100} />
            ) : image ? (
              <CustomAvatar src={image as string} sx={{ m: 3, width: 160, height: 160 }} />
            ) : (
              <CustomAvatar skin='light' color={'primary'} sx={{ m: 3, width: 160, height: 160, fontSize: '5rem' }}>
                {getInitials(data?.account?.firstName + ' ' + data.account?.lastName)}
              </CustomAvatar>
            )}
          </Grid>
          <Grid size={12}>
            <Grid container spacing={6}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  name='fullName'
                  value={fullName}
                  autoComplete='off'
                  label='ชื่อ-นามสกุล'
                  onChange={handleInputChange}
                  placeholder='ชื่อ-นามสกุล'
                  slotProps={{
                    input: { readOnly: true },
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  name='classroom'
                  value={classroom}
                  autoComplete='off'
                  label='ระดับชั้น'
                  placeholder='ระดับชั้น'
                  slotProps={{
                    input: { readOnly: true },
                  }}
                  onChange={handleInputChange}
                />
              </Grid>
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
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
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
        <Button variant='outlined' color='secondary' onClick={handleClose}>
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddCard;
