'use client';

import { DeleteOutline, DotsVertical, EyeOutline, PencilOutline } from 'mdi-material-ui';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { MouseEvent, useState } from 'react';
import Link from 'next/link';
import IconifyIcon from '@/@core/components/icon';
import { Teacher } from '../utils/teacherUtils';

interface RowOptionsProps {
  row: Teacher;
  handleDelete: (data: Teacher) => void;
  handleEdit: (data: Teacher) => void;
  handleChangePassword: (data: Teacher) => void;
  handleResetMfa?: (data: Teacher) => void;
  handleResetPasskey?: (data: Teacher) => void;
  isAdmin?: boolean;
}

const RowOptions = ({
  row,
  handleDelete,
  handleEdit,
  handleChangePassword,
  handleResetMfa,
  handleResetPasskey,
  isAdmin,
}: RowOptionsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const rowOptionsOpen = Boolean(anchorEl);

  const mfaEnabled = row.user?.authUser?.twoFactorEnabled === true;
  const passkeyCount = row.user?.authUser?._count?.passkeys ?? 0;
  const hasPasskey = passkeyCount > 0;

  const handleRowOptionsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRowOptionsClose = () => {
    setAnchorEl(null);
  };

  const handleEditRow = () => {
    handleEdit(row);
    handleRowOptionsClose();
  };

  const handleChangePasswordRow = () => {
    handleChangePassword(row);
    handleRowOptionsClose();
  };

  const handleResetMfaRow = () => {
    handleResetMfa?.(row);
    handleRowOptionsClose();
  };

  const handleResetPasskeyRow = () => {
    handleResetPasskey?.(row);
    handleRowOptionsClose();
  };

  const handleDeleteRow = () => {
    handleDelete(row);
    handleRowOptionsClose();
  };

  return (
    <>
      <IconButton
        id={`teacher-row-options-${row.id}`}
        size='small'
        onClick={handleRowOptionsClick}
        aria-label='Row options'
        sx={{
          borderRadius: 2,
          color: 'primary.main',
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
          },
        }}
      >
        <DotsVertical />
      </IconButton>
      <Menu
        id={`teacher-row-menu-${row.id}`}
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: '11rem',
              border: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
              boxShadow: (theme) =>
                `0 14px 34px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12)}`,
            },
          },
        }}
      >
        <MenuItem
          id={`teacher-change-password-${row.id}`}
          onClick={handleChangePasswordRow}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <IconifyIcon
            icon='mdi:password-check-outline'
            fontSize='1.3rem'
            style={{ marginRight: '10px', color: 'var(--mui-palette-primary-main)' }}
          />
          เปลี่ยนรหัสผ่าน
        </MenuItem>

        {isAdmin && handleResetMfa && (
          <Tooltip
            id={`teacher-reset-mfa-tooltip-${row.id}`}
            title={mfaEnabled ? 'รีเซ็ตการยืนยันตัวตนสองขั้นตอน' : 'ผู้ใช้รายนี้ยังไม่ได้เปิดใช้งาน MFA'}
            placement='left'
          >
            <span style={{ display: 'block' }}>
              <MenuItem
                id={`teacher-reset-mfa-${row.id}`}
                disabled={!mfaEnabled}
                onClick={handleResetMfaRow}
                sx={{
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <IconifyIcon
                  icon='mdi:two-factor-authentication'
                  fontSize='1.3rem'
                  style={{ marginRight: '10px', color: 'var(--mui-palette-error-main)' }}
                />
                รีเซ็ต MFA
              </MenuItem>
            </span>
          </Tooltip>
        )}

        {isAdmin && handleResetPasskey && (
          <Tooltip
            id={`teacher-reset-passkey-tooltip-${row.id}`}
            title={hasPasskey ? 'รีเซ็ต Passkey ทั้งหมด' : 'ผู้ใช้รายนี้ยังไม่มี Passkey'}
            placement='left'
          >
            <span style={{ display: 'block' }}>
              <MenuItem
                id={`teacher-reset-passkey-${row.id}`}
                disabled={!hasPasskey}
                onClick={handleResetPasskeyRow}
                sx={{
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <IconifyIcon
                  icon='mdi:fingerprint'
                  fontSize='1.3rem'
                  style={{ marginRight: '10px', color: 'var(--mui-palette-error-main)' }}
                />
                รีเซ็ต Passkey
              </MenuItem>
            </span>
          </Tooltip>
        )}

        <MenuItem
          id={`teacher-view-${row.id}`}
          component={Link}
          href={`/apps/user/view/${row.id}`}
          onClick={handleRowOptionsClose}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.info.main, 0.08),
            },
          }}
        >
          <EyeOutline fontSize='small' sx={{ mr: 2, color: 'info.main' }} />
          ดู
        </MenuItem>
        <MenuItem
          id={`teacher-edit-${row.id}`}
          onClick={handleEditRow}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.08),
            },
          }}
        >
          <PencilOutline fontSize='small' sx={{ mr: 2, color: 'warning.main' }} />
          แก้ไข
        </MenuItem>
        <MenuItem
          id={`teacher-delete-${row.id}`}
          onClick={handleDeleteRow}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <DeleteOutline fontSize='small' sx={{ mr: 2, color: 'error.main' }} />
          ลบ
        </MenuItem>
      </Menu>
    </>
  );
};

export default RowOptions;
