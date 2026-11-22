'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { ReactElement } from 'react';

interface ActivateAcademicYearDialogProps {
  academicYear: number;
  activeAcademicYear: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ActivateAcademicYearDialog = ({
  academicYear,
  activeAcademicYear,
  isSaving,
  onClose,
  onConfirm,
}: ActivateAcademicYearDialogProps): ReactElement => {
  const [confirmation, setConfirmation] = useState<string>('');
  return (
    <Dialog open fullWidth maxWidth='sm' onClose={isSaving ? undefined : onClose}>
      <DialogTitle>ยืนยันเปิดใช้ปีการศึกษา {academicYear}</DialogTitle>
      <DialogContent>
        <Stack spacing={4}>
          <Typography>
            ทั้งระบบจะเปลี่ยนจากปี {activeAcademicYear} เป็นปี {academicYear} ทันที
          </Typography>
          <Alert severity='info'>
            ใช้รายชื่อนักเรียน ครู แผนก สาขา และห้องเรียนเดิม เริ่มบันทึกเช็คชื่อ กิจกรรม เยี่ยมบ้าน
            และคะแนนใหม่แยกตามปี
          </Alert>
          <Typography variant='body2'>
            ข้อมูลปี {activeAcademicYear} ยังอยู่ครบ เลือกดูย้อนหลังและดาวน์โหลดรายงานได้ ปีเดิมจะเปิดดูได้อย่างเดียว
          </Typography>
          <TextField
            id='confirm-academic-year'
            fullWidth
            autoFocus
            label={`พิมพ์ ${academicYear} เพื่อยืนยัน`}
            value={confirmation}
            onChange={(event): void => setConfirmation(event.target.value)}
            disabled={isSaving}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={onClose} disabled={isSaving}>
          ยกเลิก
        </Button>
        <Button
          id='activate-academic-year'
          variant='contained'
          disabled={isSaving || confirmation !== String(academicYear)}
          onClick={(): void => {
            void onConfirm();
          }}
        >
          {isSaving ? 'กำลังเปิดใช้…' : `ยืนยันเปิดใช้ปี ${academicYear}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivateAcademicYearDialog;
