import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { th } from 'date-fns/locale';
import AdapterDateFns from '@midseelee/date-fns-buddhist-adapter';
import { ThaiDatePickerProps } from './types';

/**
 * Thai DatePicker Component
 * ใช้งาน date-fns กับ Buddhist calendar adapter
 * รองรับการแสดงผลวันที่แบบไทย พ.ศ.
 */
const ThaiDatePicker = ({
  label,
  value,
  onChange,
  format = 'dd/MM/yyyy',
  minDate,
  maxDate,
  placeholder = 'วัน/เดือน/ปี (พ.ศ.)',
  fullWidth = true,
  disabled = false,
  error = false,
  helperText,
  slotProps,
  slots,
  ...props
}: ThaiDatePickerProps) => {
  // Convert value to Date object if it's not null/undefined
  const dateValue = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;
    // Handle string or timestamp
    const converted = new Date(value);
    return isNaN(converted.getTime()) ? null : converted;
  }, [value]);

  // Convert min/max dates to Date objects
  const minDateValue = React.useMemo(() => {
    if (!minDate) return undefined;
    if (minDate instanceof Date) return minDate;
    const converted = new Date(minDate);
    return isNaN(converted.getTime()) ? undefined : converted;
  }, [minDate]);

  const maxDateValue = React.useMemo(() => {
    if (!maxDate) return undefined;
    if (maxDate instanceof Date) return maxDate;
    const converted = new Date(maxDate);
    return isNaN(converted.getTime()) ? undefined : maxDate;
  }, [maxDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns as any} adapterLocale={th}>
      <DatePicker
        label={label}
        value={dateValue as any}
        onChange={(newValue) => onChange(newValue as Date | null)}
        format={format}
        minDate={minDateValue as any}
        maxDate={maxDateValue as any}
        disabled={disabled}
        slots={slots}
        slotProps={{
          textField: {
            fullWidth,
            placeholder,
            error,
            helperText,
            ...slotProps?.textField,
          },
          ...slotProps,
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default ThaiDatePicker;
