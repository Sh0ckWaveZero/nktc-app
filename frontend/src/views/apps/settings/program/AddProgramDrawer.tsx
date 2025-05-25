import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from 'mdi-material-ui';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ProgramFormData {
  programId: string;
  name: string;
  description?: string;
  status?: string;
}

interface ProgramType {
  id: string;
  programId: string;
  name: string;
  description?: string;
  levelId?: string;
  departmentId?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  createdBy: string;
  updatedBy: string;
}

interface AddProgramDrawerProps {
  open: boolean;
  toggle: () => void;
  onSubmit: (data: ProgramFormData) => void;
  editData?: ProgramType | null;
}

const schema = yup.object().shape({
  programId: yup.string().required('กรุณากรอกรหัสโปรแกรม'),
  name: yup.string().required('กรุณากรอกชื่อโปรแกรม'),
  description: yup.string(),
  status: yup.string().oneOf(['active', 'inactive']),
});

const AddProgramDrawer = ({ open, toggle, onSubmit, editData }: AddProgramDrawerProps) => {
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ProgramFormData>({
    defaultValues: {
      programId: '',
      name: '',
      description: '',
      status: 'active',
    },
    resolver: yupResolver(schema) as any
  });

  useEffect(() => {
    if (editData) {
      reset({
        programId: editData.programId,
        name: editData.name,
        description: editData.description || '',
        status: editData.status || 'active',
      });
    } else {
      reset({
        programId: '',
        name: '',
        description: '',
        status: 'active',
      });
    }
  }, [editData, reset]);

  const handleFormSubmit = (data: ProgramFormData) => {
    onSubmit(data);
    toggle();
  };

  const handleClose = () => {
    toggle();
    reset();
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
      <Box sx={{ p: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
          <Typography variant='h6'>
            {editData ? 'แก้ไขโปรแกรม' : 'เพิ่มโปรแกรม'}
          </Typography>
          <IconButton size='small' onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit as any)}>
          <Controller
            name='programId'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                fullWidth
                value={value}
                label='รหัสโปรแกรม'
                onChange={onChange}
                placeholder='เช่น P001'
                error={Boolean(errors.programId)}
                sx={{ mb: 5 }}
              />
            )}
          />
          {errors.programId && (
            <FormHelperText sx={{ color: 'error.main', mt: -4, mb: 4 }}>
              {errors.programId.message}
            </FormHelperText>
          )}

          <Controller
            name='name'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                fullWidth
                value={value}
                label='ชื่อโปรแกรม'
                onChange={onChange}
                placeholder='เช่น เทคโนโลยีคอมพิวเตอร์'
                error={Boolean(errors.name)}
                sx={{ mb: 5 }}
              />
            )}
          />
          {errors.name && (
            <FormHelperText sx={{ color: 'error.main', mt: -4, mb: 4 }}>
              {errors.name.message}
            </FormHelperText>
          )}

          <Controller
            name='description'
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextField
                fullWidth
                multiline
                rows={3}
                value={value}
                label='รายละเอียด'
                onChange={onChange}
                placeholder='รายละเอียดของโปรแกรม'
                sx={{ mb: 5 }}
              />
            )}
          />

          <Controller
            name='status'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl fullWidth sx={{ mb: 5 }}>
                <InputLabel id='status-select'>สถานะ</InputLabel>
                <Select
                  value={value}
                  label='สถานะ'
                  onChange={onChange}
                  labelId='status-select'
                >
                  <MenuItem value='active'>ใช้งาน</MenuItem>
                  <MenuItem value='inactive'>ไม่ใช้งาน</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    {errors.status.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
            <Button size='large' type='submit' variant='contained' sx={{ mr: 3 }}>
              บันทึก
            </Button>
            <Button size='large' variant='outlined' color='secondary' onClick={handleClose}>
              ยกเลิก
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default AddProgramDrawer;