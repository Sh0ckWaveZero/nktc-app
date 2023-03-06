// ** MUI Imports
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

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
            {
              Object.keys(value).map((key, index) => {
                return (
                  <TableCell key={index} align='center' colSpan={3}>
                    {checkInLabel[value[key].has] || value[key].has}
                  </TableCell>
                );
              })
            }
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSpanning;
