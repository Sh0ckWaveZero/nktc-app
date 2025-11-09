import { Box } from '@mui/material';
import GoodnessStudentCard from '@/views/apps/reports/goodness/components/GoodnessStudentCard';
import MobilePaginationControls from '@/views/apps/reports/check-in/components/MobilePaginationControls';

interface GoodnessReportMobileViewProps {
  students: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onDetailClick: (info: any) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const GoodnessReportMobileView = ({
  students,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onDetailClick,
  onPageChange,
  onPageSizeChange,
}: GoodnessReportMobileViewProps) => {
  return (
    <>
      <Box
        id='goodness-report-mobile-scroll-container'
        sx={{
          overflow: 'auto',
          p: 2,
          pb: '120px',
          scrollBehavior: 'smooth',
        }}
      >
        <Box
          id='goodness-report-mobile-view'
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 1.5,
          }}
        >
          {students.map((student: any) => (
            <GoodnessStudentCard
              key={student.id || student.studentId}
              student={student}
              onDetailClick={onDetailClick}
            />
          ))}
        </Box>
      </Box>

      {/* Mobile Pagination - Fixed at bottom */}
      <Box
        id='goodness-report-mobile-pagination-container'
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1000,
          p: 1.5,
        }}
      >
        <MobilePaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </>
  );
};

