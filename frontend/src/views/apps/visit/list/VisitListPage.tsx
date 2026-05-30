'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Autocomplete from '@mui/material/Autocomplete';
import HomeOutline from 'mdi-material-ui/HomeOutline';
import PencilOutline from 'mdi-material-ui/PencilOutline';
import Close from 'mdi-material-ui/Close';
import AppListDataGrid from '@/@core/components/data-grid/AppListDataGrid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { AppListCard, AppListCardHeader, type ListSummaryItem } from '@/@core/components/list-page';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import { useAuth } from '@/hooks/useAuth';
import {
  type VisitDetailData,
  type VisitMapData,
  type TeacherVisitStudentRow,
  type VisitPayload,
  useCreateVisit,
  useTeacherVisitStudents,
  useUpdateVisit,
} from '@/hooks/queries/useVisits';
import { useStudent } from '@/hooks/queries/useStudents';
import { getAdvisorClassroomIds } from '@/utils/advisor-classrooms';
import { resizeImageToDataUrl } from '@/utils/resize-image';
import { sortStudentsByStudentId } from '@/utils/student-sort';
import { toast } from 'react-toastify';

const RESIZE_TARGET = { width: 800, height: 600 } as const;
const EMPTY_IMAGE_SLOTS = ['', '', ''];
const GOOGLE_MAPS_URL = 'https://www.google.com/maps';
const MAP_COORDINATE_PRECISION = 6;

const formatVisitDate = (value: string | Date | null) => {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeImageSlots = (images?: string[]) => {
  return EMPTY_IMAGE_SLOTS.map((_, index) => images?.[index] ?? '');
};

const getNameInitials = (fullName: string) => {
  const segments = fullName.trim().split(/\s+/).filter(Boolean);

  if (segments.length === 0) {
    return '?';
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment.charAt(0))
    .join('')
    .toUpperCase();
};

const formatStudentAddress = (row?: {
  addressLine1?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postcode?: string | null;
}) => {
  if (!row) {
    return '-';
  }

  const address = [row.addressLine1, row.subdistrict, row.district, row.province, row.postcode]
    .filter(Boolean)
    .join(' ')
    .trim();

  return address || '-';
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeCoordinate = (value: number) => {
  return Number(value.toFixed(MAP_COORDINATE_PRECISION));
};

const parseCoordinatePair = (value: string) => {
  const match = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);

  if (!match) {
    return null;
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude: normalizeCoordinate(latitude),
    longitude: normalizeCoordinate(longitude),
  };
};

const buildCoordinateText = (latitude: number, longitude: number) => {
  return `${normalizeCoordinate(latitude)}, ${normalizeCoordinate(longitude)}`;
};

const buildGoogleMapsUrl = (latitude: number, longitude: number) => {
  return `${GOOGLE_MAPS_URL}?q=${latitude},${longitude}`;
};

const buildGoogleMapsEmbedUrl = (mapData?: VisitMapData | null) => {
  if (!mapData) {
    return null;
  }

  const query =
    mapData.coordinates?.trim() ||
    (mapData.latitude !== null &&
    mapData.latitude !== undefined &&
    mapData.longitude !== null &&
    mapData.longitude !== undefined
      ? buildCoordinateText(mapData.latitude, mapData.longitude)
      : '') ||
    mapData.placeLabel?.trim() ||
    '';

  if (!query) {
    return null;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=th&output=embed`;
};

const extractCoordinatesFromMapInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const directCoordinates = parseCoordinatePair(trimmed);

  if (directCoordinates) {
    return directCoordinates;
  }

  const patternMatches = [
    trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/),
    trimmed.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/),
    trimmed.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/),
  ];

  for (const match of patternMatches) {
    if (!match) {
      continue;
    }

    const coordinates = parseCoordinatePair(`${match[1]},${match[2]}`);

    if (coordinates) {
      return coordinates;
    }
  }

  try {
    const url = new URL(trimmed);
    const mapQuery = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('ll');

    if (mapQuery) {
      const coordinates = parseCoordinatePair(mapQuery);

      if (coordinates) {
        return coordinates;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const getVisitDetailData = (value: VisitDetailData | null | undefined) => {
  return isRecord(value)
    ? (value as VisitDetailData & Record<string, unknown>)
    : ({} as VisitDetailData & Record<string, unknown>);
};

const getVisitMapData = (visitDetail?: VisitDetailData | null, visitMap?: string | null): VisitMapData | null => {
  const detail = getVisitDetailData(visitDetail);
  const rawMapData = detail.mapData;
  const mapData = isRecord(rawMapData) ? (rawMapData as VisitMapData) : null;
  const fallbackCoordinates = visitMap ? extractCoordinatesFromMapInput(visitMap) : null;
  const latitude = mapData?.latitude ?? fallbackCoordinates?.latitude ?? null;
  const longitude = mapData?.longitude ?? fallbackCoordinates?.longitude ?? null;
  const googleMapsUrl =
    mapData?.googleMapsUrl ??
    visitMap ??
    (latitude !== null && longitude !== null ? buildGoogleMapsUrl(latitude, longitude) : null);
  const coordinates =
    mapData?.coordinates ?? (latitude !== null && longitude !== null ? buildCoordinateText(latitude, longitude) : null);

  if (!googleMapsUrl && !coordinates && !mapData?.placeLabel && !mapData?.landmark && !mapData?.travelNote) {
    return null;
  }

  return {
    mapSource: 'google-maps',
    googleMapsUrl,
    latitude,
    longitude,
    coordinates,
    placeLabel: mapData?.placeLabel ?? null,
    landmark: mapData?.landmark ?? null,
    travelNote: mapData?.travelNote ?? null,
  };
};

const buildVisitMapPayload = (mapInput: string, placeLabel: string, landmark: string, travelNote: string) => {
  const trimmed = mapInput.trim();

  if (!trimmed) {
    return null;
  }

  const coordinates = extractCoordinatesFromMapInput(trimmed);
  const isUrl = /^https?:\/\//i.test(trimmed);

  if (!coordinates && !isUrl) {
    return null;
  }

  const latitude = coordinates?.latitude ?? null;
  const longitude = coordinates?.longitude ?? null;
  const googleMapsUrl = isUrl
    ? trimmed
    : latitude !== null && longitude !== null
      ? buildGoogleMapsUrl(latitude, longitude)
      : trimmed;

  return {
    visitMap: googleMapsUrl,
    mapData: {
      mapSource: 'google-maps',
      googleMapsUrl,
      latitude,
      longitude,
      coordinates: latitude !== null && longitude !== null ? buildCoordinateText(latitude, longitude) : null,
      placeLabel: placeLabel.trim() || null,
      landmark: landmark.trim() || null,
      travelNote: travelNote.trim() || null,
    } satisfies VisitMapData,
  };
};

const toApiDate = (value: Date) => {
  const offsetDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
};

const VisitStatusChip = ({ row }: { row: TeacherVisitStudentRow }) => {
  const isRecorded = row.visitStatus === 'recorded';

  return (
    <Chip
      id={`visit-status-chip-${row.id}`}
      size='small'
      color={isRecorded ? 'success' : 'warning'}
      label={isRecorded ? 'บันทึกแล้ว' : 'ยังไม่บันทึก'}
      variant={isRecorded ? 'filled' : 'outlined'}
      sx={{ fontWeight: 700 }}
    />
  );
};

const VisitImagePreviewCell = ({ row }: { row: TeacherVisitStudentRow }) => {
  const validImages = row.images.filter((image) => typeof image === 'string' && image.trim() !== '');

  if (validImages.length === 0) {
    return (
      <Chip
        id={`visit-images-empty-chip-${row.id}`}
        size='small'
        label='ยังไม่มีรูป'
        variant='outlined'
        color='default'
      />
    );
  }

  return (
    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
      {validImages.slice(0, 3).map((image, index) => (
        <Box
          key={`${row.id}-image-${index}`}
          component='img'
          src={image}
          alt={`visit-${row.studentId}-${index + 1}`}
          sx={{
            width: 48,
            height: 36,
            borderRadius: 1.5,
            objectFit: 'cover',
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            boxShadow: (theme) => `0 4px 10px ${alpha(theme.palette.common.black, 0.15)}`,
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'zoom-in',
            '&:hover': {
              transform: 'scale(1.35) translateY(-2px)',
              zIndex: 10,
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.common.black, 0.22)}`,
            },
          }}
        />
      ))}
    </Stack>
  );
};

const VisitInfoRow = ({ label, value, id }: { label: string; value: React.ReactNode; id?: string }) => {
  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        '&:last-of-type': {
          borderBottom: 'none',
          pb: 0,
        },
      }}
    >
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', fontWeight: 500, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography id={id} variant='body2' color='text.primary' sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
        {value ?? '-'}
      </Typography>
    </Box>
  );
};

interface VisitDetailDialogProps {
  open: boolean;
  row: TeacherVisitStudentRow | null;
  onClose: () => void;
}

const VisitDetailDialog = ({ open, row, onClose }: VisitDetailDialogProps) => {
  const { data: student, isLoading, error } = useStudent(open && row ? row.studentKey : '');
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);

  const studentAccount = student?.user?.account;
  const visitMapData = row ? getVisitMapData(row.visitDetail, row.visitMap) : null;
  const visitEmbedUrl = buildGoogleMapsEmbedUrl(visitMapData);
  const visitMapUrl =
    visitMapData?.googleMapsUrl ??
    (visitMapData?.latitude !== null &&
    visitMapData?.latitude !== undefined &&
    visitMapData?.longitude !== null &&
    visitMapData?.longitude !== undefined
      ? buildGoogleMapsUrl(visitMapData.latitude, visitMapData.longitude)
      : null);
  const studentFullName = student
    ? `${student.user.account?.title ?? ''}${student.user.account?.firstName ?? ''} ${student.user.account?.lastName ?? ''}`.trim()
    : (row?.fullName ?? '-');
  const studentAvatar = studentAccount?.avatar ?? undefined;
  const studentAddress = formatStudentAddress(studentAccount);
  const validImages = row ? row.images.filter((image) => typeof image === 'string' && image.trim() !== '') : [];

  useEffect(() => {
    setIsMapPreviewOpen(false);
  }, [open, row?.id]);

  return (
    <Dialog
      id='visit-detail-dialog'
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='lg'
      aria-labelledby='visit-detail-dialog-title'
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 24px 48px ${alpha(theme.palette.common.black, 0.4)}`
              : `0 24px 48px ${alpha(theme.palette.primary.main, 0.16)}`,
        },
      }}
    >
      <DialogTitle id='visit-detail-dialog-title' sx={{ p: 5 }}>
        <Stack direction='row' sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              ข้อมูลนักเรียนและการเยี่ยมบ้าน
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              รายละเอียดประวัตินักเรียนและข้อมูลแผนที่บ้านสำหรับการเยี่ยมบ้านของครูที่ปรึกษา
            </Typography>
          </Box>
          <IconButton
            id='visit-detail-close-header-button'
            aria-label='close'
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              p: 1.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent id='visit-detail-dialog-content' sx={{ px: 5, py: 0 }}>
        {!row ? null : isLoading ? (
          <Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress id='visit-detail-loading' size={30} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {error ? (
              <Grid size={12}>
                <Alert severity='warning' id='visit-detail-error-alert'>
                  {getErrorMessage(error)}
                </Alert>
              </Grid>
            ) : null}
            <Grid size={12}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={4}
                sx={{
                  alignItems: { xs: 'flex-start', md: 'center' },
                  p: 5,
                  borderRadius: 3,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.03),
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.08)}`,
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? `0 10px 30px ${alpha(theme.palette.common.black, 0.2)}`
                      : `0 10px 30px ${alpha(theme.palette.primary.main, 0.04)}`,
                }}
              >
                <Avatar
                  id='visit-detail-student-avatar'
                  src={studentAvatar}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  {getNameInitials(studentFullName)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant='h5' sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                    {studentFullName}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                    รหัสนักเรียน: <span style={{ fontWeight: 700 }}>{row.studentId}</span>
                  </Typography>
                  <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', mt: 2, rowGap: 1.5 }}>
                    <Chip
                      id='visit-detail-classroom-chip'
                      size='small'
                      label={row.classroomName}
                      color='primary'
                      variant='outlined'
                      sx={{ fontWeight: 600 }}
                    />
                    <VisitStatusChip row={row} />
                    {row.visitNo ? (
                      <Chip
                        id='visit-detail-visit-no-chip'
                        size='small'
                        label={`เยี่ยมบ้านครั้งที่ ${row.visitNo}`}
                        color='success'
                        variant='filled'
                        sx={{ fontWeight: 700, color: 'common.white' }}
                      />
                    ) : (
                      <Chip
                        id='visit-detail-visit-no-chip'
                        size='small'
                        label='ยังไม่เคยบันทึกเยี่ยมบ้าน'
                        color='default'
                        variant='outlined'
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  height: '100%',
                  p: 5,
                  borderRadius: 3,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `0 4px 18px ${alpha(theme.palette.common.black, 0.03)}`,
                }}
              >
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  ข้อมูลประวัตินักเรียน
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow label='ชื่อ-นามสกุล' value={studentFullName} id='detail-info-fullname' />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow label='รหัสนักเรียน' value={row.studentId} id='detail-info-student-id' />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow label='เบอร์โทรศัพท์' value={studentAccount?.phone || '-'} id='detail-info-phone' />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow
                      label='เลขบัตรประชาชน'
                      value={studentAccount?.idCard || '-'}
                      id='detail-info-idcard'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow
                      label='วันเกิด'
                      value={formatVisitDate(studentAccount?.birthDate ?? null)}
                      id='detail-info-birthdate'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow
                      label='ห้องเรียน'
                      value={student?.classroom?.name || row.classroomName}
                      id='detail-info-classroom'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow
                      label='ระดับชั้น'
                      value={student?.level?.levelFullName || '-'}
                      id='detail-info-level'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <VisitInfoRow label='สาขาวิชา' value={student?.program?.name || '-'} id='detail-info-program' />
                  </Grid>
                  <Grid size={12}>
                    <VisitInfoRow
                      label='แผนกวิชา'
                      value={student?.department?.name || '-'}
                      id='detail-info-department'
                    />
                  </Grid>
                  <Grid size={12}>
                    <VisitInfoRow
                      label='ที่อยู่ตามทะเบียนบ้าน/ที่พักอาศัย'
                      value={studentAddress}
                      id='detail-info-address'
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={4} sx={{ height: '100%' }}>
                <Box
                  sx={{
                    p: 5,
                    borderRadius: 3,
                    border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    bgcolor: 'background.paper',
                    boxShadow: (theme) => `0 4px 18px ${alpha(theme.palette.common.black, 0.03)}`,
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    สรุปการตรวจเยี่ยม
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={6}>
                      <VisitInfoRow
                        label='สถานะการเยี่ยมบ้าน'
                        value={row.visitStatus === 'recorded' ? 'เยี่ยมบ้านแล้ว' : 'รอบันทึกข้อมูล'}
                        id='detail-visit-status'
                      />
                    </Grid>
                    <Grid size={6}>
                      <VisitInfoRow
                        label='วันที่ลงพื้นที่เยี่ยมบ้าน'
                        value={formatVisitDate(row.visitDate)}
                        id='detail-visit-date'
                      />
                    </Grid>
                    <Grid size={12}>
                      <VisitInfoRow
                        label='จำนวนรูปถ่ายหลักฐาน'
                        value={validImages.length ? `${validImages.length} รูปถ่าย` : 'ไม่มีรูปถ่าย'}
                        id='detail-visit-image-count'
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  sx={{
                    p: 5,
                    borderRadius: 3,
                    border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    bgcolor: 'background.paper',
                    boxShadow: (theme) => `0 4px 18px ${alpha(theme.palette.common.black, 0.03)}`,
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    พิกัดตำแหน่งและแผนที่บ้าน
                  </Typography>
                  {visitMapData ? (
                    <>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mb: 4 }}>
                        {visitEmbedUrl ? (
                          <Button
                            id='visit-detail-toggle-map-preview-button'
                            variant={isMapPreviewOpen ? 'contained' : 'outlined'}
                            color='success'
                            fullWidth
                            size='small'
                            onClick={() => setIsMapPreviewOpen((current) => !current)}
                            sx={{ px: 3, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                          >
                            {isMapPreviewOpen ? 'ซ่อนแผนที่' : 'แสดงแผนที่'}
                          </Button>
                        ) : null}
                        {visitMapUrl ? (
                          <Button
                            id='visit-detail-open-map-button'
                            component='a'
                            href={visitMapUrl}
                            target='_blank'
                            rel='noreferrer'
                            variant='outlined'
                            color='primary'
                            fullWidth
                            size='small'
                            sx={{ px: 3, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                          >
                            เปิดใน Google Maps
                          </Button>
                        ) : null}
                      </Stack>
                      {visitEmbedUrl ? (
                        <Collapse in={isMapPreviewOpen} timeout='auto' unmountOnExit>
                          <Box
                            sx={{
                              mb: 4,
                              p: 1.5,
                              borderRadius: 2.5,
                              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                              bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03),
                            }}
                          >
                            <Box
                              component='iframe'
                              title='visit-detail-map-preview'
                              src={visitEmbedUrl}
                              loading='lazy'
                              referrerPolicy='no-referrer-when-downgrade'
                              sx={{
                                width: '100%',
                                height: { xs: 240, md: 280 },
                                border: 0,
                                borderRadius: 2,
                                display: 'block',
                              }}
                            />
                          </Box>
                        </Collapse>
                      ) : null}
                      <Grid container spacing={2.5}>
                        <Grid size={12}>
                          <VisitInfoRow
                            label='ชื่อจุดหมุด/ชื่อเรียกตำแหน่งบ้าน'
                            value={visitMapData.placeLabel || '-'}
                            id='detail-map-label'
                          />
                        </Grid>
                        <Grid size={6}>
                          <VisitInfoRow label='Latitude' value={visitMapData.latitude ?? '-'} id='detail-map-lat' />
                        </Grid>
                        <Grid size={6}>
                          <VisitInfoRow label='Longitude' value={visitMapData.longitude ?? '-'} id='detail-map-lng' />
                        </Grid>
                        <Grid size={12}>
                          <VisitInfoRow
                            label='จุดสังเกตเด่นใกล้บ้าน'
                            value={visitMapData.landmark || '-'}
                            id='detail-map-landmark'
                          />
                        </Grid>
                        <Grid size={12}>
                          <VisitInfoRow
                            label='หมายเหตุการเดินทาง'
                            value={visitMapData.travelNote || '-'}
                            id='detail-map-note'
                          />
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <Alert severity='info' id='visit-detail-no-map-alert' sx={{ mt: 2 }}>
                      นักเรียนคนนี้ยังไม่มีข้อมูลพิกัดบ้านจาก Google Maps
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Grid>

            <Grid size={12}>
              <Box
                sx={{
                  p: 5,
                  borderRadius: 3,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => `0 4px 18px ${alpha(theme.palette.common.black, 0.03)}`,
                }}
              >
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  รูปถ่ายบ้านที่เยี่ยมเยียน
                </Typography>
                {validImages.length ? (
                  <Grid container spacing={3}>
                    {validImages.map((image, index) => (
                      <Grid key={`${row.id}-detail-image-${index}`} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.05)
                                : alpha(theme.palette.primary.main, 0.02),
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: (theme) => `0 12px 28px ${alpha(theme.palette.common.black, 0.15)}`,
                            },
                          }}
                        >
                          <Box
                            component='img'
                            src={image}
                            alt={`visit-detail-home-${index + 1}`}
                            sx={{
                              width: '100%',
                              aspectRatio: '4 / 3',
                              objectFit: 'cover',
                              display: 'block',
                              borderRadius: 2,
                              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                            }}
                          />
                          <Typography
                            variant='body2'
                            sx={{ mt: 2, fontWeight: 700, color: 'text.primary', textAlign: 'center' }}
                          >
                            ภาพประกอบหลักฐานที่ {index + 1}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity='info' id='visit-detail-no-images-alert'>
                    นักเรียนคนนี้ยังไม่มีรูปถ่ายบ้านที่อัปโหลดเข้าสู่ระบบ
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 5, pt: 3 }}>
        <Button
          id='visit-detail-close-button'
          variant='outlined'
          onClick={onClose}
          sx={{ px: 5.5, py: 1.875, borderRadius: '5px', fontWeight: 600 }}
        >
          ปิดหน้าต่าง
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface VisitDialogProps {
  open: boolean;
  row: TeacherVisitStudentRow | null;
  onClose: () => void;
}

const VisitDialog = ({ open, row, onClose }: VisitDialogProps) => {
  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [images, setImages] = useState<string[]>(EMPTY_IMAGE_SLOTS);
  const [mapInput, setMapInput] = useState('');
  const [mapPlaceLabel, setMapPlaceLabel] = useState('');
  const [mapLandmark, setMapLandmark] = useState('');
  const [mapTravelNote, setMapTravelNote] = useState('');
  const [mapPreview, setMapPreview] = useState<VisitMapData | null>(null);
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);
  const [mapError, setMapError] = useState('');
  const [resizingSlots, setResizingSlots] = useState<number[]>([]);
  const [dialogError, setDialogError] = useState('');

  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();
  const isSaving = createVisit.isPending || updateVisit.isPending;
  const mapEmbedUrl = buildGoogleMapsEmbedUrl(mapPreview);

  useEffect(() => {
    if (!open || !row) {
      return;
    }

    const initialMapData = getVisitMapData(row.visitDetail, row.visitMap);

    setVisitDate(row.visitDate ? new Date(row.visitDate) : new Date());
    setImages(normalizeImageSlots(row.images));
    setMapInput(initialMapData?.googleMapsUrl ?? initialMapData?.coordinates ?? row.visitMap ?? '');
    setMapPlaceLabel(initialMapData?.placeLabel ?? '');
    setMapLandmark(initialMapData?.landmark ?? '');
    setMapTravelNote(initialMapData?.travelNote ?? '');
    setMapPreview(initialMapData);
    setIsMapPreviewOpen(false);
    setMapError('');
    setDialogError('');
    setResizingSlots([]);
  }, [open, row]);

  const handleResolveMap = () => {
    const mapResult = buildVisitMapPayload(mapInput, mapPlaceLabel, mapLandmark, mapTravelNote);

    if (!mapInput.trim()) {
      setMapPreview(null);
      setMapError('');
      return;
    }

    if (!mapResult) {
      const message = 'กรุณาวางลิงก์ Google Maps หรือกรอกพิกัดรูปแบบ lat,lng';
      setMapError(message);
      toast.error(message);
      return;
    }

    setMapInput(mapResult.visitMap);
    setMapPreview(mapResult.mapData);
    setIsMapPreviewOpen(true);
    setMapError('');
    toast.success(mapResult.mapData.coordinates ? 'อ่านพิกัดบ้านจาก Google Maps แล้ว' : 'บันทึกลิงก์แผนที่แล้ว');
  };

  const handleOpenGoogleMaps = () => {
    const targetUrl = mapPreview?.googleMapsUrl || mapInput.trim() || GOOGLE_MAPS_URL;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleImageChange = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    setResizingSlots((current) => [...current, index]);

    try {
      const resized = await resizeImageToDataUrl(file, RESIZE_TARGET);
      setImages((current) => {
        const next = [...current];
        next[index] = resized;
        return next;
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResizingSlots((current) => current.filter((item) => item !== index));
    }
  };

  const handleClearImage = (index: number) => {
    setImages((current) => {
      const next = [...current];
      next[index] = '';
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!row) {
      return;
    }

    if (!visitDate) {
      setDialogError('กรุณาเลือกวันที่เยี่ยมบ้าน');
      return;
    }

    if (images.some((image) => !image)) {
      setDialogError('กรุณาอัปโหลดรูปภาพให้ครบ 3 รูป');
      return;
    }

    setDialogError('');

    const hasMapNotes = [mapPlaceLabel, mapLandmark, mapTravelNote].some((value) => value.trim());
    const currentVisitDetail = getVisitDetailData(row.visitDetail);
    const mapResult = mapInput.trim()
      ? buildVisitMapPayload(mapInput, mapPlaceLabel, mapLandmark, mapTravelNote)
      : null;

    if ((mapInput.trim() || hasMapNotes) && !mapResult) {
      const message = 'กรุณาวางลิงก์ Google Maps หรือกรอกพิกัดรูปแบบ lat,lng';
      setDialogError(message);
      setMapError(message);
      return;
    }

    if (hasMapNotes && !mapInput.trim()) {
      const message = 'กรุณากรอกลิงก์ Google Maps หรือพิกัดบ้านก่อนบันทึกข้อมูลแมพ';
      setDialogError(message);
      setMapError(message);
      return;
    }

    const { mapData: _removedMapData, ...remainingVisitDetail } = currentVisitDetail;
    const visitDetail = mapResult
      ? ({ ...remainingVisitDetail, mapData: mapResult.mapData } as VisitDetailData)
      : Object.keys(remainingVisitDetail).length > 0
        ? (remainingVisitDetail as VisitDetailData)
        : null;

    const payload: VisitPayload = {
      studentKey: row.studentKey,
      studentId: row.studentId,
      classroomId: row.classroomId || '',
      visitDate: toApiDate(visitDate),
      images,
      visitMap: mapResult?.visitMap ?? null,
      visitDetail,
    };

    try {
      if (row.visitId) {
        await updateVisit.mutateAsync({ visitId: row.visitId, params: payload });
      } else {
        await createVisit.mutateAsync(payload);
      }

      toast.success(row.visitStatus === 'recorded' ? 'อัปเดตข้อมูลเยี่ยมบ้านสำเร็จ' : 'บันทึกข้อมูลเยี่ยมบ้านสำเร็จ');
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      setDialogError(message);
      toast.error(message);
    }
  };

  return (
    <Dialog
      id='visit-record-dialog'
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth='lg'
      aria-labelledby='visit-record-dialog-title'
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 24px 48px ${alpha(theme.palette.common.black, 0.4)}`
              : `0 24px 48px ${alpha(theme.palette.primary.main, 0.16)}`,
        },
      }}
    >
      <DialogTitle id='visit-record-dialog-title' sx={{ p: 5 }}>
        <Stack direction='row' sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {row?.visitStatus === 'recorded' ? 'แก้ไขข้อมูลการเยี่ยมบ้าน' : 'บันทึกผลการเยี่ยมบ้านนักเรียน'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              กรอกข้อมูลพิกัดสถานที่บ้านและอัปโหลดรูปภาพถ่ายหลักฐานเพื่อบันทึกการลงพื้นที่จริงของครูที่ปรึกษา
            </Typography>
          </Box>
          <IconButton
            id='visit-record-close-header-button'
            aria-label='close'
            onClick={onClose}
            disabled={isSaving}
            sx={{
              color: 'text.secondary',
              p: 1.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent id='visit-record-dialog-content' sx={{ px: 5, py: 0 }}>
        {row ? (
          <Grid container spacing={5}>
            <Grid size={12}>
              <Alert severity='info' id='visit-record-dialog-info'>
                ระบบรองรับไฟล์รูปภาพทั่วไปและจะทำการปรับขนาดความละเอียดภาพประกอบทุกใบเป็นขนาด 800x600
                พิกเซลอัตโนมัติเพื่อลดขนาดไฟล์ข้อมูล
              </Alert>
            </Grid>
            {dialogError ? (
              <Grid size={12}>
                <Alert severity='error' id='visit-record-dialog-error'>
                  {dialogError}
                </Alert>
              </Grid>
            ) : null}

            <Grid size={12}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 500, mb: 2 }}>
                ข้อมูลส่วนตัวนักเรียน
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id='visit-record-student-id'
                    fullWidth
                    label='รหัสนักเรียน'
                    value={row.studentId}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id='visit-record-student-name'
                    fullWidth
                    label='ชื่อ-นามสกุล'
                    value={row.fullName}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id='visit-record-classroom'
                    fullWidth
                    label='ห้องเรียน'
                    value={row.classroomName}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={12}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 500, mb: 2 }}>
                ข้อมูลการลงพื้นที่เยี่ยมบ้าน
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <ThaiDatePicker
                    label='วันที่เยี่ยมบ้าน'
                    value={visitDate}
                    onChange={setVisitDate}
                    format='dd MMMM yyyy'
                    maxDate={new Date()}
                    placeholder='เลือกวันที่เยี่ยมบ้าน'
                    slotProps={{
                      textField: {
                        id: 'visit-record-date',
                        helperText: 'สามารถเลือกวันที่ย้อนหลังได้หากเป็นการบันทึกผลลงพื้นที่ย้อนหลัง',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={12}>
              <Box
                sx={{
                  p: 5,
                  borderRadius: 3,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.04)
                      : alpha(theme.palette.primary.main, 0.01),
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={3}
                  sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-start' }, mb: 3 }}
                >
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 500, mb: 0.5 }}>
                      พิกัดตำแหน่งบ้านจาก Google Maps
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      วางลิงก์แชร์จาก Google Maps หรือคัดลอกพิกัดแบบ Latitude, Longitude
                      จากแอปแผนที่เพื่อดึงข้อมูลอัตโนมัติ
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      id='visit-map-open-google-button'
                      variant='outlined'
                      color='secondary'
                      onClick={handleOpenGoogleMaps}
                      sx={{ px: 4, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                    >
                      เปิด Google Maps
                    </Button>
                    <Button
                      id='visit-map-resolve-button'
                      variant='contained'
                      color='info'
                      onClick={handleResolveMap}
                      disabled={!mapInput.trim()}
                      sx={{ px: 4, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                    >
                      อ่านพิกัด
                    </Button>
                    {mapEmbedUrl ? (
                      <Button
                        id='visit-map-toggle-preview-button'
                        variant={isMapPreviewOpen ? 'contained' : 'outlined'}
                        color='success'
                        onClick={() => setIsMapPreviewOpen((current) => !current)}
                        sx={{ px: 4, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                      >
                        {isMapPreviewOpen ? 'ซ่อนแผนที่' : 'แสดงแผนที่'}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>

                {mapError ? (
                  <Alert severity='warning' id='visit-map-error-alert' sx={{ mb: 3 }}>
                    {mapError}
                  </Alert>
                ) : null}

                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <TextField
                      id='visit-map-input'
                      fullWidth
                      label='ลิงก์ Google Maps หรือตัวเลขพิกัด (Lat, Lng)'
                      placeholder='เช่น https://maps.google.com/... หรือ 13.756331,100.501762'
                      value={mapInput}
                      onChange={(event) => {
                        setMapInput(event.target.value);
                        setMapPreview(null);
                        setIsMapPreviewOpen(false);
                        if (mapError) {
                          setMapError('');
                        }
                      }}
                      helperText='รองรับรูปแบบลิงก์แชร์ทั้งหมด และตัวเลขพิกัดแบบ Latitude, Longitude'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-place-label'
                      fullWidth
                      label='ชื่อจุดสังเกตหลักหรือชื่อเรียกบ้าน'
                      placeholder='เช่น บ้านน้องต้น ซอย 3'
                      value={mapPlaceLabel}
                      onChange={(event) => setMapPlaceLabel(event.target.value)}
                      helperText='ใช้คีย์หลักในการจดจำตำแหน่งในแถวรายการ'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-coordinates'
                      fullWidth
                      label='พิกัดบ้านที่ถอดความได้'
                      value={mapPreview?.coordinates || '-'}
                      slotProps={{ input: { readOnly: true } }}
                      helperText='คำนวณและแสดงพิกัดโดยระบบอัตโนมัติ'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-latitude'
                      fullWidth
                      label='Latitude'
                      value={mapPreview?.latitude ?? '-'}
                      slotProps={{ input: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-longitude'
                      fullWidth
                      label='Longitude'
                      value={mapPreview?.longitude ?? '-'}
                      slotProps={{ input: { readOnly: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-landmark'
                      fullWidth
                      multiline
                      minRows={2}
                      label='จุดสังเกตสำคัญในระยะสายตา'
                      placeholder='เช่น ถัดจากเสาไฟแรงสูงต้นที่สอง หรือตรงข้ามร้านขายยาพอดี'
                      value={mapLandmark}
                      onChange={(event) => setMapLandmark(event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-travel-note'
                      fullWidth
                      multiline
                      minRows={2}
                      label='หมายเหตุ/คำสั่งเดินทาง'
                      placeholder='เช่น รถบัสหรือรถเก๋งคันใหญ่เข้าไม่ได้ ซอยค่อนข้างแคบ ควรจอดรถด้านนอกแล้วเดินเท้าเข้าไป'
                      value={mapTravelNote}
                      onChange={(event) => setMapTravelNote(event.target.value)}
                    />
                  </Grid>
                </Grid>

                {mapEmbedUrl ? (
                  <Collapse in={isMapPreviewOpen} timeout='auto' unmountOnExit>
                    <Box
                      sx={{
                        mt: 4,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                        bgcolor: 'background.paper',
                        boxShadow: (theme) => `0 6px 18px ${alpha(theme.palette.common.black, 0.05)}`,
                      }}
                    >
                      <Box
                        component='iframe'
                        title='visit-map-preview'
                        src={mapEmbedUrl}
                        loading='lazy'
                        referrerPolicy='no-referrer-when-downgrade'
                        sx={{
                          width: '100%',
                          height: { xs: 260, md: 320 },
                          border: 0,
                          borderRadius: 2,
                          display: 'block',
                        }}
                      />
                    </Box>
                  </Collapse>
                ) : null}
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontWeight: 500, mb: 2 }}>
                รูปถ่ายบรรยากาศการเยี่ยมบ้าน (จำเป็นต้องมีครบ 3 รูป)
              </Typography>
              <Grid container spacing={3}>
                {images.map((image, index) => {
                  const isProcessing = resizingSlots.includes(index);

                  return (
                    <Grid key={`visit-image-slot-${index}`} size={{ xs: 12, md: 4 }}>
                      <Box
                        sx={{
                          height: '100%',
                          p: 4,
                          borderRadius: 3,
                          border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.primary.main, 0.06)
                              : alpha(theme.palette.primary.main, 0.02),
                          transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: 'primary.main',
                            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
                          },
                        }}
                      >
                        <Typography
                          id={`visit-image-slot-title-${index + 1}`}
                          variant='subtitle2'
                          sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
                        >
                          ภาพประกอบการเยี่ยมบ้านใบที่ {index + 1}
                        </Typography>
                        <Box
                          sx={{
                            height: 180,
                            borderRadius: 2.5,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            mb: 2.5,
                            position: 'relative',
                            boxShadow: (theme) => `inset 0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                          }}
                        >
                          {isProcessing ? (
                            <CircularProgress id={`visit-image-processing-${index + 1}`} size={28} />
                          ) : image ? (
                            <Box
                              component='img'
                              src={image}
                              alt={`visit-preview-${index + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center', px: 3 }}>
                              <Typography variant='body2' sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                ยังไม่มีรูปภาพที่อัปโหลด
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Stack direction='row' spacing={2}>
                          <Button
                            id={`visit-image-upload-button-${index + 1}`}
                            component='label'
                            variant='contained'
                            color='primary'
                            fullWidth
                            disabled={isSaving || isProcessing}
                            sx={{ px: 3, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                          >
                            อัปโหลด
                            <input
                              id={`visit-image-input-${index + 1}`}
                              hidden
                              type='file'
                              accept='image/*'
                              onChange={(event) => {
                                void handleImageChange(index, event.target.files?.[0]);
                                event.target.value = '';
                              }}
                            />
                          </Button>
                          <Button
                            id={`visit-image-clear-button-${index + 1}`}
                            variant='outlined'
                            color='secondary'
                            fullWidth
                            disabled={!image || isSaving || isProcessing}
                            onClick={() => handleClearImage(index)}
                            sx={{ px: 3, py: 1.5, borderRadius: '5px', fontWeight: 600 }}
                          >
                            ล้างรูป
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 5, pt: 3 }}>
        <Button
          id='visit-record-cancel-button'
          variant='outlined'
          onClick={onClose}
          disabled={isSaving}
          sx={{ px: 5.5, py: 1.875, borderRadius: '5px', fontWeight: 600 }}
        >
          ยกเลิก
        </Button>
        <Button
          id='visit-record-save-button'
          variant='contained'
          onClick={() => void handleSubmit()}
          disabled={isSaving || resizingSlots.length > 0}
          sx={{ px: 5.5, py: 1.875, borderRadius: '5px', fontWeight: 600, boxShadow: 3 }}
        >
          {isSaving
            ? 'กำลังบันทึก...'
            : row?.visitStatus === 'recorded'
              ? 'อัปเดตข้อมูลเยี่ยมบ้าน'
              : 'บันทึกข้อมูลเยี่ยมบ้าน'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const VisitListPage = () => {
  const theme = useTheme();
  const isTabletDown = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, loading, isInitialized } = useAuth();

  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [detailRow, setDetailRow] = useState<TeacherVisitStudentRow | null>(null);
  const [selectedRow, setSelectedRow] = useState<TeacherVisitStudentRow | null>(null);

  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const advisorClassroomIds = useMemo(
    () => getAdvisorClassroomIds(user),
    [user?.teacherOnClassroom, user?.teacher?.classrooms],
  );
  const hasAdvisorClassrooms = advisorClassroomIds.length > 0;

  const {
    data: advisorStudents = [],
    isLoading,
    isFetching,
  } = useTeacherVisitStudents(undefined, {
    enabled: Boolean(isInitialized && !loading && isTeacher),
    advisorClassroomIds,
  });
  const hasAdvisorStudentScope = hasAdvisorClassrooms || advisorStudents.length > 0;
  const showNoAdvisorScopeAlert = Boolean(
    isInitialized && !loading && isTeacher && !isLoading && !isFetching && !hasAdvisorStudentScope,
  );

  const classroomOptions = useMemo(() => {
    const classroomMap = new Map<string, { id: string; name: string }>();

    advisorStudents.forEach((student) => {
      if (student.classroomId && !classroomMap.has(student.classroomId)) {
        classroomMap.set(student.classroomId, {
          id: student.classroomId,
          name: student.classroomName,
        });
      }
    });

    return Array.from(classroomMap.values()).sort((left, right) => left.name.localeCompare(right.name, 'th'));
  }, [advisorStudents]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return sortStudentsByStudentId(advisorStudents).filter((row) => {
      const matchesClassroom = selectedClassroomId ? row.classroomId === selectedClassroomId : true;
      const matchesSearch =
        !normalizedSearch ||
        [row.studentId, row.fullName, row.classroomName].some((value) =>
          value?.toLowerCase().includes(normalizedSearch),
        );

      return matchesClassroom && matchesSearch;
    });
  }, [advisorStudents, searchValue, selectedClassroomId]);

  const summaryItems = useMemo<ListSummaryItem[]>(() => {
    const recordedCount = filteredRows.filter((row) => row.visitStatus === 'recorded').length;
    const pendingCount = filteredRows.length - recordedCount;
    const classroomCount = new Set(filteredRows.map((row) => row.classroomId).filter(Boolean)).size;

    return [
      { label: 'ห้องที่ดูแล', value: classroomCount, color: 'info' },
      { label: 'บันทึกแล้ว', value: recordedCount, color: 'success' },
      { label: 'รอบันทึก', value: pendingCount, color: 'warning' },
    ];
  }, [filteredRows]);

  const columns = useMemo<GridColDef<TeacherVisitStudentRow>[]>(
    () => [
      {
        flex: 0.12,
        minWidth: 130,
        field: 'studentId',
        headerName: 'รหัสนักเรียน',
        sortable: false,
      },
      {
        flex: 0.24,
        minWidth: 250,
        field: 'fullName',
        headerName: 'ชื่อ-นามสกุล',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Stack direction='row' spacing={1.75} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Avatar
              id={`visit-student-avatar-${row.id}`}
              sx={{
                width: 40,
                height: 40,
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.14),
                color: 'primary.main',
                fontWeight: 800,
              }}
            >
              {getNameInitials(row.fullName)}
            </Avatar>
            <Typography noWrap variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {row.fullName}
            </Typography>
          </Stack>
        ),
      },
      {
        flex: 0.16,
        minWidth: 170,
        field: 'classroomName',
        headerName: 'ห้องเรียน',
        sortable: false,
      },
      {
        flex: 0.14,
        minWidth: 150,
        field: 'visitStatus',
        headerName: 'สถานะบันทึก',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => <VisitStatusChip row={row} />,
      },
      {
        flex: 0.14,
        minWidth: 160,
        field: 'visitDate',
        headerName: 'วันที่เยี่ยมบ้าน',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Typography
            variant='body2'
            sx={{ color: row.visitDate ? 'text.primary' : 'text.secondary', fontWeight: row.visitDate ? 600 : 500 }}
          >
            {formatVisitDate(row.visitDate)}
          </Typography>
        ),
      },
      {
        flex: 0.14,
        minWidth: 170,
        field: 'images',
        headerName: 'รูปภาพ',
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => <VisitImagePreviewCell row={row} />,
      },
      {
        flex: 0.16,
        minWidth: 200,
        field: 'actions',
        headerName: 'การทำรายการ',
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Stack spacing={1} sx={{ width: '100%', py: 1 }}>
            <Button
              id={`visit-view-button-${row.id}`}
              variant='outlined'
              color='info'
              size='small'
              onClick={() => setDetailRow(row)}
            >
              ดูข้อมูล
            </Button>
            <Button
              id={`visit-action-button-${row.id}`}
              variant={row.visitStatus === 'recorded' ? 'outlined' : 'contained'}
              color={row.visitStatus === 'recorded' ? 'warning' : 'primary'}
              size='small'
              startIcon={row.visitStatus === 'recorded' ? <PencilOutline /> : <HomeOutline />}
              onClick={() => setSelectedRow(row)}
            >
              {row.visitStatus === 'recorded' ? 'แก้ไข' : 'บันทึก'}
            </Button>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <Grid container spacing={{ xs: 3, md: 5 }} id='visit-list-page-container'>
      <Grid size={12}>
        <AppListCard id='visit-list-card'>
          <AppListCardHeader
            id='visit-list-header'
            icon={<HomeOutline />}
            title='เยี่ยมบ้านนักเรียน'
            count={filteredRows.length}
            countUnit='คน'
            description='แสดงเฉพาะนักเรียนในห้องที่คุณได้รับมอบหมายเป็นครูที่ปรึกษาจากหน้าตั้งค่าบัญชี และบันทึกผลการเยี่ยมบ้านได้จากตารางเดียว'
            summaryItems={summaryItems}
          />

          {!isTeacher ? (
            <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
              <Alert severity='info' id='visit-list-role-alert'>
                หน้านี้สำหรับครูที่ปรึกษาเท่านั้น
              </Alert>
            </Box>
          ) : showNoAdvisorScopeAlert ? (
            <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
              <Alert severity='warning' id='visit-list-classroom-alert'>
                ยังไม่พบห้องที่คุณเป็นครูที่ปรึกษา หรือยังไม่มีรายชื่อนักเรียนในห้องที่ดูแล
                กรุณาตรวจสอบการตั้งค่าครูที่ปรึกษาและข้อมูลนักเรียนอีกครั้ง
              </Alert>
            </Box>
          ) : (
            <>
              <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      id='visit-list-classroom-filter'
                      options={classroomOptions}
                      value={classroomOptions.find((option) => option.id === selectedClassroomId) ?? null}
                      onChange={(_, newValue) => setSelectedClassroomId(newValue?.id ?? null)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          id='visit-list-classroom-input'
                          label='กรองตามห้องเรียน'
                          placeholder='เลือกห้องที่รับผิดชอบ'
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      id='visit-list-search-input'
                      fullWidth
                      label='ค้นหานักเรียน'
                      placeholder='ค้นหาจากรหัสนักเรียน ชื่อ-นามสกุล หรือห้องเรียน'
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                id='visit-list-datagrid-container'
                sx={{ px: { xs: 1.5, sm: 2.5, lg: 3 }, pb: { xs: 2.5, sm: 3.5 } }}
              >
                <AppListDataGrid
                  autoHeight
                  rows={filteredRows}
                  columns={columns as GridColDef[]}
                  loading={loading || isLoading || isFetching}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  getRowHeight={() => 'auto'}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: isTabletDown ? 10 : 25, page: 0 },
                    },
                  }}
                  slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                  }}
                  localeText={{
                    noRowsLabel: 'ไม่พบข้อมูลนักเรียนที่อยู่ในความดูแล',
                  }}
                  sx={{
                    '& .MuiDataGrid-main': {
                      minHeight: 420,
                    },
                    '& .MuiDataGrid-cell': {
                      px: isTabletDown ? 1.5 : 2.5,
                      py: 1.75,
                    },
                    '& .MuiDataGrid-columnHeader': {
                      px: isTabletDown ? 1.5 : 2.5,
                    },
                  }}
                />
              </Box>
            </>
          )}
        </AppListCard>
      </Grid>

      <VisitDetailDialog open={Boolean(detailRow)} row={detailRow} onClose={() => setDetailRow(null)} />

      <VisitDialog open={Boolean(selectedRow)} row={selectedRow} onClose={() => setSelectedRow(null)} />
    </Grid>
  );
};

export default VisitListPage;
