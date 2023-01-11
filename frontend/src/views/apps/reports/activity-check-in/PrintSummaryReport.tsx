// ** MUI Imports
import {
  Container,
  TableContainer,
  TableRow,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';
import { forwardRef } from 'react';

// ** Icons Imports

interface Props {
  value: any;
  classroom: any;
}

const PrintSummaryReport = forwardRef((props: Props, ref: any) => {
  // ** Props
  const { value, classroom } = props;
  return (
    <Container ref={ref} sx={{ pt: 8, fontFamily: 'Sarabun', pb: 8 }}>
      <Typography
        variant='h6'
        component='h6'
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontFamily: 'Sarabun',
          pb: 3,
        }}
      >
        {`รายงานสรุปการเช็คชื่อ กิจกรรมหน้าเสาธง ชั้น ${classroom || ''}`}
      </Typography>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650, fontWeight: 200, textDecoration: 'none' }}
          size='small'
          aria-label={`รายงานสรุปการเช็คชื่อ กิจกรรมหน้าเสาธง ชั้น ${classroom || ''}`}
        >
          <TableHead>
            <TableRow>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                รหัสนักเรียน
              </TableCell>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                ชื่อ-นามสกุล
              </TableCell>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                เข้าร่วม
              </TableCell>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                เข้าร่วม(%)
              </TableCell>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                ไม่เข้าร่วม
              </TableCell>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                ไม่เข้าร่วม(%)
              </TableCell>
              <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun' }}>
                รวมทั้งหมด
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {value.map((row: any) => (
              <TableRow
                key={row.student.studentId}
                sx={{ fontSize: 8, fontFamily: 'Sarabun', '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  align='center'
                  component='th'
                  scope='row'
                  sx={{ fontSize: 8, fontFamily: 'Sarabun', fontWeight: 400 }}
                >
                  {row.student.studentId}
                </TableCell>
                <TableCell
                  align='left'
                  sx={{ fontSize: 8, fontFamily: 'Sarabun', fontWeight: 400 }}
                >{`${row?.account.title}${row?.account?.firstName} ${row?.account?.lastName}`}</TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun', color: 'success.dark' }}>
                  {row.present}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun', fontWeight: 400 }}>
                  {isNaN(row?.presentPercent) ? '0.00' : row?.presentPercent}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun', fontWeight: 400 }}>
                  {row.absent}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun', fontWeight: 400 }}>
                  {isNaN(row?.absentPercent) ? '0.00' : row?.absentPercent}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontFamily: 'Sarabun', fontWeight: 400 }}>
                  {row.checkInTotal}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
});

export default PrintSummaryReport;
