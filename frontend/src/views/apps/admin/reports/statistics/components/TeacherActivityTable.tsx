'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import type { TeacherActivityDetail } from '@/hooks/queries/useStatistics';

const formatThaiDateTime = (value: string | null) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

interface TeacherActivityTableProps {
  teachers: TeacherActivityDetail[];
}

const TeacherActivityTable = ({ teachers }: TeacherActivityTableProps) => {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [program, setProgram] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const departments = useMemo(
    () => Array.from(new Set(teachers.map((teacher) => teacher.department).filter(Boolean) as string[])).sort(),
    [teachers]
  );
  const programs = useMemo(
    () => Array.from(new Set(teachers.map((teacher) => teacher.program).filter(Boolean) as string[])).sort(),
    [teachers]
  );

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        search.trim() === '' ||
        teacher.teacherId.toLowerCase().includes(search.toLowerCase()) ||
        teacher.teacherName.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = department === 'all' || teacher.department === department;
      const matchesProgram = program === 'all' || teacher.program === program;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && teacher.isActive) ||
        (status === 'inactive' && !teacher.isActive);

      return matchesSearch && matchesDepartment && matchesProgram && matchesStatus;
    });
  }, [department, program, search, status, teachers]);

  const currentRows = useMemo(
    () => filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredTeachers, page, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, nextPage: number) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)}`,
      }}
    >
      <CardHeader
        title='กิจกรรมการใช้งานของครู'
        subheader={`พบ ${filteredTeachers.length.toLocaleString()} จาก ${teachers.length.toLocaleString()} คน`}
        slotProps={{
          title: {
            sx: {
              fontWeight: 800,
              letterSpacing: '-0.03em',
            },
          },
          subheader: {
            sx: {
              mt: 0.75,
            },
          },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid
          container
          spacing={2}
          sx={{
            mb: 2.5,
            p: 1.4,
            borderRadius: 2.5,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
          }}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label='ค้นหาครู'
              placeholder='รหัสหรือชื่อครู'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size='small'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2.66 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>แผนก</InputLabel>
              <Select value={department} label='แผนก' onChange={(event) => setDepartment(event.target.value)}>
                <MenuItem value='all'>ทุกแผนก</MenuItem>
                {departments.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2.66 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>สาขา</InputLabel>
              <Select value={program} label='สาขา' onChange={(event) => setProgram(event.target.value)}>
                <MenuItem value='all'>ทุกสาขา</MenuItem>
                {programs.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2.66 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>สถานะ</InputLabel>
              <Select value={status} label='สถานะ' onChange={(event) => setStatus(event.target.value)}>
                <MenuItem value='all'>ทั้งหมด</MenuItem>
                <MenuItem value='active'>มีการใช้งาน</MenuItem>
                <MenuItem value='inactive'>ยังไม่ใช้งาน</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer
          sx={{
            borderRadius: 2.5,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)}`,
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    py: 1.8,
                    fontWeight: 800,
                    color: 'text.primary',
                    borderBottom: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
                  },
                }}
              >
                <TableCell>ครู</TableCell>
                <TableCell>แผนก / สาขา</TableCell>
                <TableCell align='center'>จำนวนครั้ง</TableCell>
                <TableCell align='center'>เช็คชื่อล่าสุด</TableCell>
                <TableCell align='center'>สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
                    <Typography color='text.secondary'>ไม่พบกิจกรรมของครูตามเงื่อนไขที่เลือก</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentRows.map((teacher) => (
                  <TableRow
                    key={teacher.teacherDbId}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.035),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{teacher.teacherName}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {teacher.teacherId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{teacher.department || 'ไม่ระบุแผนก'}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {teacher.program || 'ไม่ระบุสาขา'}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography sx={{ fontWeight: 800 }}>{teacher.checkInCount.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography>{formatThaiDateTime(teacher.lastCheckInDate)}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={teacher.isActive ? 'มีการใช้งาน' : 'ยังไม่ใช้งาน'}
                        color={teacher.isActive ? 'success' : 'default'}
                        size='small'
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={filteredTeachers.length === 0 ? [] : [10, 25, 50]}
          component='div'
          count={filteredTeachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={filteredTeachers.length === 0 ? '' : 'แสดง'}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );
};

export default TeacherActivityTable;
