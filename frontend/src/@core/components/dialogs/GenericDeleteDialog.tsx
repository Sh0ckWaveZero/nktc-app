'use client';

import { memo } from 'react';
import { Typography } from '@mui/material';

import ConfirmDialog, { type ConfirmDialogOptions } from './ConfirmDialog';

interface GenericDeleteDialogProps {
  open: boolean;
  title: string;
  itemName: string;
  itemIdentifier?: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warningMessage?: string;
}

const GenericDeleteDialog = memo(
  ({ open, title, itemName, itemIdentifier, isDeleting, onClose, onConfirm, warningMessage }: GenericDeleteDialogProps) => {
    const options: ConfirmDialogOptions = {
      title,
      message: (
        <>
          คุณต้องการลบ{' '}
          <Typography component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {itemName}
          </Typography>
          {itemIdentifier && (
            <>
              {' '}
              <Typography component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
                ({itemIdentifier})
              </Typography>
            </>
          )}
          {' ใช่หรือไม่?'}
        </>
      ),
      severity: 'error',
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      showWarning: !!warningMessage,
      warningMessage,
    };

    return <ConfirmDialog open={open} options={options} onClose={onClose} onConfirm={onConfirm} isConfirming={isDeleting} />;
  },
);

GenericDeleteDialog.displayName = 'GenericDeleteDialog';

export default GenericDeleteDialog;
