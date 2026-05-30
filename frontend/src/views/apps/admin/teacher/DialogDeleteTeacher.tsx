import { alpha, Box, Typography } from '@mui/material';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';

import IconifyIcon from '@/@core/components/icon';

type Props = {
  data: any;
  onClose: () => void;
  onSubmitted: () => void;
  open: boolean;
};

const DialogDeleteTeacher = (props: Props) => {
  const { data, onClose, onSubmitted, open } = props;
  const fullName = `${data?.title ? data?.title : ''}${data?.firstName} ${data?.lastName}`;
  return (
    <Dialog fullWidth maxWidth='xs' onClose={onClose} aria-labelledby='ยืนยันการลบข้อมูลครู / บุคลากร' open={open}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 6, pt: 6, pb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
            color: 'error.main',
            mb: 3,
          }}
        >
          <IconifyIcon icon='tabler:trash' fontSize={28} />
        </Box>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          ยืนยันการลบข้อมูลครู / บุคลากร
        </Typography>
      </Box>
      <DialogContent sx={{ px: 6, pt: 2, pb: 4, textAlign: 'center' }}>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            lineHeight: 1.8,
          }}
        >
          {'คุณต้องการลบข้อมูลของ '}
          <Box component='strong' sx={{ color: 'text.primary' }}>
            {fullName}
          </Box>
          {' ใช่หรือไม่?'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
        <Button variant='outlined' color='inherit' onClick={onClose} fullWidth>
          ยกเลิก
        </Button>
        <Button variant='contained' color='error' onClick={onSubmitted} fullWidth>
          ลบข้อมูล
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeleteTeacher;
