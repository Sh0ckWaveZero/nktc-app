'use client';

import { memo, useState } from 'react';
import { alpha, Box } from '@mui/material';
import { RiGraduationCapLine } from 'react-icons/ri';

import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';

interface GenericGraduationDialogProps {
  open: boolean;
  title: string;
  entityName: string;
  isGraduating: boolean;
  onClose: () => void;
  onConfirm: (graduationDate: Date) => void;
}

const GenericGraduationDialog = memo(
  ({ open, title, entityName, isGraduating, onClose, onConfirm }: GenericGraduationDialogProps) => {
    const [graduationDate, setGraduationDate] = useState<Date | null>(new Date());

    return (
      <Dialog
        open={open}
        maxWidth='xs'
        fullWidth
        onClose={(_, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') onClose();
        }}
        aria-labelledby='graduation-dialog-title'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 6, pt: 6, pb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
              color: 'success.main',
              mb: 3,
            }}
          >
            <RiGraduationCapLine size={28} />
          </Box>
          <Typography
            variant='h6'
            id='graduation-dialog-title'
            sx={{
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {title}
          </Typography>
        </Box>
        <DialogContent sx={{ px: 6, pt: 2, pb: 4, textAlign: 'center' }}>
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
              mb: 4,
              lineHeight: 1.8,
            }}
          >
            {'บันทึกการจบการศึกษาของ '}
            <Typography component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {entityName}
            </Typography>
            {' ใช่หรือไม่?'}
          </Typography>
          <ThaiDatePicker
            label='วันที่จบการศึกษา (พ.ศ.)'
            value={graduationDate}
            onChange={(date) => setGraduationDate(date)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
          <Button
            variant='outlined'
            color='inherit'
            onClick={onClose}
            disabled={isGraduating}
            fullWidth
            id='graduation-dialog-cancel'
          >
            ยกเลิก
          </Button>
          <Button
            variant='contained'
            color='success'
            disabled={!graduationDate || isGraduating}
            onClick={() => graduationDate && onConfirm(graduationDate)}
            fullWidth
            id='graduation-dialog-confirm'
          >
            {isGraduating ? 'กำลังบันทึก...' : 'ยืนยัน'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

GenericGraduationDialog.displayName = 'GenericGraduationDialog';

export default GenericGraduationDialog;
