'use client';

import { alpha, Box } from '@mui/material';
import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';

import Icon from '@/@core/components/icon';

import type { ProgramItem } from '@/hooks/queries/useDepartments';

interface ProgramDeleteDialogProps {
  open: boolean;
  program: ProgramItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ProgramDeleteDialog = ({ open, program, isDeleting, onClose, onConfirm }: ProgramDeleteDialogProps) => {
  return (
    <Dialog open={open} fullWidth maxWidth='xs' onClose={isDeleting ? undefined : onClose}>
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
          <Icon icon='tabler:trash' fontSize={28} />
        </Box>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          ยืนยันการลบสาขาวิชา
        </Typography>
      </Box>
      <DialogContent sx={{ px: 6, pt: 2, pb: 4, textAlign: 'center' }}>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.8,
          }}
        >
          {'คุณกำลังจะลบ '}
          <Box component='strong' sx={{ color: 'text.primary' }}>
            {program?.name || 'สาขาวิชา'}
            {program?.programId ? ` (${program.programId})` : ''}
          </Box>
          {' ออกจากระบบ'}
        </Typography>
        <Alert severity='warning' sx={{ borderRadius: 2 }}>
          <AlertTitle>ลบแล้วกู้คืนอัตโนมัติไม่ได้</AlertTitle>
          ระบบจะยอมลบได้เฉพาะสาขาที่ยังไม่มีนักเรียน ครู ห้องเรียน หรือรายวิชาเชื่อมอยู่เท่านั้น
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
        <Button variant='outlined' color='inherit' onClick={onClose} disabled={isDeleting} fullWidth>
          ยกเลิก
        </Button>
        <Button variant='contained' color='error' onClick={onConfirm} disabled={isDeleting} fullWidth>
          ลบสาขา
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDeleteDialog;
