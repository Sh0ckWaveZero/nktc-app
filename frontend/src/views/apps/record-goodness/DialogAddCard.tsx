import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { ChangeEvent, MouseEvent, ReactElement, Ref, forwardRef, useState } from 'react';
import Fade, { FadeProps } from '@mui/material/Fade';

import CustomAvatar from '@/@core/components/mui/avatar';
import Icon from '@/@core/components/icon';
import LoadingButton from '@mui/lab/LoadingButton';
import { LocalStorageService } from '@/services/localStorageService';
import { generateErrorMessages } from 'utils/event';
import { goodnessIndividualStore } from '@/store/apps/goodness-individual';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import useGetImage from '@/hooks/useGetImage';

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

  const avatar = data[0]?.account?.avatar;
  const fullName = data[0].account.title + data[0].account.firstName + ' ' + data[0].account.lastName;
  const classroom = data[0].student?.classroom?.name;

  const { isLoading, error, image } = useGetImage(avatar, storedToken);

  const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.name === 'details') {
      setDetails(target.value);
    } else if (target.name === 'goodTypeScore') {
      setGoodTypeScore(target.value);
    }
  };

  const handleInputImageChange = (file: ChangeEvent) => {
    setLoadingImg(true);
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;

    if (files && files.length !== 0) {
      if (files[0].size > 1000000) {
        toast.error('ขนาดไฟล์ใหญ่เกินไป');
        setLoadingImg(false);
        return;
      }
      reader.onload = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(files[0]);

      if (reader.result !== null) {
        setInputValue(reader.result as string);
      }

      setLoadingImg(false);
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
    const { ...rest } = data[0];
    const body = {
      studentId: rest?.username,
      studentKey: rest?.student?.id,
      classroomId: rest?.student?.classroomId,
      image: imgSrc,
      goodnessScore: goodTypeScore,
      goodnessDetail: details,
      createdBy: user?.id,
      updatedBy: user?.id,
    };

    const toastId = toast.loading('กำลังบันทึกข้อมูล...');
    await createGoodnessIndividual(storedToken, body).then((res: any) => {
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

  return (
    <Dialog
      fullWidth
      open={show}
      maxWidth='sm'
      scroll='body'
      onClose={handleClose}
      onBackdropClick={handleClose}
      TransitionComponent={Transition}
    >
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
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <CircularProgress size={100} />
            ) : (
              <CustomAvatar src={image} sx={{ m: 3, width: 160, height: 160 }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='fullName'
                  value={fullName}
                  autoComplete='off'
                  label='ชื่อ-นามสกุล'
                  onChange={handleInputChange}
                  placeholder='ชื่อ-นามสกุล'
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='classroom'
                  value={classroom}
                  autoComplete='off'
                  label='ระดับชั้น'
                  placeholder='ระดับชั้น'
                  InputProps={{ readOnly: true }}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='goodTypeScore'
                  label='คะแนนความดี'
                  value={goodTypeScore}
                  type='number'
                  autoComplete='off'
                  onChange={handleInputChange}
                  placeholder='คะแนนความดี'
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  error={onSubmit && !goodTypeScore}
                  helperText={onSubmit && !goodTypeScore && 'กรุณากรอกคะแนนความดี'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sx={{ mt: 4.8, mb: 3 }}>
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
                      อนุญาต PNG, JPEG หรือ WEBP ขนาดสูงสุด 1MB.
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
