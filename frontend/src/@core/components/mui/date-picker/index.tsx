import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { DatePickerProps } from './types';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { FcCalendar } from 'react-icons/fc';
import { TextField } from '@mui/material';
import 'dayjs/locale/th';

dayjs.extend(buddhistEra);

const CustomDatePicker = ({ label, value, onChange }: DatePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <DatePicker
        label={label}
        value={value}
        format='DD MMMM BBBB'
        minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
        maxDate={dayjs(new Date())}
        onChange={onChange}
        slots={{
          textField: TextField,
          openPickerIcon: FcCalendar
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: 'วัน เดือน ปี',
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
