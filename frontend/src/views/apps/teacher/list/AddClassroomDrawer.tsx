// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import {
  Drawer,
  Typography,
  FormControl,
  TextField,
  FormHelperText,
  InputLabel,
  MenuItem,
  Button,
  Box,
  Select,
  Autocomplete,
  Checkbox,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { BoxProps } from '@mui/material/Box';

// ** Third Party Imports
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

// ** Icons Imports
import Close from 'mdi-material-ui/Close';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

// ** Store Imports
import { useClassroomStore, useUserStore } from '@/store/index';
import { useEffectOnce } from '@/hooks/userCommon';

// ** Config
import authConfig from '@/configs/auth';

interface SidebarAddClassroomType {
  open: boolean;
  toggle: () => void;
  data: any;
}

interface UserData {
  email: string;
  company: string;
  country: string;
  contact: number;
  fullName: string;
  username: string;
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} field is required`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`;
  } else {
    return '';
  }
};

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

const schema = yup.object().shape({
  company: yup.string().required(),
  country: yup.string().required(),
  email: yup.string().email().required(),
  contact: yup
    .number()
    .typeError('Contact Number field is required')
    .min(10, (obj) => showErrors('Contact Number', obj.value.length, obj.min))
    .required(),
  fullName: yup
    .string()
    .min(3, (obj) => showErrors('First Name', obj.value.length, obj.min))
    .required(),
  username: yup
    .string()
    .min(3, (obj) => showErrors('Username', obj.value.length, obj.min))
    .required(),
});

const icon = <MdCheckBoxOutlineBlank />;
const checkedIcon = <MdCheckBox />;

const SidebarAddClassroom = (props: SidebarAddClassroomType) => {
  // ** Props
  const { open, toggle, data } = props;
  const theme = useTheme();

  // ** State
  const [values, setValues] = useState([]);

  // ** Hooks
  const addUser = useUserStore((state: any) => state.addUser);
  const fetchClassroom = useClassroomStore((state: any) => state.fetchClassroom);
  const classroom = useClassroomStore((state: any) => state.classroom);

  useEffectOnce(() => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!;
    fetchClassroom(storedToken);
  });

  const onSubmit: any = (event: any, value: any) => {
    event.preventDefault();
    console.log('🚀 ~ file: AddClassroomDrawer.tsx ~ line 127 ~ SidebarAddClassroom ~ data', value);
    // () => addUser({ ...data, role, currentPlan: plan });
    handleClose();
  };

  const handleClose = () => {
    setValues([]);
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
        <Typography variant='h6'>เพิ่มห้องที่ปรึกษา</Typography>
        <Close fontSize='small' onClick={handleClose} sx={{ cursor: 'pointer' }} />
      </Header>
      <Box sx={{ p: 5 }}>
        <form onSubmit={(event) => onSubmit(event, values)}>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Autocomplete
              multiple
              id='checkboxes-tags-classroom'
              options={classroom}
              value={values}
              onChange={(event, value: any) => setValues(value)}
              disableCloseOnSelect
              getOptionLabel={(option: any) => option.name}
              isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
              renderOption={(props, option, { selected }) => (
                <li key={option.classroomId} {...props}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                  {option.name}
                </li>
              )}
              groupBy={(option: any) => option.program.name}
              renderInput={(params) => <TextField {...params} label='ระดับชั้น' placeholder='เลือกระดับชั้น' />}
            />
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button size='large' type='submit' variant='contained' sx={{ mr: 3 }}>
              บันทึกข้อมูล
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default SidebarAddClassroom;
