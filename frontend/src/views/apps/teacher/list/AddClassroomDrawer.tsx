// ** React Imports
import { useState } from 'react';

// ** MUI Imports
import { Drawer, Typography, FormControl, TextField, Button, Box, Autocomplete, Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BoxProps } from '@mui/material/Box';

// ** Icons Imports
import Close from 'mdi-material-ui/Close';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

// ** Utils
import { isEmpty } from '@/@core/utils/utils';
import { Classroom } from '@/types/apps/teacherTypes';

interface SidebarAddClassroomType {
  open: boolean;
  toggle: () => void;
  onSubmitted: (event: any, value: any) => void;
  defaultValues: Classroom[];
  data: Classroom[];
  onLoad: boolean;
}

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
  const { open, toggle, onSubmitted, defaultValues, data, onLoad } = props;
  // Keep only essential debugging for now
  // console.log('🚀 ~ SidebarAddClassroom ~ data length:', data?.length);

  // ** State
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(onLoad);
  const [enable, setEnable] = useState(false);

  const handleClose = () => {
    setLoading(false);
    setValues([]);
    toggle();
  };

  const onHandleChange = (event: any, value: any) => {
    isEmpty(value) ? setEnable(false) : setEnable(true);
    setValues(value);
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
        {loading ? (
          <Typography>กำลังโหลดข้อมูล...</Typography>
        ) : (
          <form onSubmit={(event) => onSubmitted(event, values)}>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <Autocomplete
                id='checkboxes-tags-classroom'
                multiple
                limitTags={15}
                defaultValue={defaultValues}
                options={data}
                onChange={(_, newValue: Classroom[]) => onHandleChange(_, newValue)}
                getOptionLabel={(option: any) => {
                  if (!option) return '';
                  const name = option?.name || 'ไม่มีชื่อ';
                  const department = option.department?.name || 'ไม่ระบุแผนก';
                  return `${name} (${department})`;
                }}
                isOptionEqualToValue={(option: Classroom, value: Classroom) => option.id === value.id}
                renderOption={(props: any, option: any, { selected }: any) => (
                  <li {...props}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.department?.name || 'ไม่ระบุแผนก'}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    error={isEmpty(values) && loading}
                    helperText={isEmpty(values) && loading ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
                    label='ระดับชั้น'
                    placeholder='เลือกระดับชั้น'
                  />
                )}
                forcePopupIcon={true}
                // groupBy={(option: Classroom) => option.department?.name || 'ไม่ระบุแผนก'}
                noOptionsText='ไม่พบข้อมูล'
              />
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button disabled={!enable} size='large' type='submit' variant='contained' sx={{ mr: 3 }}>
                บันทึกข้อมูล
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Drawer>
  );
};

export default SidebarAddClassroom;
