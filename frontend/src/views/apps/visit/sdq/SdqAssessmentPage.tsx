'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeft from 'mdi-material-ui/ChevronLeft';
import ChevronRight from 'mdi-material-ui/ChevronRight';
import ClipboardPulseOutline from 'mdi-material-ui/ClipboardPulseOutline';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

import AppListDataGrid from '@/@core/components/data-grid/AppListDataGrid';
import { getAdvisorClassroomIds } from '@/utils/advisor-classrooms';
import { sortStudentsByStudentId } from '@/utils/student-sort';
import { useAuth } from '@/hooks/useAuth';
import {
  type TeacherVisitStudentRow,
  useTeacherVisitStudents,
  useUpdateVisit,
  useCreateVisit,
} from '@/hooks/queries/useVisits';

import {
  SDQ_QUESTIONS,
  SDQ_ANSWER_OPTIONS,
  SDQ_SUBSCALE_ORDER,
  SDQ_SUBSCALES,
  SDQ_CLASSIFICATION_INFO,
} from './sdq-constants';
import type { SdqSubscaleKey, SdqClassification } from './sdq-constants';
import {
  calculateSdqResult,
  buildSdqRecord,
  isAllQuestionsAnswered,
  countAnswered,
  rebuildResultFromRecord,
} from './sdq-scoring';
import type { SdqAnswers, SdqAssessmentResult, SdqAssessmentRecord } from './sdq-scoring';

/* ─────────────────────── constants ─────────────────────── */

const TOTAL_QUESTIONS = 25;
const ANIMATION_DURATION = 350;

/* ─────────────────────── helpers ─────────────────────── */

const getInitials = (name: string): string => {
  const segments = name.trim().split(/\s+/).filter(Boolean);

  if (segments.length === 0) {
    return '?';
  }

  return segments
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join('')
    .toUpperCase();
};

const getSubscaleQuestions = (subscaleKey: SdqSubscaleKey) => {
  return SDQ_QUESTIONS.filter((q) => q.subscale === subscaleKey);
};

const getClassificationColor = (classification: SdqClassification): string => {
  return SDQ_CLASSIFICATION_INFO[classification].color;
};

const getClassificationMuiColor = (classification: SdqClassification): 'success' | 'warning' | 'error' => {
  const map: Record<SdqClassification, 'success' | 'warning' | 'error'> = {
    normal: 'success',
    borderline: 'warning',
    abnormal: 'error',
  };

  return map[classification];
};

/* ─────────────────────── Radar Chart (SVG) ─────────────────────── */

interface RadarChartProps {
  scores: Record<SdqSubscaleKey, number>;
  size?: number;
}

const RadarChart = ({ scores, size = 280 }: RadarChartProps) => {
  const theme = useTheme();
  const center = size / 2;
  const radius = size / 2 - 40;
  const levels = 5;
  const labels = SDQ_SUBSCALE_ORDER;
  const angleStep = (2 * Math.PI) / labels.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number, maxValue: number = 10) => {
    const angle = startAngle + index * angleStep;
    const r = (value / maxValue) * radius;

    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLines = Array.from({ length: levels }, (_, level) => {
    const levelRadius = ((level + 1) / levels) * radius;
    const points = labels.map((_, i) => {
      const angle = startAngle + i * angleStep;

      return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
    });

    return points.join(' ');
  });

  const dataPoints = labels.map((key, i) => getPoint(i, scores[key]));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const isDark = theme.palette.mode === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const axisColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid polygons */}
        {gridLines.map((points, i) => (
          <polygon key={`grid-${i}`} points={points} fill='none' stroke={gridColor} strokeWidth={1} />
        ))}

        {/* Axis lines */}
        {labels.map((_, i) => {
          const endPoint = getPoint(i, 10);

          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={axisColor}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPath}
          fill={alpha(theme.palette.primary.main, 0.15)}
          stroke={theme.palette.primary.main}
          strokeWidth={2.5}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r={4.5}
            fill={SDQ_SUBSCALES[labels[i]].color}
            stroke='#fff'
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {labels.map((key, i) => {
          const info = SDQ_SUBSCALES[key];
          const labelPoint = getPoint(i, 13);

          return (
            <text
              key={`label-${i}`}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor='middle'
              dominantBaseline='central'
              fontSize={11}
              fontWeight={600}
              fill={isDark ? '#ccc' : '#555'}
            >
              {info.icon} {scores[key]}
            </text>
          );
        })}
      </svg>
    </Box>
  );
};

/* ─────────────────────── Question Card ─────────────────────── */

interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  isReversed: boolean;
  selectedValue: number | undefined;
  onSelect: (questionNumber: number, value: number) => void;
  index: number;
}

const QuestionCard = ({
  questionNumber,
  questionText,
  isReversed,
  selectedValue,
  onSelect,
  index,
}: QuestionCardProps) => {
  const theme = useTheme();

  return (
    <Fade in timeout={ANIMATION_DURATION + index * 60}>
      <Card
        id={`sdq-question-card-${questionNumber}`}
        elevation={0}
        sx={{
          border: (t) =>
            `1.5px solid ${
              selectedValue !== undefined ? alpha(t.palette.primary.main, 0.35) : alpha(t.palette.divider, 0.8)
            }`,
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor:
            selectedValue !== undefined
              ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.02)
              : 'background.paper',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.45),
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: 'primary.main',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {questionNumber}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='body1' sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.6 }}>
                {questionText}
              </Typography>
              {isReversed ? (
                <Chip
                  size='small'
                  label='ข้อกลับคะแนน'
                  variant='outlined'
                  color='info'
                  sx={{ mt: 0.5, height: 22, fontSize: '0.7rem' }}
                />
              ) : null}
            </Box>
          </Stack>

          <RadioGroup
            row
            value={selectedValue ?? ''}
            onChange={(_, val) => onSelect(questionNumber, Number(val))}
            sx={{ ml: { xs: 0, sm: 5.5 }, gap: { xs: 0.5, sm: 1 } }}
          >
            {SDQ_ANSWER_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={
                  <Radio
                    size='small'
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2' sx={{ fontWeight: selectedValue === option.value ? 700 : 400 }}>
                    {option.label}
                  </Typography>
                }
                sx={{
                  mr: 0,
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  bgcolor:
                    selectedValue === option.value
                      ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.06)
                      : 'transparent',
                }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </Fade>
  );
};

/* ─────────────────────── Subscale Result Card ─────────────────────── */

interface SubscaleResultCardProps {
  subscaleKey: SdqSubscaleKey;
  score: number;
  classification: SdqClassification;
  index: number;
}

const SubscaleResultCard = ({ subscaleKey, score, classification, index }: SubscaleResultCardProps) => {
  const theme = useTheme();
  const info = SDQ_SUBSCALES[subscaleKey];
  const classInfo = SDQ_CLASSIFICATION_INFO[classification];

  return (
    <Fade in timeout={ANIMATION_DURATION + index * 120}>
      <Card
        id={`sdq-subscale-result-${subscaleKey}`}
        elevation={0}
        sx={{
          border: `1.5px solid ${classInfo.borderColor}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${alpha(classInfo.color, 0.15)}`,
          },
        }}
      >
        {/* Gradient top bar */}
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${info.gradientFrom}, ${info.gradientTo})`,
          }}
        />
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                {info.icon} {info.nameTh}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {info.nameEn}
              </Typography>
            </Box>
            <Chip
              size='small'
              label={classInfo.label}
              sx={{
                fontWeight: 700,
                color: classInfo.color,
                bgcolor: classInfo.bgColor,
                border: `1px solid ${classInfo.borderColor}`,
                fontSize: '0.7rem',
              }}
            />
          </Stack>

          <Stack direction='row' sx={{ alignItems: 'baseline', gap: 0.5, mb: 1 }}>
            <Typography variant='h4' sx={{ fontWeight: 900, color: classInfo.color, lineHeight: 1 }}>
              {score}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
              / 10
            </Typography>
          </Stack>

          <LinearProgress
            variant='determinate'
            value={(score / 10) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(classInfo.color, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${info.gradientFrom}, ${info.gradientTo})`,
              },
            }}
          />
        </CardContent>
      </Card>
    </Fade>
  );
};

/* ─────────────────────── History Dialog ─────────────────────── */

interface HistoryDialogProps {
  open: boolean;
  onClose: () => void;
  records: SdqAssessmentRecord[];
  studentName: string;
}

const HistoryDialog = ({ open, onClose, records, studentName }: HistoryDialogProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setExpandedIndex(null);
    }
  }, [open]);

  return (
    <Dialog
      id='sdq-history-dialog'
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      aria-labelledby='sdq-history-dialog-title'
    >
      <DialogTitle id='sdq-history-dialog-title' sx={{ fontWeight: 800 }}>
        📋 ประวัติการประเมิน SDQ — {studentName}
      </DialogTitle>
      <DialogContent dividers>
        {records.length === 0 ? (
          <Alert severity='info' id='sdq-history-empty-alert'>
            ยังไม่มีประวัติการประเมิน SDQ สำหรับนักเรียนคนนี้
          </Alert>
        ) : (
          <Stack spacing={2}>
            {records.map((record, index) => {
              const result = rebuildResultFromRecord(record);
              const classInfo = SDQ_CLASSIFICATION_INFO[result.totalClassification];
              const isExpanded = expandedIndex === index;

              return (
                <Card
                  key={`history-${index}-${record.assessmentDate}`}
                  id={`sdq-history-card-${index}`}
                  elevation={0}
                  sx={{
                    border: (t) => `1.5px solid ${alpha(t.palette.divider, 0.8)}`,
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
                        <Typography variant='body1' sx={{ fontWeight: 700 }}>
                          📅{' '}
                          {new Date(record.assessmentDate).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                        <Chip
                          size='small'
                          label={`${classInfo.icon} ${classInfo.label}`}
                          sx={{
                            fontWeight: 700,
                            color: classInfo.color,
                            bgcolor: classInfo.bgColor,
                            border: `1px solid ${classInfo.borderColor}`,
                          }}
                        />
                      </Stack>
                      <Typography variant='h6' sx={{ fontWeight: 900, color: classInfo.color }}>
                        {result.totalDifficulty}/40
                      </Typography>
                    </Stack>

                    <Collapse in={isExpanded} timeout='auto'>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={1.5}>
                        {SDQ_SUBSCALE_ORDER.map((key) => (
                          <Grid key={key} size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {SDQ_SUBSCALES[key].icon} {SDQ_SUBSCALES[key].nameTh}
                              </Typography>
                              <Typography variant='h6' sx={{ fontWeight: 800, color: SDQ_SUBSCALES[key].color }}>
                                {result.subscales[key].score}/10
                              </Typography>
                              <Chip
                                size='small'
                                label={SDQ_CLASSIFICATION_INFO[result.subscales[key].classification].label}
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  color: SDQ_CLASSIFICATION_INFO[result.subscales[key].classification].color,
                                  bgcolor: SDQ_CLASSIFICATION_INFO[result.subscales[key].classification].bgColor,
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button id='sdq-history-close-button' variant='outlined' onClick={onClose}>
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const getLatestSdqRecord = (row: TeacherVisitStudentRow): SdqAssessmentRecord | null => {
  if (!row.visitDetail) {
    return null;
  }

  const detail = row.visitDetail as Record<string, unknown>;

  if (!detail.sdqAssessments || !Array.isArray(detail.sdqAssessments) || detail.sdqAssessments.length === 0) {
    return null;
  }

  // ตัวล่าสุดคือตัวสุดท้ายในอาร์เรย์
  return detail.sdqAssessments[detail.sdqAssessments.length - 1] as SdqAssessmentRecord;
};

const SdqStatusChip = ({ row }: { row: TeacherVisitStudentRow }) => {
  const latestRecord = getLatestSdqRecord(row);

  if (!latestRecord) {
    return <Chip size='small' label='ยังไม่ได้ประเมิน' color='default' variant='outlined' sx={{ fontWeight: 600 }} />;
  }

  const classification = latestRecord.classifications.totalDifficulty as SdqClassification;
  const difficultyScore = latestRecord.scores.totalDifficulty;
  const classInfo = SDQ_CLASSIFICATION_INFO[classification];
  const muiColor = getClassificationMuiColor(classification);

  return (
    <Chip
      size='small'
      label={`${classInfo.icon} ${classInfo.label} (${difficultyScore} คะแนน)`}
      color={muiColor}
      variant='outlined'
      sx={{
        fontWeight: 700,
        bgcolor: classInfo.bgColor,
        color: classInfo.color,
        border: `1.5px solid ${classInfo.borderColor}`,
      }}
    />
  );
};

/* ─────────────────────── Main Page ─────────────────────── */

const SdqAssessmentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading, isInitialized } = useAuth();
  const isTeacher = user?.role?.toLowerCase() === 'teacher';

  /* ─── state ─── */
  const [selectedStudent, setSelectedStudent] = useState<TeacherVisitStudentRow | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<SdqAnswers>({});
  const [result, setResult] = useState<SdqAssessmentResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [historyStudent, setHistoryStudent] = useState<TeacherVisitStudentRow | null>(null);

  /* ─── queries ─── */
  const advisorClassroomIds = useMemo(
    () => getAdvisorClassroomIds(user),
    [user?.teacherOnClassroom, user?.teacher?.classrooms],
  );

  const hasAdvisorClassrooms = advisorClassroomIds.length > 0;

  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
  } = useTeacherVisitStudents(undefined, {
    enabled: Boolean(isInitialized && !loading && isTeacher),
    advisorClassroomIds,
  });
  const hasAdvisorStudentScope = hasAdvisorClassrooms || students.length > 0;
  const showNoAdvisorScopeAlert = Boolean(
    isInitialized && !loading && isTeacher && !isStudentsLoading && !isStudentsFetching && !hasAdvisorStudentScope,
  );

  const updateVisit = useUpdateVisit();
  const createVisit = useCreateVisit();

  /* ─── derived ─── */
  const answeredCount = useMemo(() => countAnswered(answers), [answers]);
  const isComplete = answeredCount === TOTAL_QUESTIONS;
  const progress = (answeredCount / TOTAL_QUESTIONS) * 100;

  const existingSdqRecords: SdqAssessmentRecord[] = useMemo(() => {
    if (!selectedStudent?.visitDetail) {
      return [];
    }

    const detail = selectedStudent.visitDetail as Record<string, unknown>;

    if (!detail.sdqAssessments || !Array.isArray(detail.sdqAssessments)) {
      return [];
    }

    return detail.sdqAssessments as SdqAssessmentRecord[];
  }, [selectedStudent]);

  const classroomOptions = useMemo(() => {
    const classroomMap = new Map<string, { id: string; name: string }>();

    students.forEach((student) => {
      if (student.classroomId && !classroomMap.has(student.classroomId)) {
        classroomMap.set(student.classroomId, {
          id: student.classroomId,
          name: student.classroomName,
        });
      }
    });

    return Array.from(classroomMap.values()).sort((left, right) => left.name.localeCompare(right.name, 'th'));
  }, [students]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const sorted = sortStudentsByStudentId(students);

    return sorted.filter((row) => {
      const matchesClassroom = selectedClassroomId ? row.classroomId === selectedClassroomId : true;
      const matchesSearch =
        !normalizedSearch ||
        [row.studentId, row.fullName, row.classroomName].some((value) =>
          value?.toLowerCase().includes(normalizedSearch),
        );

      return matchesClassroom && matchesSearch;
    });
  }, [students, searchValue, selectedClassroomId]);

  const handleSelectStudent = useCallback((student: TeacherVisitStudentRow | null) => {
    setSelectedStudent(student);
    setAnswers({});
    setResult(null);
    setActiveStep(0);
  }, []);

  const columns = useMemo<GridColDef<TeacherVisitStudentRow>[]>(
    () => [
      {
        flex: 0.15,
        minWidth: 130,
        field: 'studentId',
        headerName: 'รหัสนักเรียน',
        sortable: false,
      },
      {
        flex: 0.28,
        minWidth: 220,
        field: 'fullName',
        headerName: 'ชื่อ-นามสกุล',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Avatar
              id={`sdq-student-avatar-${row.id}`}
              sx={{
                width: 36,
                height: 36,
                bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.28 : 0.14),
                color: 'primary.main',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {getInitials(row.fullName)}
            </Avatar>
            <Typography noWrap variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {row.fullName}
            </Typography>
          </Stack>
        ),
      },
      {
        flex: 0.2,
        minWidth: 150,
        field: 'classroomName',
        headerName: 'ห้องเรียน',
        sortable: false,
      },
      {
        flex: 0.22,
        minWidth: 180,
        field: 'sdqStatus',
        headerName: 'ผลประเมิน SDQ ล่าสุด',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => <SdqStatusChip row={row} />,
      },
      {
        flex: 0.15,
        minWidth: 200,
        field: 'actions',
        headerName: 'การทำรายการ',
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => {
          const latestRecord = getLatestSdqRecord(row);
          const hasRecord = Boolean(latestRecord);

          return (
            <Stack direction='row' spacing={1} sx={{ width: '100%', py: 1, justifyContent: 'center' }}>
              {hasRecord && (
                <Button
                  id={`sdq-history-row-button-${row.id}`}
                  variant='outlined'
                  color='info'
                  size='small'
                  onClick={() => setHistoryStudent(row)}
                >
                  ประวัติ
                </Button>
              )}
              <Button
                id={`sdq-assess-row-button-${row.id}`}
                variant={hasRecord ? 'outlined' : 'contained'}
                color={hasRecord ? 'warning' : 'primary'}
                size='small'
                onClick={() => handleSelectStudent(row)}
              >
                {hasRecord ? 'ประเมินใหม่' : 'เริ่มประเมิน'}
              </Button>
            </Stack>
          );
        },
      },
    ],
    [handleSelectStudent],
  );

  const handleAnswer = useCallback((questionNumber: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: value }));
  }, []);

  const handleNext = () => {
    if (activeStep < SDQ_SUBSCALE_ORDER.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleCalculate = () => {
    if (!isComplete) {
      toast.error('กรุณาตอบคำถามให้ครบทุกข้อ');

      return;
    }

    const assessmentResult = calculateSdqResult(answers);
    setResult(assessmentResult);
    setActiveStep(SDQ_SUBSCALE_ORDER.length);
  };

  const handleSave = async () => {
    if (!selectedStudent || !result || !user) {
      return;
    }

    setIsSaving(true);

    try {
      const userId = ((user as Record<string, unknown>).id as string) ?? '';
      const record = buildSdqRecord(answers, result, userId);
      const currentDetail = (selectedStudent.visitDetail ?? {}) as Record<string, unknown>;
      const existingAssessments = Array.isArray(currentDetail.sdqAssessments)
        ? (currentDetail.sdqAssessments as SdqAssessmentRecord[])
        : [];

      const updatedDetail = {
        ...currentDetail,
        sdqAssessments: [...existingAssessments, record],
      };

      if (selectedStudent.visitId) {
        await updateVisit.mutateAsync({
          visitId: selectedStudent.visitId,
          params: {
            studentKey: selectedStudent.studentKey,
            studentId: selectedStudent.studentId,
            classroomId: selectedStudent.classroomId || '',
            visitDate: selectedStudent.visitDate
              ? new Date(selectedStudent.visitDate).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            images: selectedStudent.images.length >= 3 ? selectedStudent.images : ['', '', ''],
            visitDetail: updatedDetail,
            visitMap: selectedStudent.visitMap ?? null,
          },
        });
      } else {
        await createVisit.mutateAsync({
          studentKey: selectedStudent.studentKey,
          studentId: selectedStudent.studentId,
          classroomId: selectedStudent.classroomId || '',
          visitDate: new Date().toISOString().slice(0, 10),
          images: ['', '', ''],
          visitDetail: updatedDetail,
          visitMap: null,
        });
      }

      toast.success('บันทึกผลประเมิน SDQ สำเร็จ');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setActiveStep(0);
  };

  /* ─── current step questions ─── */
  const currentSubscaleKey = activeStep < SDQ_SUBSCALE_ORDER.length ? SDQ_SUBSCALE_ORDER[activeStep] : null;
  const currentQuestions = currentSubscaleKey ? getSubscaleQuestions(currentSubscaleKey) : [];
  const currentSubscaleInfo = currentSubscaleKey ? SDQ_SUBSCALES[currentSubscaleKey] : null;
  const isCurrentStepComplete = currentQuestions.every((q) => answers[q.number] !== undefined);

  /* ─── render ─── */
  if (showNoAdvisorScopeAlert) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity='warning' id='sdq-no-classroom-alert'>
          ยังไม่พบห้องที่คุณเป็นครูที่ปรึกษา หรือยังไม่มีรายชื่อนักเรียนในห้องที่ดูแล
          กรุณาตรวจสอบการตั้งค่าครูที่ปรึกษาและข้อมูลนักเรียนอีกครั้ง
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ───── Header ───── */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: (t) =>
            t.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha('#667eea', 0.2)} 0%, ${alpha('#764ba2', 0.15)} 100%)`
              : `linear-gradient(135deg, ${alpha('#667eea', 0.08)} 0%, ${alpha('#764ba2', 0.06)} 100%)`,
          border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontSize: '1.5rem',
            }}
          >
            📋
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 900, color: 'text.primary' }}>
              แบบประเมินคัดกรอง SDQ
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.25 }}>
              Strengths and Difficulties Questionnaire — ฉบับครูประเมินนักเรียน (กรมสุขภาพจิต)
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ───── Student Selection or Selected Details ───── */}
      {!selectedStudent ? (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 3 }}>
              🎓 เลือกนักเรียนที่ต้องการประเมินจากห้องเรียนที่ปรึกษา
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  id='sdq-classroom-filter'
                  options={classroomOptions}
                  value={classroomOptions.find((option) => option.id === selectedClassroomId) ?? null}
                  onChange={(_, newValue) => setSelectedClassroomId(newValue?.id ?? null)}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id='sdq-classroom-input'
                      label='กรองตามห้องเรียน'
                      placeholder='เลือกห้องเรียน'
                      size='small'
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  id='sdq-search-input'
                  fullWidth
                  label='ค้นหานักเรียน'
                  placeholder='ค้นหาจากรหัสนักเรียน หรือ ชื่อ-นามสกุล...'
                  size='small'
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </Grid>
            </Grid>

            <Box id='sdq-student-datagrid-container' sx={{ pb: 1 }}>
              <AppListDataGrid
                autoHeight
                rows={filteredRows}
                columns={columns as GridColDef[]}
                loading={loading || isStudentsLoading || isStudentsFetching}
                disableRowSelectionOnClick
                disableColumnMenu
                getRowHeight={() => 'auto'}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                localeText={{
                  noRowsLabel: 'ไม่พบข้อมูลนักเรียน',
                }}
                sx={{
                  '& .MuiDataGrid-main': {
                    minHeight: 350,
                  },
                  '& .MuiDataGrid-cell': {
                    px: { xs: 1.5, md: 2.5 },
                    py: 1.5,
                  },
                  '& .MuiDataGrid-columnHeader': {
                    px: { xs: 1.5, md: 2.5 },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
            bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.08 : 0.03),
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    fontWeight: 800,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                    color: 'primary.main',
                  }}
                >
                  {getInitials(selectedStudent.fullName)}
                </Avatar>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>
                    {selectedStudent.fullName}
                  </Typography>
                  <Stack direction='row' spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
                    <Chip size='small' label={`รหัส: ${selectedStudent.studentId}`} variant='outlined' />
                    <Chip size='small' label={selectedStudent.classroomName} color='info' variant='outlined' />
                    {existingSdqRecords.length > 0 ? (
                      <Chip
                        size='small'
                        label={`ประเมินแล้ว ${existingSdqRecords.length} ครั้ง`}
                        color='success'
                        variant='outlined'
                        onClick={() => setHistoryStudent(selectedStudent)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ) : null}
                  </Stack>
                </Box>
              </Stack>

              <Stack direction='row' spacing={1.5}>
                {existingSdqRecords.length > 0 ? (
                  <Button
                    id='sdq-view-history-button'
                    variant='outlined'
                    size='small'
                    onClick={() => setHistoryStudent(selectedStudent)}
                  >
                    ดูประวัติประเมิน
                  </Button>
                ) : null}
                <Button
                  id='sdq-back-to-list-button'
                  variant='contained'
                  color='secondary'
                  size='small'
                  onClick={() => handleSelectStudent(null)}
                >
                  ย้อนกลับไปหน้ารายชื่อ
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ───── Assessment Area ───── */}
      {selectedStudent ? (
        result ? (
          /* ═══════ RESULTS ═══════ */
          <Fade in timeout={500}>
            <Box>
              {/* Total Score Hero */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: (t) => `2px solid ${SDQ_CLASSIFICATION_INFO[result.totalClassification].borderColor}`,
                }}
              >
                <Box
                  sx={{
                    height: 6,
                    background:
                      result.totalClassification === 'normal'
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : result.totalClassification === 'borderline'
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  }}
                />
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography
                          variant='overline'
                          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}
                        >
                          ผลคะแนนรวมพฤติกรรมที่เป็นปัญหา
                        </Typography>
                        <Stack
                          direction='row'
                          sx={{
                            alignItems: 'baseline',
                            gap: 1,
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            mt: 1,
                          }}
                        >
                          <Typography
                            variant='h2'
                            sx={{
                              fontWeight: 900,
                              color: SDQ_CLASSIFICATION_INFO[result.totalClassification].color,
                              lineHeight: 1,
                            }}
                          >
                            {result.totalDifficulty}
                          </Typography>
                          <Typography variant='h5' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            / 40
                          </Typography>
                        </Stack>
                        <Chip
                          id='sdq-result-classification-chip'
                          label={`${SDQ_CLASSIFICATION_INFO[result.totalClassification].icon} ${SDQ_CLASSIFICATION_INFO[result.totalClassification].label}`}
                          sx={{
                            mt: 2,
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            height: 36,
                            px: 1,
                            color: SDQ_CLASSIFICATION_INFO[result.totalClassification].color,
                            bgcolor: SDQ_CLASSIFICATION_INFO[result.totalClassification].bgColor,
                            border: `1.5px solid ${SDQ_CLASSIFICATION_INFO[result.totalClassification].borderColor}`,
                          }}
                        />
                        <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1.5, fontWeight: 500 }}>
                          {SDQ_CLASSIFICATION_INFO[result.totalClassification].description}
                        </Typography>

                        {/* Prosocial */}
                        <Box
                          sx={{
                            mt: 2.5,
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: alpha(SDQ_SUBSCALES.prosocial.color, 0.06),
                            border: `1px solid ${alpha(SDQ_SUBSCALES.prosocial.color, 0.2)}`,
                          }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                            🌟 จุดแข็ง (Prosocial)
                          </Typography>
                          <Stack direction='row' sx={{ alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                            <Typography variant='h5' sx={{ fontWeight: 900, color: SDQ_SUBSCALES.prosocial.color }}>
                              {result.prosocialScore}
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                              / 10
                            </Typography>
                            <Chip
                              size='small'
                              label={result.prosocialClassification === 'normal' ? 'มีจุดแข็ง' : 'ไม่มีจุดแข็ง'}
                              color={result.prosocialClassification === 'normal' ? 'success' : 'error'}
                              variant='outlined'
                              sx={{ ml: 1, fontWeight: 700 }}
                            />
                          </Stack>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                      <RadarChart
                        scores={{
                          emotional: result.subscales.emotional.score,
                          conduct: result.subscales.conduct.score,
                          hyperactivity: result.subscales.hyperactivity.score,
                          peer: result.subscales.peer.score,
                          prosocial: result.prosocialScore,
                        }}
                        size={isMobile ? 260 : 300}
                      />
                      <Stack direction='row' spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                        {SDQ_SUBSCALE_ORDER.map((key) => (
                          <Chip
                            key={key}
                            size='small'
                            label={`${SDQ_SUBSCALES[key].icon} ${SDQ_SUBSCALES[key].nameTh}`}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              bgcolor: alpha(SDQ_SUBSCALES[key].color, 0.1),
                              color: SDQ_SUBSCALES[key].color,
                            }}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Subscale Result Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {SDQ_SUBSCALE_ORDER.map((key, index) => (
                  <Grid key={key} size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <SubscaleResultCard
                      subscaleKey={key}
                      score={result.subscales[key].score}
                      classification={result.subscales[key].classification}
                      index={index}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Recommendations */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 2 }}>
                    💡 คำแนะนำ
                  </Typography>
                  <Stack spacing={1.5}>
                    {result.recommendations.map((rec, index) => (
                      <Stack key={index} direction='row' spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            flexShrink: 0,
                            mt: 0.25,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.7 }}>
                          {rec}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
                <Button
                  id='sdq-save-result-button'
                  variant='contained'
                  size='large'
                  onClick={handleSave}
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={18} color='inherit' /> : undefined}
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontWeight: 800,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: `0 4px 16px ${alpha('#667eea', 0.3)}`,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4195 100%)',
                    },
                  }}
                >
                  {isSaving ? 'กำลังบันทึก...' : '💾 บันทึกผลประเมิน'}
                </Button>
                <Button
                  id='sdq-reset-button'
                  variant='outlined'
                  size='large'
                  onClick={handleReset}
                  sx={{ px: 4, py: 1.25, fontWeight: 700, borderRadius: 3 }}
                >
                  🔄 ประเมินใหม่
                </Button>
              </Stack>
            </Box>
          </Fade>
        ) : (
          /* ═══════ QUESTIONNAIRE ═══════ */
          <Fade in timeout={400}>
            <Box>
              {/* Progress Bar */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                      ความคืบหน้า
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {answeredCount} / {TOTAL_QUESTIONS} ข้อ
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant='determinate'
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        transition: 'transform 0.4s ease',
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                {/* Stepper sidebar */}
                {!isMobile ? (
                  <Grid size={{ md: 3 }}>
                    <Card
                      elevation={0}
                      sx={{
                        position: 'sticky',
                        top: 80,
                        borderRadius: 3,
                        border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stepper activeStep={activeStep} orientation='vertical'>
                          {SDQ_SUBSCALE_ORDER.map((key, index) => {
                            const info = SDQ_SUBSCALES[key];
                            const stepQuestions = getSubscaleQuestions(key);
                            const stepAnswered = stepQuestions.filter((q) => answers[q.number] !== undefined).length;
                            const isStepComplete = stepAnswered === stepQuestions.length;

                            return (
                              <Step key={key} completed={isStepComplete}>
                                <StepLabel
                                  onClick={() => setActiveStep(index)}
                                  sx={{
                                    cursor: 'pointer',
                                    '& .MuiStepLabel-label': {
                                      fontWeight: activeStep === index ? 800 : 500,
                                      fontSize: '0.8rem',
                                    },
                                  }}
                                  optional={
                                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                      {info.icon} {stepAnswered}/{stepQuestions.length}
                                    </Typography>
                                  }
                                >
                                  {info.nameTh}
                                </StepLabel>
                              </Step>
                            );
                          })}
                        </Stepper>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : null}

                {/* Questions area */}
                <Grid size={{ xs: 12, md: 9 }}>
                  {/* Mobile step selector */}
                  {isMobile ? (
                    <Stack direction='row' spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1 }}>
                      {SDQ_SUBSCALE_ORDER.map((key, index) => {
                        const info = SDQ_SUBSCALES[key];
                        const stepQuestions = getSubscaleQuestions(key);
                        const stepAnswered = stepQuestions.filter((q) => answers[q.number] !== undefined).length;

                        return (
                          <Chip
                            key={key}
                            label={`${info.icon} ${stepAnswered}/${stepQuestions.length}`}
                            variant={activeStep === index ? 'filled' : 'outlined'}
                            color={
                              stepAnswered === stepQuestions.length
                                ? 'success'
                                : activeStep === index
                                  ? 'primary'
                                  : 'default'
                            }
                            onClick={() => setActiveStep(index)}
                            sx={{ fontWeight: 700, flexShrink: 0 }}
                          />
                        );
                      })}
                    </Stack>
                  ) : null}

                  {/* Current subscale header */}
                  {currentSubscaleInfo ? (
                    <Box
                      sx={{
                        mb: 2.5,
                        p: 2.5,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(currentSubscaleInfo.gradientFrom, 0.12)} 0%, ${alpha(currentSubscaleInfo.gradientTo, 0.08)} 100%)`,
                        border: `1.5px solid ${alpha(currentSubscaleInfo.color, 0.2)}`,
                      }}
                    >
                      <Typography variant='h6' sx={{ fontWeight: 900, color: 'text.primary' }}>
                        {currentSubscaleInfo.icon} ด้านที่ {activeStep + 1}: {currentSubscaleInfo.nameTh}
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {currentSubscaleInfo.nameEn} — {currentQuestions.length} ข้อ
                      </Typography>
                    </Box>
                  ) : null}

                  {/* Question cards */}
                  <Stack spacing={2}>
                    {currentQuestions.map((question, index) => (
                      <QuestionCard
                        key={question.number}
                        questionNumber={question.number}
                        questionText={question.text}
                        isReversed={question.isReversed}
                        selectedValue={answers[question.number]}
                        onSelect={handleAnswer}
                        index={index}
                      />
                    ))}
                  </Stack>

                  {/* Navigation buttons */}
                  <Stack
                    direction='row'
                    sx={{
                      justifyContent: 'space-between',
                      mt: 3,
                      gap: 2,
                    }}
                  >
                    <Button
                      id='sdq-step-back-button'
                      variant='outlined'
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ChevronLeft />}
                      sx={{ fontWeight: 700, borderRadius: 2.5 }}
                    >
                      ย้อนกลับ
                    </Button>

                    {activeStep < SDQ_SUBSCALE_ORDER.length - 1 ? (
                      <Button
                        id='sdq-step-next-button'
                        variant='contained'
                        onClick={handleNext}
                        endIcon={<ChevronRight />}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2.5,
                          px: 3,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        ถัดไป
                      </Button>
                    ) : (
                      <Button
                        id='sdq-calculate-button'
                        variant='contained'
                        onClick={handleCalculate}
                        disabled={!isComplete}
                        sx={{
                          fontWeight: 800,
                          borderRadius: 2.5,
                          px: 4,
                          background: isComplete ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : undefined,
                          boxShadow: isComplete ? `0 4px 16px ${alpha('#22c55e', 0.3)}` : undefined,
                        }}
                      >
                        📊 ดูผลประเมิน
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )
      ) : null}

      {/* History Dialog */}
      <HistoryDialog
        open={Boolean(historyStudent)}
        onClose={() => setHistoryStudent(null)}
        records={
          historyStudent
            ? (((historyStudent.visitDetail as Record<string, unknown>)?.sdqAssessments as SdqAssessmentRecord[]) ?? [])
            : []
        }
        studentName={historyStudent?.fullName ?? ''}
      />
    </Box>
  );
};

export default SdqAssessmentPage;
