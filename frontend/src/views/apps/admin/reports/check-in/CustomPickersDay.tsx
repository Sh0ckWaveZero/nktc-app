import * as React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

// Dayjs helper functions
const isSameDay = (date1: Dayjs, date2: Dayjs): boolean => {
  return date1.isSame(date2, 'day');
};

const getStartOfWeek = (date: Dayjs): Dayjs => {
  return date.startOf('week').add(1, 'day'); // Monday as first day
};

const getEndOfWeek = (date: Dayjs): Dayjs => {
  return date.endOf('week').subtract(1, 'day'); // Friday as last day
};

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
  ...(dayIsBetween && {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(isFirstDay && {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  }),
  ...(isLastDay && {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  }),
})) as React.ComponentType<CustomPickerDayProps>;

interface TableHeaderProps {
  selectedDate: Dayjs | null;
  handleSelectedDate: (newDate: Dayjs | null) => any;
}

export default function CustomDay(props: TableHeaderProps) {
  // ** Props
  const { selectedDate, handleSelectedDate } = props;

  const renderWeekPickerDay = (pickersDayProps: PickersDayProps<Dayjs>) => {
    const { day, ...other } = pickersDayProps;

    if (!selectedDate) {
      return <PickersDay {...pickersDayProps} />;
    }

    const start = getStartOfWeek(selectedDate);
    const end = getEndOfWeek(selectedDate);
    const dayIsBetween = day.isBetween(start, end, 'day', '[]');
    const isFirstDay = isSameDay(day, start);
    const isLastDay = isSameDay(day, end);

    return (
      <CustomPickersDay
        {...other}
        day={day}
        disableMargin
        dayIsBetween={dayIsBetween}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    );
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale='th'
    >
      <DatePicker<Dayjs>
        label='เลือกสัปดาห์'
        value={selectedDate}
        onChange={(newValue) => handleSelectedDate(newValue)}
        slots={{
          day: renderWeekPickerDay,
          textField: TextField
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: 'วัน เดือน ปี',
          }
        }}
        format='DD/MM/YYYY'
      />
    </LocalizationProvider>
  );
}
