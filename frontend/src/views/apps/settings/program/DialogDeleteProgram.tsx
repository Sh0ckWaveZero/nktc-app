import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DialogDeleteProgramProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  programName: string;
}

/**
 * Dialog สำหรับยืนยันการลบสาขาวิชา
 * @param open - สถานะการเปิด/ปิด dialog
 * @param onClose - ฟังก์ชันสำหรับปิด dialog
 * @param onConfirm - ฟังก์ชันสำหรับยืนยันการลบ
 * @param programName - ชื่อสาขาวิชาที่จะลบ
 */
const DialogDeleteProgram = ({ open, onClose, onConfirm, programName }: DialogDeleteProgramProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>ยืนยันการลบสาขาวิชา</DialogTitle>
      <DialogContent>
        <DialogContentText>
          คุณแน่ใจหรือไม่ที่จะลบสาขาวิชา "{programName}"? 
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          ยกเลิก
        </Button>
        <Button onClick={onConfirm} color='error' variant='contained'>
          ลบ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeleteProgram;
