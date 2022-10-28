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
} from '@mui/material';
import { hexToRGBA } from '@/@core/utils/hex-to-rgba';

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
  return `${isNaN(num) ? '0.00' : num.toFixed(2)}`;
};

const createRow = (
  level: string,
  department: string,
  present: number,
  presentPercent: number,
  absent: number,
  absentPercent: number,
  leave: number,
  leavePercent: number,
  late: number,
  latePercent: number,
  total: number,
): Row => {
  return {
    level,
    department,
    present,
    presentPercent,
    absent,
    absentPercent,
    leave,
    leavePercent,
    late,
    latePercent,
    total,
  };
};

const TableCellText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 400,
  textDecoration: 'none',
  ...theme.typography.subtitle2,
}));

const header: Header[] = [
  { name: 'ระดับชั้น', key: 'ระดับชั้น', align: 'left' },
  { name: 'แผนก', key: 'แผนก', align: 'left' },
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

const rows = [
  createRow('ปวช.1', 'แผนก เทคโนโลยีคอมพิวเตอร์ ', 10, 10, 10, 10, 10, 10, 10, 10, 40),
  createRow('ปวช.1', 'แผนก ช่างไฟฟ้ากำลัง ', 10, 10, 10, 10, 10, 10, 10, 10, 40),
];

const tableSubTotal = subtotal(rows);
const tableSubPercent = (value: number) => (value / tableSubTotal) * 100;
const presentPercentSubTotal = ccyFormat(tableSubPercent(subPresentPercent(rows)));
const absentPercentSubTotal = ccyFormat(tableSubPercent(subAbsentPercent(rows)));
const leavePercentSubTotal = ccyFormat(tableSubPercent(subLeavePercent(rows)));
const latePercentSubTotal = ccyFormat(tableSubPercent(subLatePercent(rows)));

const TableDaily = () => {
  // ** Hook
  const theme = useTheme();

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} size='small' aria-label='admin check-in daily report'>
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
          {rows.map((row) => (
            <TableRow key={row.level + row.department}>
              <TableCell>{row.level}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.success.dark }}>{row.present}</TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.success.dark }}>
                  {ccyFormat(row.presentPercent)}
                </TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.error.dark }}>{row.absent}</TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.error.dark }}>{ccyFormat(row.absentPercent)}</TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.secondary.dark }}>{row.leave}</TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.secondary.dark }}>
                  {ccyFormat(row.leavePercent)}
                </TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.warning.dark }}>{row.late}</TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.warning.dark }}>{ccyFormat(row.latePercent)}</TableCellText>
              </TableCell>
              <TableCell align='right'>
                <TableCellText sx={{ color: theme.palette.info.dark }}>{row.total}</TableCellText>
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: hexToRGBA(theme.palette.info.main, 0.25) }}>
            <TableCell colSpan={2}>รวม</TableCell>
            <TableCell align='right'>{subPresent(rows)}</TableCell>
            <TableCell align='right'>{presentPercentSubTotal}</TableCell>
            <TableCell align='right'>{subAbsent(rows)}</TableCell>
            <TableCell align='right'>{absentPercentSubTotal}</TableCell>
            <TableCell align='right'>{subLeave(rows)}</TableCell>
            <TableCell align='right'>{leavePercentSubTotal}</TableCell>
            <TableCell align='right'>{subLate(rows)}</TableCell>
            <TableCell align='right'>{latePercentSubTotal}</TableCell>
            <TableCell align='right'>{tableSubTotal}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableDaily;
