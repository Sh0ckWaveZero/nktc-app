import { Dayjs } from 'dayjs';
export type DatePickerProps = {
  label: string;
  value: Dayjs | null;
  onChange: (newDate: Dayjs | null) => any;
};
