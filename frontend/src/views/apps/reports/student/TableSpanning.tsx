import {
  AccountCancelOutline,
  AccountCheckOutline,
  AccountClockOutline,
  AccountFilterOutline,
  AccountLockOutline,
} from 'mdi-material-ui';

import CustomChip from '@/@core/components/mui/chip';
// ** MUI Imports
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
interface PropsType {
  value: any;
}

const checkInLabel: any = {
  Present: 'มาเรียน',
  Absent: 'ขาดเรียน',
  Late: 'สาย',
  Leave: 'ลา',
  Internship: 'ฝึกงาน',
};

const checkInStatueIcon: any = {
  Present: <AccountCheckOutline />,
  Absent: <AccountCancelOutline />,
  Late: <AccountClockOutline />,
  Leave: <AccountFilterOutline />,
  Internship: <AccountLockOutline />,
};

const checkInStatueColor: any = {
  Present: 'success',
  Absent: 'error',
  Late: 'warning',
  Leave: 'info',
  Internship: 'secondary',
};

const TableSpanning = ({ value }: PropsType) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label='spanning table'>
        <TableHead>
          <TableRow>
            <TableCell align='center' colSpan={3}>
              วันจันทร์
            </TableCell>
            <TableCell align='center' colSpan={3}>
              วันอังคาร
            </TableCell>
            <TableCell align='center' colSpan={3}>
              วันพุธ
            </TableCell>
            <TableCell align='center' colSpan={3}>
              วันพฤหัสบดี
            </TableCell>
            <TableCell align='center' colSpan={3}>
              วันศุกร์
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {
              // loop object
              Object.keys(value).map((key, index) => {
                return (
                  <TableCell key={index} align='center' colSpan={3}>
                    {new Date(value[key].checkInDay).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                );
              })
            }
          </TableRow>
          <TableRow>
            {Object.keys(value).map((key, index) => {
              const checkIn = checkInLabel[value[key].has] ? checkInLabel[value[key].has] : value[key].has;
              return (
                <TableCell key={index} align='center' colSpan={3}>
                  {checkIn !== '-' ? (
                    <CustomChip
                      icon={checkInStatueIcon[value[key].has]}
                      skin='light'
                      size='small'
                      label={checkIn}
                      color={checkInStatueColor[value[key].has]}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ) : (
                    checkIn
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSpanning;
