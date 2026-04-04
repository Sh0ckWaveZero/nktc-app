import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Pagination,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import Icon from '@/@core/components/icon';

interface BadnessReportMobileViewProps {
  students: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onDetailClick: (info: any) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const BadnessReportMobileView = ({
  students,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onDetailClick,
  onPageChange,
  onPageSizeChange,
}: BadnessReportMobileViewProps) => {
  return (
    <Box id='badness-report-mobile-view-section' sx={{ px: { xs: 4, sm: 6 }, py: { xs: 4, sm: 6 } }}>
      <Stack id='badness-report-mobile-cards' spacing={3}>
        {students.map((student: any, index: number) => (
          <Card
            key={student.id || student.studentId || index}
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              overflow: 'hidden',
              '&:hover': {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Student Info Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Icon icon='mdi:account' fontSize='1.5rem' color='primary.main' />
                  <Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {student.fullName}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {student.studentId}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Details Table */}
              <TableContainer>
                <Table size='small'>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: 'none',
                          pb: 1,
                          pl: 0,
                          verticalAlign: 'top',
                          width: '40%',
                        }}
                      >
                        <Typography variant='body2' color='text.secondary'>
                          ชั้นเรียน
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 'none', pb: 1, pl: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {student.name}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          border: 'none',
                          pb: 1,
                          pl: 0,
                          verticalAlign: 'top',
                        }}
                      >
                        <Typography variant='body2' color='text.secondary'>
                          คะแนนรวม
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 'none', pb: 1, pl: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, color: 'error.main' }}>
                          {student.badnessScore}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Detail Button */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  id={`badness-student-detail-btn-${student.id || student.studentId || index}`}
                  variant='contained'
                  color='error'
                  size='small'
                  startIcon={<Icon icon='mdi:timeline-check-outline' width={18} height={18} />}
                  onClick={() => onDetailClick(student.info)}
                  sx={{ borderRadius: 2 }}
                >
                  รายละเอียด
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {students.length === 0 && (
          <Box
            id='badness-report-empty-state'
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Icon icon='mdi:file-search-outline' fontSize='4rem' color='text.disabled' sx={{ mb: 2, opacity: 0.5 }} />
            <Typography variant='h6' color='text.secondary' gutterBottom>
              ไม่พบข้อมูล
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              ลองปรับเงื่อนไขการค้นหาและลองใหม่
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <Box id='badness-report-pagination' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
            <Typography variant='body2' color='text.secondary'>
              หน้า {currentPage + 1} จาก {totalPages}
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage + 1}
              onChange={(_event, page) => onPageChange(page - 1)}
              renderItem={(item) => (
                <PaginationItem
                  components={{ previous: ChevronLeft, next: ChevronRight }}
                  {...item}
                />
              )}
              shape='rounded'
              size={window.innerWidth < 600 ? 'small' : 'medium'}
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};
