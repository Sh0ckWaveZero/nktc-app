'use client';

import { useState } from 'react';
import CheckRounded from '@mui/icons-material/CheckRounded';
import TextFieldsOutlined from '@mui/icons-material/TextFieldsOutlined';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';

import { useSettings } from '@/@core/hooks/useSettings';
import { FONT_SCALE_OPTIONS } from '@/@core/utils/font-scale';

const FONT_SCALE_LABELS = ['ปกติ', 'ใหญ่', 'ใหญ่มาก'] as const;

const TextSizeControls = () => {
  const { settings, saveSettings } = useSettings();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const currentIndex = FONT_SCALE_OPTIONS.indexOf(settings.fontScale);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;
  const fontScalePercentage = FONT_SCALE_OPTIONS[effectiveIndex] * 100;

  const handleScaleChange = (nextIndex: number) => {
    const fontScale = FONT_SCALE_OPTIONS[nextIndex];

    if (!fontScale) return;
    saveSettings({ ...settings, fontScale });
    setMenuAnchor(null);
  };

  return (
    <>
      <Tooltip title={`ขนาดตัวอักษร ${fontScalePercentage}%`} enterDelay={300} arrow>
        <IconButton
          id='text-size-menu-button'
          type='button'
          color='inherit'
          aria-label={`เปิดเมนูขนาดตัวอักษร ปัจจุบัน ${fontScalePercentage} เปอร์เซ็นต์`}
          aria-haspopup='menu'
          aria-expanded={Boolean(menuAnchor)}
          aria-controls={menuAnchor ? 'text-size-menu' : undefined}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{
            width: 44,
            height: 44,
            backgroundColor: 'action.hover',
            transition: (theme) => theme.transitions.create(['background-color', 'transform'], { duration: 160 }),
            '&:hover': { backgroundColor: 'action.selected' },
            '&:active': { transform: 'scale(0.96)' },
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <TextFieldsOutlined fontSize='small' />
        </IconButton>
      </Tooltip>

      <Menu
        id='text-size-menu'
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ list: { 'aria-label': 'เลือกขนาดตัวอักษร' } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {FONT_SCALE_OPTIONS.map((fontScale, index) => (
          <MenuItem
            key={fontScale}
            selected={index === effectiveIndex}
            onClick={() => handleScaleChange(index)}
            sx={{ minHeight: 44, minWidth: 190 }}
          >
            <ListItemText primary={`${FONT_SCALE_LABELS[index]} ${fontScale * 100}%`} />
            {index === effectiveIndex && (
              <ListItemIcon sx={{ minWidth: 0, ml: 2 }}>
                <CheckRounded fontSize='small' color='primary' />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TextSizeControls;
