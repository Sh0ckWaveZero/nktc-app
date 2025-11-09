'use client';

import { DeleteOutline, DotsVertical, EyeOutline, PencilOutline } from 'mdi-material-ui';
import { IconButton, Menu, MenuItem } from '@mui/material';
import React, { MouseEvent, useState } from 'react';
import IconifyIcon from '@/@core/components/icon';
import { Teacher } from '../utils/teacherUtils';

interface RowOptionsProps {
  row: Teacher;
  handleDelete: (data: Teacher) => void;
  handleEdit: (data: Teacher) => void;
  handleChangePassword: (data: Teacher) => void;
}

const RowOptions = ({ row, handleDelete, handleEdit, handleChangePassword }: RowOptionsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const rowOptionsOpen = Boolean(anchorEl);

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
          paper: { sx: { minWidth: '8rem' } },
        }}
      >
        <MenuItem
          id={`teacher-change-password-${row.id}`}
          onClick={handleChangePasswordRow}
        >
          <IconifyIcon icon='mdi:password-check-outline' fontSize='1.3rem' style={{ marginRight: '10px' }} />
          เปลี่ยนรหัสผ่าน
        </MenuItem>

        <MenuItem id={`teacher-view-${row.id}`}>
          <EyeOutline fontSize='small' sx={{ mr: 2, color: 'info.main' }} />
          ดู
        </MenuItem>
        <MenuItem
          id={`teacher-edit-${row.id}`}
          onClick={handleEditRow}
        >
          <PencilOutline fontSize='small' sx={{ mr: 2, color: 'warning.main' }} />
          แก้ไข
        </MenuItem>
        <MenuItem
          id={`teacher-delete-${row.id}`}
          onClick={handleDeleteRow}
        >
          <DeleteOutline fontSize='small' sx={{ mr: 2, color: 'error.main' }} />
          ลบ
        </MenuItem>
      </Menu>
    </>
  );
};

export default RowOptions;

