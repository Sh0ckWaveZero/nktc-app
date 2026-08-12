'use client';

import { useEffect, useRef, useState } from 'react';
import CasinoOutlined from '@mui/icons-material/CasinoOutlined';
import { Alert, Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';

import CheckInCompletionSummary from './CheckInCompletionSummary';
import MobilePaginationControls from './MobilePaginationControls';
import StudentCard from './StudentCard';

const STATUS_FEEDBACK_DURATION_MS = 320;
const CARD_EXIT_DURATION_SECONDS = 0.36;
const CARD_ENTER_DURATION_SECONDS = 0.42;
const CARD_LAYOUT_DURATION_SECONDS = 0.46;
const CARD_ENTER_OFFSET_PX = 10;
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
const STATUS_LABELS: Record<string, string> = {
  present: 'มาเรียน',
  absent: 'ขาดเรียน',
  late: 'มาสาย',
  leave: 'ลา',
  internship: 'ฝึกงาน',
};

interface StatusTransition {
  studentId: string;
  status: string;
}

interface MobileStudentListProps {
  students: any[];
  pendingStudents: any[];
  paginatedStudents: any[];
  pendingStudentsCount: number;
  filteredStudentsCount: number;
  studentFilter: 'pending' | 'all';
  statusSelections: {
    present: any[];
    absent: any[];
    late: any[];
    leave: any[];
    internship: any[];
  };
  hasSavedCheckIn: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onFilterChange: (filter: 'pending' | 'all') => void;
  onStatusChange: (studentId: string, status: string) => void;
  onPageChange: (page: number) => void;
}

const MobileStudentList = ({
  students,
  pendingStudents,
  paginatedStudents,
  pendingStudentsCount,
  filteredStudentsCount,
  studentFilter,
  statusSelections,
  hasSavedCheckIn,
  currentPage,
  totalPages,
  pageSize,
  onFilterChange,
  onStatusChange,
  onPageChange,
}: MobileStudentListProps) => {
  const [randomStudent, setRandomStudent] = useState<any | null>(null);
  const [statusTransition, setStatusTransition] = useState<StatusTransition | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isCheckInComplete = pendingStudentsCount === 0;

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  if (students.length === 0) {
    return (
      <Alert severity='info' variant='outlined'>
        ไม่พบนักเรียนในห้องเรียนนี้
      </Alert>
    );
  }

  const handleRandomStudent = () => {
    if (pendingStudents.length === 0 || statusTransition) return;

    const randomIndex = Math.floor(Math.random() * pendingStudents.length);
    setRandomStudent(pendingStudents[randomIndex]);
  };

  const handleFilterChange = (filter: 'pending' | 'all') => {
    if (statusTransition) return;
    setRandomStudent(null);
    onFilterChange(filter);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    if (!status || shouldReduceMotion) {
      if (randomStudent?.id === studentId) setRandomStudent(null);
      onStatusChange(studentId, status);
      return;
    }

    if (statusTransition) return;
    setStatusTransition({ studentId, status });
    statusTimerRef.current = setTimeout(() => {
      if (randomStudent?.id === studentId) setRandomStudent(null);
      onStatusChange(studentId, status);
      setStatusTransition(null);
      statusTimerRef.current = null;
    }, STATUS_FEEDBACK_DURATION_MS);
  };

  const isStudentTransitioning = (studentId: string) => statusTransition?.studentId === studentId;

  return (
    <LazyMotion features={domAnimation}>
      <>
        <Button
          type='button'
          variant='outlined'
          fullWidth
          startIcon={<CasinoOutlined />}
          disabled={pendingStudents.length === 0 || hasSavedCheckIn || Boolean(statusTransition)}
          onClick={handleRandomStudent}
          sx={{ minHeight: 44, mb: 1.5, fontWeight: 600 }}
        >
          {randomStudent ? 'สุ่มนักเรียนใหม่' : 'สุ่มนักเรียนเพื่อเช็คชื่อ'}
        </Button>

        <AnimatePresence initial={false} mode='wait'>
          {randomStudent && (
            <m.div
              key={randomStudent.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: CARD_ENTER_OFFSET_PX }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: -10,
                      transition: { duration: CARD_EXIT_DURATION_SECONDS, ease: [0.4, 0, 1, 1] },
                    }
              }
              transition={{ duration: shouldReduceMotion ? 0 : CARD_ENTER_DURATION_SECONDS, ease: EASE_OUT_QUINT }}
            >
              <Stack role='region' aria-label='นักเรียนที่สุ่มได้' spacing={1} aria-live='polite' sx={{ mb: 2 }}>
                <Typography variant='subtitle2' color='primary.main' sx={{ fontWeight: 700 }}>
                  นักเรียนที่สุ่มได้ — เลือกสถานะเช็คชื่อ
                </Typography>
                <StudentCard
                  student={randomStudent}
                  isPresentCheck={statusSelections.present}
                  isAbsentCheck={statusSelections.absent}
                  isLateCheck={statusSelections.late}
                  isLeaveCheck={statusSelections.leave}
                  isInternshipCheck={statusSelections.internship}
                  hasSavedCheckIn={hasSavedCheckIn}
                  previewStatus={isStudentTransitioning(randomStudent.id) ? statusTransition?.status : undefined}
                  onCheckboxChange={handleStatusChange}
                />
              </Stack>
            </m.div>
          )}
        </AnimatePresence>

        <ToggleButtonGroup
          value={studentFilter}
          exclusive
          fullWidth
          size='small'
          disabled={Boolean(statusTransition)}
          onChange={(_, filter) => {
            if (filter) handleFilterChange(filter);
          }}
          aria-label='กรองรายชื่อนักเรียน'
          sx={{ mb: 2, '& .MuiToggleButton-root': { minHeight: 44, textTransform: 'none' } }}
        >
          <ToggleButton value='pending' aria-label='แสดงนักเรียนที่รอเช็คชื่อ'>
            รอเช็ค ({pendingStudentsCount})
          </ToggleButton>
          <ToggleButton value='all' aria-label='แสดงนักเรียนทั้งหมด'>
            ทั้งหมด ({students.length})
          </ToggleButton>
        </ToggleButtonGroup>

        <AnimatePresence initial={false}>
          {isCheckInComplete && (
            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.25, 1, 0.5, 1] }}
            >
              <CheckInCompletionSummary
                totalStudents={students.length}
                hasSavedCheckIn={hasSavedCheckIn}
                counts={{
                  present: statusSelections.present.length,
                  absent: statusSelections.absent.length,
                  late: statusSelections.late.length,
                  leave: statusSelections.leave.length,
                  internship: statusSelections.internship.length,
                }}
              />
            </m.div>
          )}
        </AnimatePresence>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <AnimatePresence initial={false} mode='popLayout'>
            {!randomStudent &&
              filteredStudentsCount > 0 &&
              paginatedStudents.map((student) => (
                <m.div
                  key={student.id}
                  layout={shouldReduceMotion ? false : 'position'}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: CARD_ENTER_OFFSET_PX }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: -10,
                          transition: { duration: CARD_EXIT_DURATION_SECONDS, ease: [0.4, 0, 1, 1] },
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          layout: { duration: CARD_LAYOUT_DURATION_SECONDS, ease: EASE_OUT_QUINT },
                          opacity: { duration: CARD_ENTER_DURATION_SECONDS, ease: EASE_OUT_QUINT },
                          y: { duration: CARD_ENTER_DURATION_SECONDS, ease: EASE_OUT_QUINT },
                        }
                  }
                >
                  <StudentCard
                    student={student}
                    isPresentCheck={statusSelections.present}
                    isAbsentCheck={statusSelections.absent}
                    isLateCheck={statusSelections.late}
                    isLeaveCheck={statusSelections.leave}
                    isInternshipCheck={statusSelections.internship}
                    hasSavedCheckIn={hasSavedCheckIn}
                    previewStatus={isStudentTransitioning(student.id) ? statusTransition?.status : undefined}
                    onCheckboxChange={handleStatusChange}
                  />
                </m.div>
              ))}
          </AnimatePresence>
        </Box>

        {!randomStudent && filteredStudentsCount > 0 && (
          <MobilePaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredStudentsCount}
            onPageChange={onPageChange}
          />
        )}

        <Box component='span' aria-live='polite' sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          {statusTransition ? `เลือกสถานะ ${STATUS_LABELS[statusTransition.status]} แล้ว` : ''}
        </Box>
      </>
    </LazyMotion>
  );
};

export default MobileStudentList;
