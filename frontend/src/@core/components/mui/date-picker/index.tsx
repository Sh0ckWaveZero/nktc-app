import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePickerProps } from './types';
import { FcCalendar } from 'react-icons/fc';
import { TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';

// Date helpers using dayjs
const getCurrentYear = (): number => dayjs().year();
const getLastYear = (): number => getCurrentYear() - 1;

const CustomDatePicker = ({ label, value, onChange }: DatePickerProps) => {
  const minDate: Dayjs = dayjs().year(getLastYear()).month(0).date(1);
  const maxDate: Dayjs = dayjs();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='th'>
      <DatePicker<Dayjs>
        label={label}
        value={value}
        format='DD/MM/YYYY'
        minDate={minDate}
        maxDate={maxDate}
        onChange={onChange}
        slots={{
          textField: TextField,
          openPickerIcon: (props) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { ownerState, ...restProps } = props as any;
            return <FcCalendar {...restProps} />;
          },
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: 'วัน เดือน ปี',
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
