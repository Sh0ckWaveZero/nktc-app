import IconifyIcon from '@/@core/components/icon';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  styled,
} from '@mui/material';
import React from 'react';

type Props = {
  data: any;
  onClose: () => void;
  onSubmitted: () => void;
  open: boolean;
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const DialogDeleteClassroom = (props: Props) => {
  const { data, onClose, onSubmitted, open } = props;

  return (
    <BootstrapDialog
      fullWidth
      maxWidth='xs'
      onClose={onClose}
      aria-labelledby='ยืนยันการลบข้อมูลรายชื่อห้องเรียน'
      open={open}
    >
      {onClose ? (
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <IconifyIcon icon='mdi:close' />
        </IconButton>
      ) : null}
      <DialogTitle id='alert-dialog-title-goodness'>ยืนยันการลบข้อมูลรายชื่อห้องเรียน</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-delete-badness' p={5}>
          {`คุณต้องการลบข้อมูลของ ${data?.name} ใช่หรือไม่?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-badness-dense'>
        <Button color='secondary' onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant='contained' color='error' onClick={onSubmitted}>
          ยืนยัน
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default DialogDeleteClassroom;
