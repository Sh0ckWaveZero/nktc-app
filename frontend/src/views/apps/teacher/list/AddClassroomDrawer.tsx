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
import { useTeacherStore } from '../../../../store/index';

interface SidebarAddClassroomType {
  open: boolean;
  toggle: () => void;
  data: any;
  onLoad: boolean;
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

const icon = <MdCheckBoxOutlineBlank />;
const checkedIcon = <MdCheckBox />;

const SidebarAddClassroom = (props: SidebarAddClassroomType) => {
  // ** Props
  const { open, toggle, data, onLoad } = props;

  // ** State
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(onLoad);

  // ** Hooks
  const { fetchTeacher, updateTeacher } = useTeacherStore();
  const { classroom, fetchClassroom } = useClassroomStore();
  const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!;

  useEffectOnce(() => {
    fetchClassroom(storedToken);
  });

  const onSubmit: any = async (event: any, classroomData: any) => {
    event.preventDefault();
    setLoading(true);
    const classroom = classroomData.map((item: any) => item.id);
    const info = { id: data.id, classroom };
    const result = await updateTeacher(storedToken, info);
    fetchTeacher(storedToken, {
      q: '',
    });
    handleClose();
  };

  const handleClose = () => {
    setLoading(false);
    setValues([]);
    toggle();
  };

  const defaultValue: any = classroom.filter((item: any) => data.classroomIds.includes(item.id)) ?? [];

  const isEmpty = (obj: any) => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

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
              id='checkboxes-tags-classroom'
              multiple
              limitTags={15}
              defaultValue={defaultValue}
              options={classroom}
              onChange={(_, newValue: any) => setValues(newValue)}
              getOptionLabel={(option: any) => option?.name ?? ''}
              isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
              renderOption={(props, option, { selected }) => (
                <li key={option.classroomId} {...props}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  error={isEmpty(values) && loading}
                  helperText={isEmpty(values) && loading ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
                  {...params}
                  label='ระดับชั้น'
                  placeholder='เลือกระดับชั้น'
                />
              )}
              disableCloseOnSelect
              filterSelectedOptions
              groupBy={(option: any) => option.program?.name}
              noOptionsText='ไม่พบข้อมูล'
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
