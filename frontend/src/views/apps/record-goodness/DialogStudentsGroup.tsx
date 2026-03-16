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
              // Handle both API response structure and account structure
              if (option?.fullName) {
                return `${option?.title || ''}${option.fullName}`;
              }
              // Fallback to account structure if exists
              return `${option?.account?.title || ''}${option?.account?.firstName || ''} ${option?.account?.lastName || ''}`;
            }}
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(props: any, option, { selected }) => {
              // Handle both API response structure and account structure
              const displayName = option?.fullName 
                ? `${option?.title || ''}${option.fullName}`
                : `${option?.account?.title || ''}${option?.account?.firstName || ''} ${option?.account?.lastName || ''}`;
              
              return (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{
                      marginRight: 8,
                    }}
                    checked={selected}
                  />
                  {displayName}
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
            groupBy={(option: any) => option?.student?.classroom?.department?.name}
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
