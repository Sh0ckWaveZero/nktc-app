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

type Props = {
  handleCloseSelectStudents: () => void;
  onAddStudents: () => void;
  onSearchStudents: (event: ChangeEvent<any>, value: any, reason: any) => void;
  onSelectStudents: (event: ChangeEvent<any>, value: any) => void;
  openSelectStudents: boolean;
  studentLoading: boolean;
  studentsList: any;
};

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
            limitTags={20}
            options={studentsList}
            onChange={onSelectStudents}
            onInputChange={onSearchStudents}
            loading={studentLoading}
            getOptionLabel={(option: any) => `${option?.title}${option?.fullName} `}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            renderOption={(props: any, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{
                    marginRight: 8,
                  }}
                  checked={selected}
                />
                {`${option?.title}${option?.fullName} `}
              </li>
            )}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label='รายชื่อนักเรียน'
                placeholder='เพิ่มรายชื่อนักเรียน'
                slotProps={{
                  input: {
                    ref: undefined,
                  },
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            )}
            groupBy={(option: any) => option.department?.name}
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
