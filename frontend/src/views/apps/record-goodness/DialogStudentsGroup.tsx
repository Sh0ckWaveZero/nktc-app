import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  styled,
} from '@mui/material';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

import CloseIcon from '@mui/icons-material/Close';
import Icon from '@/@core/components/icon';
import React, { ChangeEvent } from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(5),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3),
  },
}));

const icon = <MdCheckBoxOutlineBlank />;
const checkedIcon = <MdCheckBox />;

interface Student {
  id: string;
  studentId: string;
  fullName?: string;
  title?: string;
  account?: {
    title?: string;
    firstName?: string;
    lastName?: string;
  };
  [key: string]: any;
}

type Props = {
  handleCloseSelectStudents: () => void;
  onAddStudents: () => void;
  onSearchStudents: (event: ChangeEvent<any>, value: any, reason: any) => void;
  onSelectStudents: (event: ChangeEvent<any>, value: any) => void;
  openSelectStudents: boolean;
  studentLoading: boolean;
  studentsList: Student[];
};

// Server-side filtering - return all options from API without additional filtering
const filterOptions = (options: any[]) => options;

function getStudentDisplayName(option: any): string {
  // Structure from account nested: { account: { title, firstName, lastName } }
  const account = option?.user?.account || option?.account;
  if (account) {
    const { title = '', firstName = '', lastName = '' } = account;
    const label = `${title} ${firstName} ${lastName}`.trim();
    if (label) return label;
  }
  // Structure from /students/list: { fullName, title }
  if (option?.fullName) {
    return `${option.title || ''} ${option.fullName}`.trim();
  }
  return option?.studentId || option?.id || '';
}


function DialogStudentGroup({
  handleCloseSelectStudents,
  onAddStudents,
  onSearchStudents,
  onSelectStudents,
  openSelectStudents,
  studentLoading,
  studentsList,
}: Props) {
  return (
    <BootstrapDialog
      onClose={handleCloseSelectStudents}
      aria-labelledby='บรรทึกความดี'
      open={openSelectStudents}
      fullWidth
      maxWidth={'sm'}
    >
      {handleCloseSelectStudents ? (
        <IconButton
          aria-label='close'
          onClick={handleCloseSelectStudents}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
      <DialogTitle id='บรรทึกความดี'>เพิ่มรายชื่อนักเรียน</DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth
          sx={{
            my: 2,
          }}
        >
          <Autocomplete
            id='checkboxes-tags-classroom'
            multiple
            disableCloseOnSelect
            limitTags={20}
            options={Array.isArray(studentsList) ? studentsList : []}
            onChange={onSelectStudents}
            onInputChange={onSearchStudents}
            loading={studentLoading}
            filterOptions={filterOptions}
            getOptionLabel={(option: any) => {
              if (typeof option === 'string') return option;
              return getStudentDisplayName(option);
            }}
            isOptionEqualToValue={(option: any, value: any) => {
              if (typeof option === 'string' || typeof value === 'string') {
                return option === value;
              }
              return (option?.id && option.id === value?.id) || (option?.studentId && option.studentId === value?.studentId);
            }}
            renderOption={(props: any, option: any, { selected }) => {
              const { key, ...optionProps } = props;
              const uniqueKey = key ?? option.id ?? option.studentId;
              return (
                <li key={uniqueKey} {...optionProps}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{
                      marginRight: 8,
                    }}
                    checked={selected}
                  />
                  {getStudentDisplayName(option)}
                </li>
              );
            }}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label='รายชื่อนักเรียน'
                placeholder='เพิ่มรายชื่อนักเรียน'
                slotProps={{
                  input: {
                    ...params.InputProps,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}
            noOptionsText='ไม่พบข้อมูล'
          />
        </FormControl>
      </DialogContent>
      <DialogActions
        sx={{
          my: 2,
        }}
      >
        <Tooltip title='เพิ่มรายชื่อนักเรียนสำหรับแสดงในตาราง' arrow>
          <span>
            <Button
              fullWidth
              size='medium'
              color='primary'
              variant='contained'
              startIcon={<Icon icon='fluent:people-community-add-20-filled' />}
              onClick={onAddStudents}
            >
              เพิ่มรายชื่อ
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </BootstrapDialog>
  );
}

export default DialogStudentGroup;
