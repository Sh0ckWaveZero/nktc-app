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
  Collapse,
  Box,
  IconButton,
} from '@mui/material';
import { isEmpty } from '@/@core/utils/utils';
import { Fragment, useId, useState } from 'react';
import Icon from '@/@core/components/icon';

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
  internship: number;
  internshipPercent: number;
  total: number;
}

interface Header {
  key: string;
  name: string;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
}

type StudentAttendance = 'present' | 'absent' | 'leave' | 'late' | 'internship';

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
  { name: 'ห้องเรียน', key: 'ห้องเรียน', align: 'left' },
  { name: 'มาเรียน', key: 'มาเรียน', align: 'right' },
  { name: 'มาเรียน(%)', key: 'มาเรียน(%)', align: 'right' },
  { name: 'ขาดเรียน', key: 'ขาดเรียน', align: 'right' },
  { name: 'ขาดเรียน(%)', key: 'ขาดเรียน(%)', align: 'right' },
  { name: 'ลา', key: 'ลา', align: 'right' },
  { name: 'ลา(%)', key: 'ลา(%)', align: 'right' },
  { name: 'มาสาย', key: 'มาสาย', align: 'right' },
  { name: 'มาสาย(%)', key: 'มาสาย(%)', align: 'right' },
  { name: 'ฝึกงาน', key: 'ฝึกงาน', align: 'right' },
  { name: 'ฝึกงาน(%)', key: 'ฝึกงาน(%)', align: 'right' },
  { name: 'รวมทั้งหมด', key: 'รวมทั้งหมด', align: 'right' },
];

const subtotal = (items: readonly Row[], level: string) => {
  return items
    .filter((item: any) => item?.level?.levelName === level)
    .map(({ total }) => total)
    .reduce((sum, i) => sum + i, 0);
};

const sumByProperty = (items: readonly Row[], level: string, property: StudentAttendance) => {
  const filteredItems = items.filter((item: any) => item?.level?.levelName === level);
  const values = filteredItems.map((item: any) => item[property]);
  return values.reduce((sum, value) => sum + value, 0);
};

const subPresent = (items: readonly Row[], level: string) => sumByProperty(items, level, 'present');
const subAbsent = (items: readonly Row[], level: string) => sumByProperty(items, level, 'absent');
const subLeave = (items: readonly Row[], level: string) => sumByProperty(items, level, 'leave');
const subLate = (items: readonly Row[], level: string) => sumByProperty(items, level, 'late');
const subInternship = (items: readonly Row[], level: string) => sumByProperty(items, level, 'internship');

interface TableHeaderProps {
  values: any[];
}

const RowDaily = (prop: any) => {
  const { values, levelRow } = prop;

  // ** Hook
  const theme = useTheme();
  const id = useId();

  // ** State
  const [open, setOpen] = useState<boolean>(false);

  const tableSubTotal = (level: string) => subtotal(values, level);
  const tableSubPercent = (value: number, level: string) => (value / (tableSubTotal(level) * values.length)) * 100;
  const presentPercentSubTotal = (level: string) =>
    ccyFormat(tableSubPercent(sumByProperty(values, level, 'present'), level));
  const absentPercentSubTotal = (level: string) =>
    ccyFormat(tableSubPercent(sumByProperty(values, level, 'absent'), level));
  const leavePercentSubTotal = (level: string) =>
    ccyFormat(tableSubPercent(sumByProperty(values, level, 'leave'), level));
  const latePercentSubTotal = (level: string) =>
    ccyFormat(tableSubPercent(sumByProperty(values, level, 'late'), level));
  const internshipPercentSubTotal = (level: string) =>
    ccyFormat(tableSubPercent(sumByProperty(values, level, 'internship'), level));

  return (
    <Fragment key={levelRow}>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
          </IconButton>
        </TableCell>
        <TableCell component='th' scope='row'>
          {levelRow}
        </TableCell>
        <TableCell align='right'>{subPresent(values, levelRow)}</TableCell>
        <TableCell align='right'>{presentPercentSubTotal(levelRow)}</TableCell>
        <TableCell align='right'>{subAbsent(values, levelRow)}</TableCell>
        <TableCell align='right'>{absentPercentSubTotal(levelRow)}</TableCell>
        <TableCell align='right'>{subLeave(values, levelRow)}</TableCell>
        <TableCell align='right'>{leavePercentSubTotal(levelRow)}</TableCell>
        <TableCell align='right'>{subLate(values, levelRow)}</TableCell>
        <TableCell align='right'>{latePercentSubTotal(levelRow)}</TableCell>
        <TableCell align='right'>{subInternship(values, levelRow)}</TableCell>
        <TableCell align='right'>{internshipPercentSubTotal(levelRow)}</TableCell>
        <TableCell align='right'>{tableSubTotal(levelRow)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={13} sx={{ py: '0 !important' }}>
          <Collapse id={levelRow} in={open} timeout='auto' unmountOnExit>
            <Box sx={{ m: 2 }}>
              <Typography variant='h6' gutterBottom component='div'>
                {levelRow}
              </Typography>
              <Table size='medium' aria-label='purchases'>
                <TableHead>
                  <TableRow key={id}>
                    {header.map((item) => (
                      <TableCell key={item.key} align={item.align}>
                        {item.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {values
                    .filter((item: any) => item?.level?.levelName === levelRow)
                    .map((row: any) => (
                      <StyledTableRow hover key={row.id}>
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
                          <TableCellText sx={{ color: theme.palette.error.dark }}>
                            {ccyFormat(row.absentPercent)}
                          </TableCellText>
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
                          <TableCellText sx={{ color: theme.palette.warning.dark }}>
                            {ccyFormat(row.latePercent)}
                          </TableCellText>
                        </StyledTableCell>
                        <StyledTableCell align='right'>
                          <TableCellText>{row.internship}</TableCellText>
                        </StyledTableCell>
                        <StyledTableCell align='right'>
                          <TableCellText>{ccyFormat(row.internshipPercent)}</TableCellText>
                        </StyledTableCell>
                        <StyledTableCell
                          align='right'
                          sx={{
                            bgcolor: row.total > 0 ? theme.palette.success.main : theme.palette.background.default,
                          }}
                        >
                          <TableCellText
                            sx={{
                              color: row.total > 0 ? theme.palette.common.white : theme.palette.info.dark,
                            }}
                          >
                            {row.total}
                          </TableCellText>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

const TableCollapsible = (prop: TableHeaderProps) => {
  const { values } = prop;
  const levelRows = ['ปวช.', 'ปวส.'];

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} size='medium' aria-label='admin check-in daily report'>
        <TableHead>
          <TableRow>
            <TableCell />
            {header.map((item) => (
              <TableCell key={item.key} align={item.align}>
                {item.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {levelRows.map((levelRow) => (
            <RowDaily key={levelRow} values={values} levelRow={levelRow} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableCollapsible;
