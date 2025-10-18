export interface ThaiDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (newDate: Date | null) => void;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  slots?: {
    day?: any;
    [key: string]: any;
  };
  slotProps?: {
    textField?: any;
    [key: string]: any;
  };
  [key: string]: any;
}
