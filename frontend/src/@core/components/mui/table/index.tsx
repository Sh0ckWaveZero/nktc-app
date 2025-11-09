import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  CheckboxProps,
} from '@mui/material';

// Custom Checkbox Icon (Unchecked)
const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: 3,
  width: 16,
  height: 16,
  boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: '#f5f8fa',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: '#ebf1f5',
    ...theme.applyStyles('dark', {
      backgroundColor: '#30404d',
    }),
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(206,217,224,.5)',
    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)',
    }),
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
    backgroundColor: '#394b59',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))',
  }),
}));

// Custom Checkbox Icon (Checked) - Dynamic color based on prop
const BpCheckedIcon = styled(BpIcon)<{ color?: string }>(({ theme, color = 'primary' }) => {
  const getColor = () => {
    const colorMap: Record<string, string> = {
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      warning: theme.palette.warning.main,
      secondary: theme.palette.secondary.main,
      default: '#137cbd',
    };
    return colorMap[color] || theme.palette.primary.main;
  };

  const getHoverColor = () => {
    const colorMap: Record<string, string> = {
      success: theme.palette.success.dark,
      error: theme.palette.error.dark,
      info: theme.palette.info.dark,
      warning: theme.palette.warning.dark,
      secondary: theme.palette.secondary.dark,
      default: '#106ba3',
    };
    return colorMap[color] || theme.palette.primary.dark;
  };

  return {
    backgroundColor: getColor(),
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&::before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
    'input:hover ~ &': {
      backgroundColor: getHoverColor(),
    },
  };
});

// Custom Checkbox Icon (Indeterminate)
const BpIndeterminateIcon = styled(BpIcon)<{ color?: string }>(({ theme, color = 'primary' }) => {
  const getColor = () => {
    const colorMap: Record<string, string> = {
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      warning: theme.palette.warning.main,
      secondary: theme.palette.secondary.main,
      default: '#137cbd',
    };
    return colorMap[color] || theme.palette.primary.main;
  };

  return {
    backgroundColor: getColor(),
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&::before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M4 7h8c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
  };
});

// Custom Checkbox Component
export const CheckboxStyled = ({ color = 'default', ...props }: CheckboxProps) => {
  return (
    <Checkbox
      sx={{
        '&:hover': { bgcolor: 'transparent' },
        padding: '0 0 0 4px',
      }}
      disableRipple
      color={color}
      checkedIcon={<BpCheckedIcon color={color} />}
      icon={<BpIcon />}
      indeterminateIcon={<BpIndeterminateIcon color={color} />}
      {...props}
    />
  );
};

// Styled TableContainer
export const TableContainerCustom = styled(TableContainer)<{ component?: React.ElementType }>(({ theme }) => ({
  flex: 1,
  borderRadius: 0,
  backgroundColor: theme.palette.background.paper,
  overflowX: 'auto',
  border: 'none',
  '& .MuiTable-root': {
    minWidth: 900,
  },
}));

// Styled Table
export const TableCustom = styled(Table)(() => ({
  borderCollapse: 'collapse',
  borderSpacing: 0,
}));

// Styled TableHead
export const TableHeadCustom = styled(TableHead)(() => ({
  display: 'table-header-group',
  borderCollapse: 'collapse',
  borderSpacing: 0,
}));

// Styled TableBody
export const TableBodyCustom = styled(TableBody)(() => ({
  display: 'table-row-group',
  borderCollapse: 'collapse',
  borderSpacing: 0,
}));

// Styled TableRow (Header)
export const TableHeaderRowCustom = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  '& .MuiTableCell-root': {
    backgroundColor: 'transparent',
  },
}));

// Styled TableRow (Data)
export const TableRowCustom = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== 'isInternship',
})<{ isInternship?: boolean }>(({ theme, isInternship }) => ({
  height: 28,
  backgroundColor: 'transparent',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
    '& .MuiTableCell-root': {
      backgroundColor: 'transparent',
    },
  },
}));

// Styled TableCell (Header)
export const TableCellHeaderCustom = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: theme.palette.text.primary,
  borderBottom: 'none',
  height: '64px',
  padding: '12px 16px',
}));

// Styled TableCell (Data)
export const TableCellCustom = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isLastRow',
})<{ isLastRow?: boolean }>(({ theme, isLastRow }) => ({
  border: 'none',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: `1px dashed ${theme.palette.divider}`,
  padding: '4px 16px',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.43,
  ...(isLastRow && {
    borderBottom: 'none',
  }),
}));

// Styled TablePagination
export const TablePaginationCustom = styled(TablePagination)<{ component?: React.ElementType }>(({ theme }) => ({
  borderTop: 'none',
  borderTopColor: 'transparent',
  backgroundColor: theme.palette.background.paper,
  minHeight: '64px',
  width: '100%',
  overflow: 'auto',
  boxSizing: 'inherit',
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  '& .MuiTablePagination-root': {
    fontSize: '0.875rem',
    width: '100%',
    overflow: 'auto',
    boxSizing: 'inherit',
    color: theme.palette.text.primary,
  },
  '& .MuiTablePagination-selectLabel': {
    fontSize: '0.875rem',
  },
  '& .MuiTablePagination-displayedRows': {
    fontSize: '0.875rem',
  },
  '& .MuiTablePagination-select': {
    fontSize: '0.875rem',
  },
}));

