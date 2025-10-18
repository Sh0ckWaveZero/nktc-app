import * as React from 'react';
import { styled } from '@mui/material/styles';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { isSameDay, startOfWeek, addDays, isWithinInterval } from 'date-fns';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
// date-fns helper functions
const getStartOfWeek = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday as first day
};

const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  return addDays(start, 4); // Friday (Monday + 4 days)
};

interface CustomPickerDayProps extends PickersDayProps {
  dayIsBetween?: boolean;
  isFirstDay?: boolean;
  isLastDay?: boolean;
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
}));

interface TableHeaderProps {
  selectedDate: Date | null;
  handleSelectedDate: (newDate: Date | null) => any;
}

export default function CustomDay(props: TableHeaderProps) {
  const { selectedDate, handleSelectedDate } = props;

  const renderWeekPickerDay = React.useCallback(
    (pickersDayProps: PickersDayProps) => {
      const { day } = pickersDayProps;

      if (!selectedDate || !day) {
        return <PickersDay {...(pickersDayProps as any)} />;
      }

      // AdapterDateFns should provide Date objects
      // Convert to Date if needed for compatibility
      const dayAsDate = (day as any) instanceof Date ? (day as any as Date) : new Date((day as any).valueOf());

      const start = getStartOfWeek(selectedDate);
      const end = getEndOfWeek(selectedDate);
      const dayIsBetween = isWithinInterval(dayAsDate, { start, end });
      const isFirstDay = isSameDay(dayAsDate, start);
      const isLastDay = isSameDay(dayAsDate, end);

      return (
        <CustomPickersDay
          {...(pickersDayProps as any)}
          disableMargin
          dayIsBetween={dayIsBetween}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
        />
      );
    },
    [selectedDate],
  );

  return (
    <ThaiDatePicker
      label='เลือกสัปดาห์'
      value={selectedDate}
      onChange={(newValue) => handleSelectedDate(newValue as Date | null)}
      slots={{
        day: renderWeekPickerDay as any,
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          placeholder: 'วัน เดือน ปี (พ.ศ.)',
        },
      }}
      format='dd/MM/yyyy'
    />
  );
}
