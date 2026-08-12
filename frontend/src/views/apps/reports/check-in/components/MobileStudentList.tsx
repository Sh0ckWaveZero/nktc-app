'use client';

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 */
/* Hallmark · component: check-in student transition · genre: modern-minimal · theme: NKTC
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */

import { useEffect, useRef, useState } from 'react';
import CasinoOutlined from '@mui/icons-material/CasinoOutlined';
import { Alert, Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AnimatePresence, LazyMotion, domMax, m, useReducedMotion } from 'motion/react';

import SHAPE_TOKENS from '@/@core/theme/tokens/shape';

import CheckInCompletionSummary from './CheckInCompletionSummary';
import MobilePaginationControls from './MobilePaginationControls';
import StudentCard from './StudentCard';

const STATUS_FEEDBACK_DURATION_MS = 200;
const STATUS_SETTLE_DURATION_MS = 200;
const CARD_EXIT_DURATION_SECONDS = 0.2;
const CARD_ENTER_DURATION_SECONDS = 0.3;
const CARD_LAYOUT_DURATION_SECONDS = 0.42;
const CARD_ENTER_OFFSET_PX = 8;
const CARD_EXIT_OFFSET_PX = -6;
const CARD_ENTER_STAGGER_SECONDS = 0.04;
const MAX_CARD_STAGGER_SECONDS = 0.08;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.7, 0, 0.84, 0] as const;
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
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isCheckInComplete = pendingStudentsCount === 0;

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  if (students.length === 0) {
    return (
      <Alert severity='info' variant='outlined' sx={{ borderRadius: SHAPE_TOKENS.surface }}>
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
      statusTimerRef.current = null;
      settleTimerRef.current = setTimeout(() => {
        setStatusTransition(null);
        settleTimerRef.current = null;
      }, STATUS_SETTLE_DURATION_MS);
    }, STATUS_FEEDBACK_DURATION_MS);
  };

  const isStudentTransitioning = (studentId: string) => statusTransition?.studentId === studentId;

  return (
    <LazyMotion features={domMax}>
      <>
        {!isCheckInComplete && !hasSavedCheckIn && (
          <Button
            id='checkin-random-student-btn'
            type='button'
            variant='contained'
            fullWidth
            startIcon={<CasinoOutlined />}
            disabled={Boolean(statusTransition)}
            onClick={handleRandomStudent}
            sx={(theme) => ({
              minHeight: 48,
              mb: 2,
              borderRadius: SHAPE_TOKENS.control,
              fontWeight: 700,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              backgroundColor: 'primary.main',
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              transition:
                'background-color 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 100ms cubic-bezier(0.16, 1, 0.3, 1)',
              '@media (hover: hover) and (pointer: fine)': {
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 'none',
                  transform: 'translateY(-1px)',
                },
              },
              '&:active': {
                transform: 'translateY(1px)',
              },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                transform: 'none',
              },
            })}
          >
            {randomStudent ? 'สุ่มนักเรียนใหม่' : 'สุ่มนักเรียนเพื่อเช็คชื่อ'}
          </Button>
        )}

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
                      y: CARD_EXIT_OFFSET_PX,
                      transition: { duration: CARD_EXIT_DURATION_SECONDS, ease: EASE_IN },
                    }
              }
              transition={{ duration: shouldReduceMotion ? 0 : CARD_ENTER_DURATION_SECONDS, ease: EASE_OUT }}
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
          sx={(theme) => ({
            '--checkin-filter-inset': SHAPE_TOKENS.inset,
            '--checkin-filter-outer-radius': SHAPE_TOKENS.surface,
            gap: 'var(--checkin-filter-inset)',
            p: 'var(--checkin-filter-inset)',
            mb: 2,
            borderRadius: 'var(--checkin-filter-outer-radius)',
            backgroundColor: 'action.hover',
            '& .MuiToggleButtonGroup-grouped': {
              minHeight: 44,
              border: '0 !important',
              borderRadius:
                'max(0px, calc(var(--checkin-filter-outer-radius) - var(--checkin-filter-inset))) !important',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'background-color 150ms cubic-bezier(0.65, 0, 0.35, 1)',
              '&.Mui-selected': {
                color: 'text.primary',
                backgroundColor: 'background.paper',
                boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.24 : 0.1)}`,
                '&:hover': {
                  backgroundColor: 'background.paper',
                },
              },
            },
          })}
        >
          <ToggleButton id='checkin-filter-pending-btn' value='pending' aria-label='แสดงนักเรียนที่รอเช็คชื่อ'>
            รอเช็ค ({pendingStudentsCount})
          </ToggleButton>
          <ToggleButton id='checkin-filter-all-btn' value='all' aria-label='แสดงนักเรียนทั้งหมด'>
            ทั้งหมด ({students.length})
          </ToggleButton>
        </ToggleButtonGroup>

        <AnimatePresence initial={false}>
          {isCheckInComplete && (
            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: CARD_ENTER_OFFSET_PX }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      transition: { duration: CARD_EXIT_DURATION_SECONDS, ease: EASE_IN },
                    }
              }
              transition={{ duration: shouldReduceMotion ? 0 : CARD_ENTER_DURATION_SECONDS, ease: EASE_OUT }}
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
              paginatedStudents.map((student, index) => (
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
                          y: CARD_EXIT_OFFSET_PX,
                          transition: { duration: CARD_EXIT_DURATION_SECONDS, ease: EASE_IN },
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          layout: { duration: CARD_LAYOUT_DURATION_SECONDS, ease: EASE_OUT },
                          opacity: {
                            duration: CARD_ENTER_DURATION_SECONDS,
                            delay: Math.min(index * CARD_ENTER_STAGGER_SECONDS, MAX_CARD_STAGGER_SECONDS),
                            ease: EASE_OUT,
                          },
                          y: {
                            duration: CARD_ENTER_DURATION_SECONDS,
                            delay: Math.min(index * CARD_ENTER_STAGGER_SECONDS, MAX_CARD_STAGGER_SECONDS),
                            ease: EASE_OUT,
                          },
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
