// ** React Imports
import { useState, useMemo, useEffect, useCallback, memo } from 'react';

// ** MUI Imports
import {
  Drawer,
  Typography,
  FormControl,
  TextField,
  Box,
  Autocomplete,
  Checkbox,
  CircularProgress,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BoxProps } from '@mui/material/Box';

// ** Icons Imports
import Close from 'mdi-material-ui/Close';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

// ** Utils
import { isEmpty } from '@/@core/utils/utils';
import { Classroom } from '@/types/apps/teacherTypes';

// ** React Query
import { useClassrooms } from '@/hooks/queries/useClassrooms';

interface SidebarAddClassroomType {
  open: boolean;
  toggle: () => void;
  onSubmitted: (event: any, value: any) => void;
  defaultValues: Classroom[];
  isSubmitting?: boolean;
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

// Memoize icons to prevent recreation
const icon = <MdCheckBoxOutlineBlank />;
const checkedIcon = <MdCheckBox />;

// Loading fallback component - memoized to prevent unnecessary re-renders
const LoadingFallback = memo(() => (
  <Box
    id='classroom-loading-fallback'
    sx={{ p: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
  >
    <CircularProgress id='classroom-loading-spinner' />
    <Typography id='classroom-loading-text' sx={{ ml: 2 }}>
      กำลังโหลดข้อมูล...
    </Typography>
  </Box>
));

LoadingFallback.displayName = 'LoadingFallback';

// Helper function to normalize classrooms data - extracted outside component
const normalizeClassroomsData = (classroomsData: unknown): Classroom[] => {
  if (!classroomsData) return [];
  if (Array.isArray(classroomsData)) {
    return classroomsData;
  }
  if (
    classroomsData &&
    typeof classroomsData === 'object' &&
    'data' in classroomsData &&
    Array.isArray(classroomsData.data)
  ) {
    return classroomsData.data;
  }
  return [];
};

// Helper function to get option label - extracted outside component
const getOptionLabel = (option: Classroom | null): string => {
  if (!option) return '';
  return option?.name || 'ไม่มีชื่อ';
};

// Helper function to compare options - extracted outside component
const isOptionEqualToValue = (option: Classroom, value: Classroom): boolean => {
  const optionId = option.id || option.classroomId;
  const valueId = value.id || value.classroomId;
  return optionId === valueId;
};

// Helper function to group by department - extracted outside component
const groupByDepartment = (option: Classroom): string => {
  return option.department?.name || 'ไม่ระบุแผนก';
};

// Inner component that uses useQuery
const AddClassroomForm = memo(
  ({
    onSubmitted,
    defaultValues,
    isSubmitting = false,
  }: {
    onSubmitted: (event: any, value: any) => void;
    defaultValues: Classroom[];
    isSubmitting?: boolean;
  }) => {
    // Use custom hook following project structure
    const { data: classroomsData, isLoading } = useClassrooms();

    // All hooks must be called before any conditional returns
    const [values, setValues] = useState<Classroom[]>(defaultValues || []);

    // Reset values when defaultValues change
    // Using JSON.stringify for deep comparison to prevent unnecessary updates when array reference changes but content is the same
    const defaultValuesKey = useMemo(() => JSON.stringify(defaultValues), [defaultValues]);

    useEffect(() => {
      setValues(defaultValues || []);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValuesKey]);

    // Ensure classrooms is always an array - memoized
    const classrooms = useMemo(() => normalizeClassroomsData(classroomsData), [classroomsData]);

    // Memoize enable state computation
    const enable = useMemo(() => !isEmpty(values), [values]);

    // Memoize change handler to prevent unnecessary re-renders
    const onHandleChange = useCallback(
      (_event: unknown, newValue: Classroom[]) => {
        setValues(newValue);
      },
      []
    );

    // Memoize form submit handler
    const handleSubmit = useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmitted(event, values);
      },
      [onSubmitted, values]
    );

    // Memoize render option function to prevent recreation on every render
    const renderOption = useCallback(
      (props: React.HTMLAttributes<HTMLLIElement> & { key?: string }, option: Classroom, { selected }: { selected: boolean }) => {
        const { key, ...otherProps } = props;
        const optionId = option.id || option.classroomId || key || '';
        return (
          <li key={key} id={`classroom-option-${optionId}`} {...otherProps}>
            <Checkbox
              id={`classroom-checkbox-${optionId}`}
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            <Typography id={`classroom-name-${optionId}`} variant='body2' sx={{ fontWeight: 500 }}>
              {option.name}
            </Typography>
          </li>
        );
      },
      []
    );

    // Memoize render input function
    const renderInput = useCallback(
      (params: any) => (
        <TextField
          {...params}
          id='classroom-autocomplete-input'
          error={isEmpty(values)}
          helperText={isEmpty(values) ? 'กรุณาเลือกห้องที่ปรึกษา' : ''}
          label='ห้องที่ปรึกษา'
          placeholder='เลือกห้องที่ปรึกษา'
        />
      ),
      [values]
    );

    // Show loading state after all hooks are called
    if (isLoading) {
      return <LoadingFallback />;
    }

    return (
      <form id='add-classroom-form' onSubmit={handleSubmit}>
        <FormControl id='classroom-form-control' fullWidth sx={{ mb: 6 }}>
          <Autocomplete
            id='checkboxes-tags-classroom'
            multiple
            limitTags={15}
            value={values}
            options={classrooms}
            onChange={onHandleChange}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            renderOption={renderOption}
            renderInput={renderInput}
            forcePopupIcon={true}
            groupBy={groupByDepartment}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
        <Box id='classroom-form-actions' sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            id='submit-classroom-button'
            disabled={!enable || isSubmitting}
            size='large'
            type='submit'
            variant='contained'
            startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : null}
            sx={{ mr: 3 }}
          >
            บันทึกข้อมูล
          </Button>
        </Box>
      </form>
    );
  }
);

AddClassroomForm.displayName = 'AddClassroomForm';

// Main component - memoized to prevent unnecessary re-renders
const SidebarAddClassroom = memo((props: SidebarAddClassroomType) => {
  const { open, toggle, onSubmitted, defaultValues, isSubmitting = false } = props;

  // Memoize close handler
  const handleClose = useCallback(() => {
    toggle();
  }, [toggle]);

  if (!open) return null;

  return (
    <Drawer
      id='add-classroom-drawer'
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header id='add-classroom-drawer-header'>
        <Typography id='add-classroom-drawer-title' variant='h6'>
          เพิ่มห้องที่ปรึกษา
        </Typography>
        <Close id='add-classroom-drawer-close' fontSize='small' onClick={handleClose} sx={{ cursor: 'pointer' }} />
      </Header>
      <Box id='add-classroom-drawer-content' sx={{ p: 5 }}>
        <AddClassroomForm onSubmitted={onSubmitted} defaultValues={defaultValues} isSubmitting={isSubmitting} />
      </Box>
    </Drawer>
  );
});

SidebarAddClassroom.displayName = 'SidebarAddClassroom';

export default SidebarAddClassroom;
