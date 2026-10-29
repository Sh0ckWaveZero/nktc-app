'use client';

import { ReactElement, Ref, forwardRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import Fade, { FadeProps } from '@mui/material/Fade';
import Alert from '@mui/material/Alert';
import IconifyIcon from '@/@core/components/icon';

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

interface ConfirmResetDialogProps {
  open: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  dialogId?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmResetDialog = ({
  open,
  title,
  description,
  warning,
  confirmText = 'ยืนยันการรีเซ็ต',
  cancelText = 'ยกเลิก',
  loading = false,
  dialogId,
  onConfirm,
  onClose,
}: ConfirmResetDialogProps) => {
  const idPrefix = dialogId ? `${dialogId}-` : '';
  return (
    <Dialog
      fullWidth
      open={open}
      maxWidth='sm'
      scroll='body'
      onClose={onClose}
      slots={{ transition: Transition }}
      aria-labelledby={dialogId ? `${idPrefix}dialog-title` : undefined}
    >
      <DialogContent
        sx={{
          position: 'relative',
          pb: (theme) => `${theme.spacing(8)} !important`,
          px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(8)} !important`],
          pt: (theme) => [`${theme.spacing(8)} !important`, `${theme.spacing(8)} !important`],
        }}
      >
        <IconButton
          id={dialogId ? `${idPrefix}close-btn` : undefined}
          size='small'
          onClick={onClose}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <IconifyIcon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <IconifyIcon icon='mdi:alert-circle-outline' fontSize={48} color='error' />
          </Box>
          <Typography id={dialogId ? `${idPrefix}dialog-title` : undefined} variant='h5' sx={{ mb: 2 }}>
            {title}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        </Box>
        {warning && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            {warning}
          </Alert>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
          px: (theme) => [`${theme.spacing(5)} !important`, `${theme.spacing(8)} !important`],
          pb: (theme) => `${theme.spacing(8)} !important`,
        }}
      >
        <Button
          id={dialogId ? `${idPrefix}confirm-btn` : undefined}
          variant='contained'
          color='error'
          disabled={loading}
          onClick={onConfirm}
          startIcon={<IconifyIcon icon='mdi:lock-reset' />}
        >
          {confirmText}
        </Button>
        <Button
          id={dialogId ? `${idPrefix}cancel-btn` : undefined}
          variant='outlined'
          color='secondary'
          disabled={loading}
          onClick={onClose}
        >
          {cancelText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmResetDialog;
