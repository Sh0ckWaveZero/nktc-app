// ** MUI Imports
import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TypographyProps,
  useTheme,
  TableContainer,
  TableCellProps,
  tableCellClasses,
  TableRowProps,
} from '@mui/material';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';
import { isEmpty } from '@/@core/utils/utils';

interface Row {
  level: string;
  department: string;
  present: number;
  presentPercent: number;
  absent: number;
  absentPercent: number;
  leave: number;
  leavePercent: number;
  late: number;
  latePercent: number;
  total: number;
}

interface Header {
  key: string;
  name: string;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
}

const ccyFormat = (num: number) => {
  return `${isNaN(num) || isEmpty(num) ? '0.00' : num.toFixed(2)}`;
};

const TableCellText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 400,
  textDecoration: 'none',
  ...theme.typography.subtitle2,
}));

const StyledTableCell = styled(TableCell)<TableCellProps>(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)<TableRowProps>(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },

  // hide last border
  '&:last-of-type td, &:last-of-type th': {
    border: 0,
  },
}));

const header: Header[] = [
  { name: 'ระดับชั้น', key: 'ระดับชั้น', align: 'left' },
  { name: 'ห้องเรียน', key: 'ห้องเรียน', align: 'left' },
  { name: 'มาเรียน', key: 'มาเรียน', align: 'right' },
  { name: 'มาเรียน(%)', key: 'มาเรียน(%)', align: 'right' },
  { name: 'ขาดเรียน', key: 'ขาดเรียน', align: 'right' },
  { name: 'ขาดเรียน(%)', key: 'ขาดเรียน(%)', align: 'right' },
  { name: 'ลา', key: 'ลา', align: 'right' },
  { name: 'ลา(%)', key: 'ลา(%)', align: 'right' },
  { name: 'มาสาย', key: 'มาสาย', align: 'right' },
  { name: 'มาสาย(%)', key: 'มาสาย(%)', align: 'right' },
  { name: 'รวมทั้งหมด', key: 'รวมทั้งหมด', align: 'right' },
];

const subtotal = (items: readonly Row[]) => {
  return items.map(({ total }) => total).reduce((sum, i) => sum + i, 0);
};

const subPresent = (items: readonly Row[]) => {
  return items.map(({ present }) => present).reduce((sum, i) => sum + i, 0);
};

const subPresentPercent = (items: readonly Row[]) => {
  return items.map(({ presentPercent }) => presentPercent).reduce((sum, i) => sum + i, 0);
};

const subAbsent = (items: readonly Row[]) => {
  return items.map(({ absent }) => absent).reduce((sum, i) => sum + i, 0);
};

const subAbsentPercent = (items: readonly Row[]) => {
  return items.map(({ absentPercent }) => absentPercent).reduce((sum, i) => sum + i, 0);
};

const subLeave = (items: readonly Row[]) => {
  return items.map(({ leave }) => leave).reduce((sum, i) => sum + i, 0);
};

const subLeavePercent = (items: readonly Row[]) => {
  return items.map(({ leavePercent }) => leavePercent).reduce((sum, i) => sum + i, 0);
};

const subLate = (items: readonly Row[]) => {
  return items.map(({ late }) => late).reduce((sum, i) => sum + i, 0);
};

const subLatePercent = (items: readonly Row[]) => {
  return items.map(({ latePercent }) => latePercent).reduce((sum, i) => sum + i, 0);
};

interface TableHeaderProps {
  values: any[];
}

const TableDaily = (prop: TableHeaderProps) => {
  const { values } = prop;

  // ** Hook
  const theme = useTheme();

  const tableSubTotal = subtotal(values);
  const tableSubPercent = (value: number) => (value / (tableSubTotal * values.length)) * 100;
  const presentPercentSubTotal = ccyFormat(tableSubPercent(subPresentPercent(values)));
  const absentPercentSubTotal = ccyFormat(tableSubPercent(subAbsentPercent(values)));
  const leavePercentSubTotal = ccyFormat(tableSubPercent(subLeavePercent(values)));
  const latePercentSubTotal = ccyFormat(tableSubPercent(subLatePercent(values)));

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} size='medium' aria-label='admin check-in daily report'>
        <TableHead>
          <TableRow>
            {header.map((item) => (
              <TableCell key={item.key} align={item.align}>
                {item.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {values.map((row: any) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell>{row?.level?.levelName}</StyledTableCell>
              <StyledTableCell>{row.name}</StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.success.dark }}>{row.present}</TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.success.dark }}>
                  {ccyFormat(row.presentPercent)}
                </TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.error.dark }}>{row.absent}</TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.error.dark }}>{ccyFormat(row.absentPercent)}</TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.secondary.dark }}>{row.leave}</TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.secondary.dark }}>
                  {ccyFormat(row.leavePercent)}
                </TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.warning.dark }}>{row.late}</TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.warning.dark }}>{ccyFormat(row.latePercent)}</TableCellText>
              </StyledTableCell>
              <StyledTableCell align='right'>
                <TableCellText sx={{ color: theme.palette.info.dark }}>{row.total}</TableCellText>
              </StyledTableCell>
            </StyledTableRow>
          ))}
          <TableRow sx={{ backgroundColor: hexToRGBA(theme.palette.info.main, 0.25) }}>
            <TableCell colSpan={2}>รวม</TableCell>
            <TableCell align='right'>{subPresent(values)}</TableCell>
            <TableCell align='right'>{presentPercentSubTotal}</TableCell>
            <TableCell align='right'>{subAbsent(values)}</TableCell>
            <TableCell align='right'>{absentPercentSubTotal}</TableCell>
            <TableCell align='right'>{subLeave(values)}</TableCell>
            <TableCell align='right'>{leavePercentSubTotal}</TableCell>
            <TableCell align='right'>{subLate(values)}</TableCell>
            <TableCell align='right'>{latePercentSubTotal}</TableCell>
            <TableCell align='right'>{tableSubTotal}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableDaily;
