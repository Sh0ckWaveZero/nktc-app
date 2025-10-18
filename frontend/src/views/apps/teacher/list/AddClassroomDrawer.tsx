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

interface SidebarAddClassroomType {
  open: boolean;
  toggle: () => void;
  onSubmitted: (event: any, value: any) => void;
  defaultValues: any;
  data: any;
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
        <form onSubmit={(event) => onSubmitted(event, values)}>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <Autocomplete
              id='checkboxes-tags-classroom'
              multiple
              limitTags={15}
              defaultValue={defaultValues}
              options={data}
              onChange={(_, newValue: any) => onHandleChange(_, newValue)}
              getOptionLabel={(option: any) => option?.name ?? ''}
              isOptionEqualToValue={(option: any, value: any) => option.name === value.name}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                  {option.name}
                </li>
              )}
              renderInput={(params) => {
                const { InputProps, InputLabelProps, ...otherParams } = params;
                return (
                  <TextField
                    error={isEmpty(values) && loading}
                    helperText={isEmpty(values) && loading ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
                    {...otherParams}
                    label='ระดับชั้น'
                    placeholder='เลือกระดับชั้น'
                    slotProps={{
                      input: {
                        ...InputProps,
                        ref: undefined,
                      },
                      inputLabel: {
                        ...InputLabelProps,
                        shrink: true,
                      },
                    }}
                  />
                );
              }}
              groupBy={(option: any) => option.department?.name}
              noOptionsText='ไม่พบข้อมูล'
            />
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button disabled={!enable} size='large' type='submit' variant='contained' sx={{ mr: 3 }}>
              บันทึกข้อมูล
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default SidebarAddClassroom;
