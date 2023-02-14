// ** React Imports
import { Ref, useState, forwardRef, ReactElement, ChangeEvent, useCallback, FocusEvent } from 'react';

// ** MUI Imports
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import Fade, { FadeProps } from '@mui/material/Fade';

import { Focused } from 'react-credit-cards';

import { formatCVC, formatExpirationDate, formatCreditCardNumber } from '@/@core/utils/format';

import Icon from '@/@core/components/icon';
import CustomAvatar from '@/@core/components/mui/avatar';

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

interface DialogAddCardProps {
  show: boolean;
  data: any;
  handleClose: () => void;
}
const DialogAddCard = (props: DialogAddCardProps) => {
  const { show, data, handleClose } = props;

  // ** States
  const [name, setName] = useState<string>('');
  const [focus, setFocus] = useState<Focused | undefined>();

  const handleBlur = () => setFocus(undefined);

  const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    // if (target.name === 'number') {
    //   target.value = formatCreditCardNumber(target.value, Payment);
    //   setCardNumber(target.value);
    // } else if (target.name === 'expiry') {
    //   target.value = formatExpirationDate(target.value);
    //   setExpiry(target.value);
    // } else if (target.name === 'cvc') {
    //   target.value = formatCVC(target.value, cardNumber, Payment);
    //   setCvc(target.value);
    // }
  };

  const avatar = data[0]?.account?.avatar;
  const fullName = data[0].account.title + data[0].account.firstName + ' ' + data[0].account.lastName;
  const classroom = data[0].student?.classroom?.name;
  const detail = '';
  const recordGoodnessIndividual = '';

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    console.log(e.target.name);
    setFocus(e.target.name as Focused);
  }, []);

  const handleChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
    console.log(target.value);
    setName(target.value);
  }, []);

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
          <Typography variant='body1'>นายถนอม ไววอน</Typography>
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
            <CustomAvatar src={avatar} sx={{ mr: 3, width: 250, height: 250 }} />
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
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder='ชื่อ-นามสกุล'
                  InputProps={{ readOnly: true }}
                  onFocus={handleFocus}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='classroom'
                  value={classroom}
                  autoComplete='off'
                  onBlur={handleBlur}
                  label='ระดับชั้น'
                  placeholder='ระดับชั้น'
                  InputProps={{ readOnly: true }}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='รายการทำความดี'
                  label='รายการทำความดี'
                  value={recordGoodnessIndividual}
                  onBlur={handleBlur}
                  placeholder='รายการทำความดี'
                  onChange={handleChange}
                  inputProps={{ maxLength: '5' }}
                  onFocus={handleFocus}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='รายละเอียดของการทำความดี'
                  label='รายละเอียดของการทำความดี'
                  value={detail}
                  autoComplete='off'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  placeholder='รายละเอียดของการทำความดี'
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'center' }}>
        <Button variant='contained' sx={{ mr: 1 }} onClick={handleClose}>
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
