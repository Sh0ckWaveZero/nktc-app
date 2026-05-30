'use client';

import { ReactNode } from 'react';
import { alpha, Box } from '@mui/material';
import { Alert, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { RiDeleteBinLine, RiAlertLine, RiInformationLine, RiCheckLine } from 'react-icons/ri';

export interface ConfirmDialogOptions {
  title: string;
  message: ReactNode;
  severity?: 'error' | 'warning' | 'info' | 'success';
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  showWarning?: boolean;
  warningMessage?: string;
  disabled?: boolean;
}

interface ConfirmDialogProps {
  open: boolean;
  options: ConfirmDialogOptions;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

const ICON_MAP = {
  error: RiDeleteBinLine,
  warning: RiAlertLine,
  info: RiInformationLine,
  success: RiCheckLine,
} as const;

const COLOR_MAP = {
  error: 'error' as const,
  warning: 'warning' as const,
  info: 'info' as const,
  success: 'success' as const,
} as const;

const ConfirmDialog = ({ open, options, onClose, onConfirm, isConfirming = false }: ConfirmDialogProps) => {
  const {
    title,
    message,
    severity = 'error',
    icon,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    showWarning = false,
    warningMessage,
    disabled = false,
  } = options;

  const IconComponent = icon || ICON_MAP[severity];
  const color = COLOR_MAP[severity];

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth='xs'
      onClose={isConfirming ? undefined : onClose}
      aria-labelledby={`${severity}-confirm-dialog-title`}
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
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
            color: `${color}.main`,
            mb: 3,
          }}
        >
          <IconComponent size={32} />
        </Box>
        <Typography
          variant='h6'
          id={`${severity}-confirm-dialog-title`}
          sx={{
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
      </Box>
      <DialogContent sx={{ px: 6, pt: 2, pb: showWarning ? 3 : 4, textAlign: 'center' }}>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            lineHeight: 1.8,
          }}
        >
          {message}
        </Typography>
        {showWarning && warningMessage && (
          <Alert severity={severity} sx={{ borderRadius: 2, mt: 2 }}>
            {warningMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 6, gap: 2 }}>
        <Button
          variant='outlined'
          color='inherit'
          onClick={onClose}
          disabled={isConfirming || disabled}
          fullWidth
          id={`${severity}-confirm-dialog-cancel`}
        >
          {cancelText}
        </Button>
        <Button
          variant='contained'
          color={severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'primary'}
          onClick={onConfirm}
          disabled={isConfirming || disabled}
          fullWidth
          id={`${severity}-confirm-dialog-confirm`}
        >
          {isConfirming ? 'กำลังดำเนินการ...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
