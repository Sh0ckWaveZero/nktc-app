// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import {
  Drawer,
  Typography,
  FormControl,
  TextField,
  Button,
  Box,
  Stack,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BoxProps } from '@mui/material/Box';

// ** Icons Imports
import Close from 'mdi-material-ui/Close';

// ** Utils

interface SidebarAddClassroomType {
  open: boolean;
  toggle: () => void;
  onSubmitted: (event: any, value: any) => void;
  data: any;
  selectedDate: Date;
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

const SidebarEditCheckInDrawer = (props: SidebarAddClassroomType) => {
  // ** Props
  const { open, toggle, onSubmitted, data, selectedDate } = props;

  // ** State
  const [values, setValues] = useState(data?.checkInStatus);
  const handleClose = () => {
    setValues('');
    toggle();
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h6'>แก้ไขเช็คชื่อกิจกรรมหน้าเสาธง</Typography>
        <Close fontSize='small' onClick={handleClose} sx={{ cursor: 'pointer' }} />
      </Header>

      <form onSubmit={(event) => onSubmitted(event, { isCheckInStatus: values, data })}>
        <Stack sx={{ p: 5 }} spacing={5}>
          <Typography variant='subtitle1' component='h2'>
            {new Date(selectedDate as Date).toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) || ''}
          </Typography>
          <TextField
            fullWidth
            id='รหัสนักเรียน'
            label='รหัสนักเรียน'
            value={data?.student?.studentId || ''}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            id='ชื่อ-นามสกุล'
            label='ชื่อ-นามสกุล'
            value={data?.account?.title + data?.account?.firstName + ' ' + data?.account?.lastName || ''}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            id='ชั้น'
            label='ชั้น'
            value={data?.classroomName?.name || ''}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
          />
          <FormControl>
            <FormLabel id='demo-radio-buttons-group-label'>การเช็คชื่อ</FormLabel>
            <RadioGroup
              aria-labelledby='demo-radio-buttons-group-label'
              defaultValue={data?.checkInStatus}
              value={values}
              onChange={(event) => setValues(event.target.value)}
              name='radio-buttons-group'
            >
              <FormControlLabel key={'present'} value='present' control={<Radio color='success' />} label='มาเรียน' />
              <FormControlLabel key={'absent'} value='absent' control={<Radio color='error' />} label='ขาด' />
              <FormControlLabel key={'late'} value='late' control={<Radio color='warning' />} label='มาสาย' />
              <FormControlLabel key={'leave'} value='leave' control={<Radio color='secondary' />} label='ลา' />
              <FormControlLabel key={'internship'} value='internship' control={<Radio color='info' />} label='ฝึกงาน' />
            </RadioGroup>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              disabled={data?.checkInStatus === values}
              size='large'
              type='submit'
              variant='contained'
              sx={{ mr: 3 }}
            >
              บันทึกข้อมูล
            </Button>
          </Box>
        </Stack>
      </form>
    </Drawer>
  );
};

export default SidebarEditCheckInDrawer;
