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
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shallow } from 'zustand/shallow';
import { useLevelStore } from '@/store/apps/level';
import { useDepartmentStore } from '@/store/apps/department';

interface ProgramFormData {
  programId: string;
  name: string;
  description?: string;
  levelId?: string;
  departmentId?: string;
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

const schema = z.object({
  programId: z.string().min(1, 'กรุณากรอกรหัสโปรแกรม'),
  name: z.string().min(1, 'กรุณากรอกชื่อโปรแกรม'),
  description: z.string().optional(),
  levelId: z.string().min(1, 'กรุณาเลือกระดับชั้น'),
  departmentId: z.string().min(1, 'กรุณาเลือกแผนก'),
  status: z.enum(['active', 'inactive']),
});

const AddProgramDrawer = ({ open, toggle, onSubmit, editData }: AddProgramDrawerProps) => {
  const [levelList, setLevelList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);

  const { fetchLevels } = useLevelStore((state) => ({ fetchLevels: state.fetchLevels }), shallow);
  const { fetchDepartment } = useDepartmentStore((state) => ({ fetchDepartment: state.fetchDepartment }), shallow);

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgramFormData>({
    defaultValues: {
      programId: '',
      name: '',
      description: '',
      levelId: '',
      departmentId: '',
      status: 'active',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // ดึงข้อมูลระดับชั้น
    fetchLevels().then((res: any) => {
      if (res && Array.isArray(res)) {
        setLevelList(res || []);
      }
    });

    // ดึงข้อมูลแผนก
    fetchDepartment().then((res: any) => {
      if (res && Array.isArray(res)) {
        setDepartmentList(res || []);
      }
    });
  }, [fetchLevels, fetchDepartment]);

  useEffect(() => {
    if (editData) {
      reset({
        programId: editData.programId,
        name: editData.name,
        description: editData.description || '',
        levelId: editData.levelId || '',
        departmentId: editData.departmentId || '',
        status: editData.status || 'active',
      });
    } else {
      reset({
        programId: '',
        name: '',
        description: '',
        levelId: '',
        departmentId: '',
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
          <Typography variant='h6'>{editData ? 'แก้ไขโปรแกรม' : 'เพิ่มโปรแกรม'}</Typography>
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
            <FormHelperText sx={{ color: 'error.main', mt: -4, mb: 4 }}>{errors.programId.message}</FormHelperText>
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
            <FormHelperText sx={{ color: 'error.main', mt: -4, mb: 4 }}>{errors.name.message}</FormHelperText>
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
            name='levelId'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl fullWidth sx={{ mb: 5 }}>
                <InputLabel id='level-select'>ระดับชั้น</InputLabel>
                <Select
                  value={value}
                  label='ระดับชั้น'
                  onChange={onChange}
                  labelId='level-select'
                  error={Boolean(errors.levelId)}
                >
                  <MenuItem value=''>
                    <em>เลือกระดับชั้น</em>
                  </MenuItem>
                  {levelList.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.levelName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.levelId && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.levelId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name='departmentId'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl fullWidth sx={{ mb: 5 }}>
                <InputLabel id='department-select'>แผนก</InputLabel>
                <Select
                  value={value}
                  label='แผนก'
                  onChange={onChange}
                  labelId='department-select'
                  error={Boolean(errors.departmentId)}
                >
                  <MenuItem value=''>
                    <em>เลือกแผนก</em>
                  </MenuItem>
                  {departmentList.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && (
                  <FormHelperText sx={{ color: 'error.main' }}>{errors.departmentId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name='status'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl fullWidth sx={{ mb: 5 }}>
                <InputLabel id='status-select'>สถานะ</InputLabel>
                <Select value={value} label='สถานะ' onChange={onChange} labelId='status-select'>
                  <MenuItem value='active'>ใช้งาน</MenuItem>
                  <MenuItem value='inactive'>ไม่ใช้งาน</MenuItem>
                </Select>
                {errors.status && <FormHelperText sx={{ color: 'error.main' }}>{errors.status.message}</FormHelperText>}
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
