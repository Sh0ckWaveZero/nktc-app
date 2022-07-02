// ** React Imports
import { useState, ChangeEvent } from 'react';

// ** MUI Imports
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

interface Column {
  id: 'no' | 'username' | 'fullName' | 'teacher' | 'teachingHours' | 'summaryLogin' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'no', label: 'ลำดับที่', minWidth: 60 },
  { id: 'username', label: 'ชื่อผู้ใช้งาน', minWidth: 100 },
  {
    id: 'fullName',
    label: 'ชื่อ-นามสกุล',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US')
  },
  {
    id: 'teacher',
    label: 'ครูผู้สอน',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US')
  },
  {
    id: 'teachingHours',
    label: 'จำนวนชั่วโมงการเข้าสอน',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toFixed(2)
  },
  {
    id: 'summaryLogin',
    label: 'จำนวนครั้งที่เข้าสู่ระบบ',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toFixed(2)
  },
  {
    id: 'actions',
    label: 'การดำเนินการ',
    minWidth: 170,
    align: 'right',
    format: (value: any) => value.toString()
  }
];

interface Data {
  no: number;
  username: string;
  fullName: string;
  teacher: string;
  teachingHours: number;
  summaryLogin: number;
  actions: object;
}

function createData(
  no: number,
  username: string,
  fullName: string,
  teacher: string,
  teachingHours: number,
  summaryLogin: number,
  actions: object
): Data {
  return { no, username, fullName, teacher, teachingHours, summaryLogin, actions };
}

const rows = [
  createData(1, 'sombut001', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(2, 'sombut002', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(3, 'sombut003', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(4, 'sombut004', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(5, 'sombut005', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(6, 'sombut006', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(7, 'sombut007', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(8, 'sombut008', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(9, 'sombut009', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' }),
  createData(10, 'sombut010', 'นายสมชาย สมบัติ', 'ครูผู้สอน', 10, 10, { edit: 'edit', delete: 'delete' })
];

const TableMainTeacher = () => {
  // ** States
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 560 }}>
        <Table stickyHeader aria-label='sticky table'>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.id} align={column.align} sx={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
              return (
                <TableRow hover role='checkbox' tabIndex={-1} key={row.no}>
                  {columns.map(column => {
                    const value = row[column.id];

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value.toString()}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component='div'
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TableMainTeacher;
