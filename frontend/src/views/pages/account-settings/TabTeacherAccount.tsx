// ** React Imports
import { useState, ElementType, ChangeEvent } from 'react';

// ** MUI Imports
import {
  Box,
  Grid,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
} from '@mui/material';

import { styled } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';

// ** Icons Imports
import { useUserStore } from '@/store/index';

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius,
}));

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center',
  },
}));

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
}));

const TabTeacherAccount = () => {
  // ** State
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');

  const { userInfo } = useUserStore();

  const onChange = (file: ChangeEvent) => {
    const reader = new FileReader();
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string);

      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ mt: 4.8, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Profile Pic' />
              <Box>
                <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  อัปโหลดรูปภาพส่วนตัว
                  <input
                    hidden
                    type='file'
                    onChange={onChange}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
                <ResetButtonStyled color='error' variant='outlined' onClick={() => setImgSrc('/images/avatars/1.png')}>
                  รีเซ็ต
                </ResetButtonStyled>
                <Typography variant='body2' sx={{ mt: 5 }}>
                  ไฟล์ที่อนุญาต PNG หรือ JPEG ขนาดสูงสุด 800K.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>คำนำหน้า</InputLabel>
              <Select label='คำนำหน้า' defaultValue={userInfo?.account?.title} value={userInfo?.account?.title ?? ''}>
                <MenuItem value=''>
                  <em>เลือกคำนำหน้า</em>
                </MenuItem>
                <MenuItem value='นาง'>นาง</MenuItem>
                <MenuItem value='นาย'>นาย</MenuItem>
                <MenuItem value='นางสาว'>นางสาว</MenuItem>
                <MenuItem value='ดร'>ดร</MenuItem>
                <MenuItem value='ผศ'>ผศ</MenuItem>
                <MenuItem value='รศ'>รศ</MenuItem>
                <MenuItem value='ศ'>ศ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth label='ชื่อ' placeholder='ชื่อ' value={userInfo?.account?.firstName ?? ''} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth label='นามสกุล' placeholder='นามสกุล' value={userInfo?.account?.lastName ?? ''} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>ตำแหน่ง</InputLabel>
              <Select label='ตำแหน่ง' defaultValue='' value={userInfo?.teacher?.jobTitle ?? ''}>
                <MenuItem value=''>
                  <em>เลือกตำแหน่ง</em>
                </MenuItem>
                <MenuItem value='ผู้อำนวยการ'>ผู้อำนวยการ</MenuItem>
                <MenuItem value='รองผู้อำนวยการ'>รองผู้อำนวยการ</MenuItem>
                <MenuItem value='ข้าราชการ'>ข้าราชการ</MenuItem>
                <MenuItem value='พนักงานราชการ'>พนักงานราชการ</MenuItem>
                <MenuItem value='ครูอัตราจ้าง'>ครูอัตราจ้าง</MenuItem>
                <MenuItem value='เจ้าหน้าที่ธุรการ'>เจ้าหน้าที่ธุรการ</MenuItem>
                <MenuItem value='นักการภารโรง'>นักการภารโรง</MenuItem>
                <MenuItem value='ลูกจ้างประจำ'>ลูกจ้างประจำ</MenuItem>
                <MenuItem value='อื่น ๆ'>อื่น ๆ</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>วิทยฐานะ</InputLabel>
              <Select label='วิทยฐานะ' defaultValue='' value={userInfo?.teacher?.academicStanding ?? ''}>
                <MenuItem value=''>
                  <em>เลือกวิทยฐานะ</em>
                </MenuItem>
                <MenuItem value='ไม่มีวิทยฐานะ'>ไม่มีวิทยฐานะ</MenuItem>
                <MenuItem value='ชำนาญการ'>ชำนาญการ</MenuItem>
                <MenuItem value='ชำนาญการพิเศษ'>ชำนาญการพิเศษ</MenuItem>
                <MenuItem value='เชี่ยวชาญ'>เชี่ยวชาญ</MenuItem>
                <MenuItem value='เชี่ยวชาญพิเศษ'>เชี่ยวชาญพิเศษ</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>แผนกวิชา</InputLabel>
              <Select label='แผนกวิชา' defaultValue='' value={userInfo?.teacher?.academicStanding ?? ''}>
                <MenuItem value=''>
                  <em>เลือกแผนกวิชา</em>
                </MenuItem>
                <MenuItem value='ไม่มีวิทยฐานะ'>ไม่มีวิทยฐานะ</MenuItem>
                <MenuItem value='ชำนาญการ'>ชำนาญการ</MenuItem>
                <MenuItem value='ชำนาญการพิเศษ'>ชำนาญการพิเศษ</MenuItem>
                <MenuItem value='เชี่ยวชาญ'>เชี่ยวชาญ</MenuItem>
                <MenuItem value='เชี่ยวชาญพิเศษ'>เชี่ยวชาญพิเศษ</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='รหัสบัตรประจำตัว' placeholder='รหัสบัตรประจำตัว' value={''} />
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' sx={{ mr: 3.5 }}>
              บันทึกการเปลี่ยนแปลง
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              รีเซ็ต
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  );
};

export default TabTeacherAccount;
