import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

import { DatePickerProps } from './types';
import { FcCalendar } from 'react-icons/fc';
import React from 'react';
import dayjs from 'dayjs';
import newAdapter from 'utils/newAdapter';

const CustomDatePicker = ({ label, value, onChange }: DatePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={newAdapter} adapterLocale={'th'}>
      <DatePicker
        label='วันเกิด'
        format='DD MMMM YYYY'
        value={value}
        disableFuture
        onChange={onChange}
        minDate={dayjs(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))}
        maxDate={dayjs(new Date())}
        slotProps={{
          textField: {
            inputProps: {
              placeholder: 'วัน/เดือน/ปี',
            },
          },
        }}
        slots={{
          openPickerIcon: () => <FcCalendar />,
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
