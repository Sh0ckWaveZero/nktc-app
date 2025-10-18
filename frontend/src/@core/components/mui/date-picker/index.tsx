import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePickerProps } from './types';
import { FcCalendar } from 'react-icons/fc';
import { TextField } from '@mui/material';
import { th } from 'date-fns/locale';

// Date helpers using Date
const getCurrentYear = (): number => new Date().getFullYear();
const getLastYear = (): number => getCurrentYear() - 1;

const CustomDatePicker = ({ label, value, onChange }: DatePickerProps) => {
  const minDate: Date = new Date(getLastYear(), 0, 1);
  const maxDate: Date = new Date();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns as any} adapterLocale={th}>
      <DatePicker
        label={label}
        value={value}
        format='dd/MM/yyyy'
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
