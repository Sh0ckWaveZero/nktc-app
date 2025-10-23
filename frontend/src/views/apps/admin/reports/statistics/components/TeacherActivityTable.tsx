'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  TablePagination,
} from '@mui/material';
// Date formatting helper using date-fns
import { formatThaiShortDate } from '@/@core/utils/thai-calendar';

interface TeacherActivityTableProps {
  teachers: Array<{
    id: string;
    teacherId: string;
    teacherName: string;
    checkInCount: number;
    lastCheckInDate: Date | null;
    isActive: boolean;
    department?: string;
    program?: string;
  }>;
}

const TeacherActivityTable = ({ teachers }: TeacherActivityTableProps) => {
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Extract unique departments and programs from teacher data
  const departments = useMemo(() => {
    const depts = new Set(teachers.map((t) => t.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [teachers]);

  const programs = useMemo(() => {
    const progs = new Set(teachers.map((t) => t.program).filter(Boolean));
    return Array.from(progs).sort();
  }, [teachers]);

  // Filter teachers based on all criteria
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        searchText === '' ||
        teacher.teacherId.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.teacherName.toLowerCase().includes(searchText.toLowerCase());

      const matchesDepartment = departmentFilter === 'all' || teacher.department === departmentFilter;

      const matchesProgram = programFilter === 'all' || teacher.program === programFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && teacher.isActive) ||
        (statusFilter === 'inactive' && !teacher.isActive);

      return matchesSearch && matchesDepartment && matchesProgram && matchesStatus;
    });
  }, [teachers, searchText, departmentFilter, programFilter, statusFilter]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const currentPageData = useMemo(() => {
    return filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTeachers, page, rowsPerPage]);

  return (
    <Card>
      <CardHeader
        title='รายละเอียดการใช้งานของครู'
        subheader={`พบทั้งหมด ${filteredTeachers.length} จาก ${teachers.length} คน`}
      />
      <CardContent>
        {/* Filter Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label='ค้นหา'
              placeholder='รหัสหรือชื่อครู'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size='small'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>แผนก</InputLabel>
              <Select value={departmentFilter} label='แผนก' onChange={(e) => setDepartmentFilter(e.target.value)}>
                <MenuItem value='all'>ทั้งหมด</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>สาขาวิชา</InputLabel>
              <Select value={programFilter} label='สาขาวิชา' onChange={(e) => setProgramFilter(e.target.value)}>
                <MenuItem value='all'>ทั้งหมด</MenuItem>
                {programs.map((prog) => (
                  <MenuItem key={prog} value={prog}>
                    {prog}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>สถานะ</InputLabel>
              <Select value={statusFilter} label='สถานะ' onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value='all'>ทั้งหมด</MenuItem>
                <MenuItem value='active'>ใช้งาน</MenuItem>
                <MenuItem value='inactive'>ไม่ได้ใช้งาน</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 900, sm: 650 },
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>รหัสครู</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>ชื่อ-นามสกุล</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>แผนก</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>สาขาวิชา</TableCell>
                <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  จำนวนครั้งที่เช็คชื่อ
                </TableCell>
                <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  เช็คชื่อล่าสุด
                </TableCell>
                <TableCell align='center' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  สถานะ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    <Typography variant='body2' color='text.secondary'>
                      ไม่พบข้อมูล
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((teacher) => (
                  <TableRow
                    key={teacher.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell component='th' scope='row' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {teacher.teacherId}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{teacher.teacherName}</TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {teacher.department || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {teacher.program || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography
                        variant='body2'
                        fontWeight='bold'
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {teacher.checkInCount}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatThaiShortDate(teacher.lastCheckInDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      {teacher.isActive ? (
                        <Chip
                          label='ใช้งาน'
                          color='success'
                          size='small'
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      ) : (
                        <Chip
                          label='ไม่ได้ใช้งาน'
                          color='error'
                          size='small'
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
          count={filteredTeachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage='แสดง:'
          labelDisplayedRows={({ from, to, count }) => {
            return `${from}-${to} จากทั้งหมด ${count}`;
          }}
          sx={{ mt: 2 }}
        />
      </CardContent>
    </Card>
  );
};

export default TeacherActivityTable;
