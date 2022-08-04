// ** React Imports
import { useState, ElementType, ChangeEvent, SyntheticEvent } from 'react';

// ** MUI Imports
import { styled } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';
import {
  Alert,
  AlertTitle,
  Box,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  Select,
  MenuItem,
  TextField,
  Typography,
  Stack
} from '@mui/material';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { th } from 'date-fns/locale';

// ** Icons Imports
import Close from 'mdi-material-ui/Close';

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}));

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}));

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}));

const getPosition = () => {
  const position = [
    {
      value: 'director',
      label: 'ผู้อำนวยการ'
    },
    {
      value: 'deputyDirector',
      label: 'รองผู้อำนวยการ'
    },
    {
      value: 'governmentOfficer',
      label: 'ข้าราชการ'
    },
    {
      value: 'governmentEmployee',
      label: 'พนักงานราชการ'
    },
    {
      value: 'ContractTeachers',
      label: 'ครูอัตราจ้าง'
    },
    {
      value: 'administrativeStaff',
      label: 'เจ้าหน้าที่ธุรการ'
    },
    {
      value: 'securityGuard',
      label: 'นักการภารโรง'
    },
    {
      value: 'janitor',
      label: 'พนักงานรักษาความปลอดภัย'
    },
    {
      value: 'permanentEmployee',
      label: 'ลูกจ้างประจำ'
    },
    {
      value: 'other',
      label: 'อื่นๆ'
    }
  ];

  return position;
};

const getAcademicStanding = () => {
  const academicStanding = [
    {
      value: 'as001',
      label: 'ไม่มีวิทยฐานะ'
    },
    {
      value: 'as002',
      label: 'ชำนาญการ'
    },
    {
      value: 'as003',
      label: 'ชำนาญการพิเศษ'
    },
    {
      value: 'as004',
      label: 'เชี่ยวชาญ'
    },
    {
      value: 'as005',
      label: 'เชี่ยวชาญพิเศษ'
    }
  ];

  return academicStanding;
};

const TabAccount = () => {
  // ** State
  const [openAlert, setOpenAlert] = useState<boolean>(true);
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png');
  const [value, setValue] = useState<Date | null | undefined>(null);

  const handleChange = (newValue: any) => {
    setValue(newValue);
  };

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
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Profile Pic' />
              <Box>
                <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  อัปโหลดรูปภาพใหม่
                  <input
                    hidden
                    type='file'
                    onChange={onChange}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
                <ResetButtonStyled color='error' variant='outlined' onClick={() => setImgSrc('/images/avatars/1.png')}>
                  ล้าง
                </ResetButtonStyled>
                <Typography variant='body2' sx={{ marginTop: 5 }}>
                  อนุญาต PNG หรือ JPEG ขนาดสูงสุด 800กิโลไบต์.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>คำนำหน้า</InputLabel>
              <Select label='คำนำหน้า' defaultValue=''>
                <MenuItem value='mr'>นาย</MenuItem>
                <MenuItem value='ms'>นางสาว</MenuItem>
                <MenuItem value='miss'>นาง</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label='ชื่อ' placeholder='johnDoe' defaultValue='johnDoe' />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label='นามสกุล' placeholder='John Doe' defaultValue='John Doe' />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>ตำแหน่ง</InputLabel>
              <Select label='ตำแหน่ง' defaultValue=''>
                {getPosition().map(({ value, label }) => {
                  return (
                    <MenuItem value={value} key={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>วิทยฐานะ</InputLabel>
              <Select label='วิทยฐานะ' defaultValue=''>
                {getAcademicStanding().map(({ value, label }) => {
                  return (
                    <MenuItem value={value} key={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
              <Stack spacing={3}>
                <DesktopDatePicker
                  label='วัน/เดือน/ปีเกิด'
                  inputFormat='dd/MM/yyyy'
                  value={value}
                  onChange={handleChange}
                  renderInput={params => <TextField {...params} />}
                />
              </Stack>
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='อีเมล์'
              placeholder='johnDoe@example.com'
              defaultValue='johnDoe@example.com'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>บทบาท</InputLabel>
              <Select label='Role' defaultValue='admin'>
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='author'>Author</MenuItem>
                <MenuItem value='editor'>Editor</MenuItem>
                <MenuItem value='maintainer'>Maintainer</MenuItem>
                <MenuItem value='subscriber'>Subscriber</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>สถานะ</InputLabel>
              <Select label='Status' defaultValue='active'>
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Company' placeholder='ABC Pvt. Ltd.' defaultValue='ABC Pvt. Ltd.' />
          </Grid>

          {openAlert ? (
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Alert
                severity='warning'
                sx={{ '& a': { fontWeight: 400 } }}
                action={
                  <IconButton size='small' color='inherit' aria-label='close' onClick={() => setOpenAlert(false)}>
                    <Close fontSize='inherit' />
                  </IconButton>
                }
              >
                <AlertTitle>อีเมลของคุณไม่ได้รับการยืนยัน โปรดตรวจสอบกล่องจดหมายของคุณ</AlertTitle>
                <Link href='/' onClick={(e: SyntheticEvent) => e.preventDefault()}>
                  ส่งการยืนยันอีกครั้ง
                </Link>
              </Alert>
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }}>
              บันทึกการเปลี่ยนแปลง
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              ล้างข้อมูล
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  );
};

export default TabAccount;
