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

import { memo, type Ref, type RefObject } from 'react';

interface Props {
  value: any;
  classroom: any;
  ref?: RefObject<HTMLDivElement | null>;
}

// Hoisted static JSX — avoids re-creation on every render
const tableHead = (
  <TableHead>
    <TableRow>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        รหัสนักเรียน
      </TableCell>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        ชื่อ-นามสกุล
      </TableCell>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        เข้าร่วม
      </TableCell>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        เข้าร่วม(%)
      </TableCell>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        ไม่เข้าร่วม
      </TableCell>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        ไม่เข้าร่วม(%)
      </TableCell>
      <TableCell align='center' sx={{ fontSize: 8 }}>
        รวมทั้งหมด
      </TableCell>
    </TableRow>
  </TableHead>
);

const PrintSummaryReport = memo(({ value, classroom, ref }: Props) => {
  return (
    <Container ref={ref as Ref<HTMLDivElement>} sx={{ pt: 8, pb: 8 }}>
      <Typography
        variant='h6'
        component='h6'
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
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
          {tableHead}
          <TableBody>
            {(Array.isArray(value) ? value : []).map((row: any) => (
              <TableRow
                key={row.student.studentId}
                sx={{ fontSize: 8, '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  align='center'
                  component='th'
                  scope='row'
                  sx={{ fontSize: 8, fontWeight: 400 }}
                >
                  {row.student.studentId}
                </TableCell>
                <TableCell
                  align='left'
                  sx={{ fontSize: 8, fontWeight: 400 }}
                >{`${row?.account.title}${row?.account?.firstName} ${row?.account?.lastName}`}</TableCell>
                <TableCell align='center' sx={{ fontSize: 8, color: 'success.dark' }}>
                  {row.present}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontWeight: 400 }}>
                  {isNaN(row?.presentPercent) ? '0.00' : row?.presentPercent}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontWeight: 400 }}>
                  {row.absent}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontWeight: 400 }}>
                  {isNaN(row?.absentPercent) ? '0.00' : row?.absentPercent}
                </TableCell>
                <TableCell align='center' sx={{ fontSize: 8, fontWeight: 400 }}>
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
