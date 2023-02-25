import React, { useState } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import th from 'dayjs/locale/th';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePickerProps } from './types';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { FcCalendar } from 'react-icons/fc';
import { IconButton, TextField } from '@mui/material';
import { VscClose } from 'react-icons/vsc';
import { ToolbarBottom } from "../../../styles/libs/react-draft-wysiwyg/index";
dayjs.extend(buddhistEra);

const CustomDatePicker = ({ label, value, onChange }: DatePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={th}>
      <DatePicker
        label={label}
        value={value}
        inputFormat='DD MMMM BBBB'
        minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
        maxDate={dayjs(new Date())}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            inputProps={{
              ...params.inputProps,
              placeholder: 'วัน เดือน ปี',
            }}
          />
        )}
        components={{
          OpenPickerIcon: () => <FcCalendar />
        }}
        disableMaskedInput
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
