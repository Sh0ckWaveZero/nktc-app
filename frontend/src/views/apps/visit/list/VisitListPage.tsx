'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import HomeOutline from 'mdi-material-ui/HomeOutline';
import PencilOutline from 'mdi-material-ui/PencilOutline';
import EyeOutline from 'mdi-material-ui/EyeOutline';
import AccountOutline from 'mdi-material-ui/AccountOutline';
import MapMarkerOutline from 'mdi-material-ui/MapMarkerOutline';
import ImageOutline from 'mdi-material-ui/ImageOutline';
import CalendarCheckOutline from 'mdi-material-ui/CalendarCheckOutline';
import Close from 'mdi-material-ui/Close';
import OpenInNew from 'mdi-material-ui/OpenInNew';
import AppListDataGrid from '@/@core/components/data-grid/AppListDataGrid';
import CustomNoRowsOverlay from '@/@core/components/check-in/CustomNoRowsOverlay';
import { AppListCard, AppListCardHeader, type ListSummaryItem } from '@/@core/components/list-page';
import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import TableHeader from '@/views/apps/visit/list/TableHeader';
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
import { resizeImageToDataUrl } from '@/utils/resize-image';
import { sortStudentsByStudentId } from '@/utils/student-sort';
import { toast } from 'react-toastify';

const RESIZE_TARGET = { width: 800, height: 600 } as const;
const EMPTY_IMAGE_SLOTS = ['', '', ''];
const GOOGLE_MAPS_URL = 'https://www.google.com/maps';
const MAP_COORDINATE_PRECISION = 6;

const getAdvisorClassroomId = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const classroom = value as { id?: unknown; classroomId?: unknown };
  const classroomId = classroom.id ?? classroom.classroomId;

  return typeof classroomId === 'string' ? classroomId : null;
};

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

  return segments.slice(0, 2).map((segment) => segment.charAt(0)).join('').toUpperCase();
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
    (mapData.latitude !== null && mapData.latitude !== undefined && mapData.longitude !== null && mapData.longitude !== undefined
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
  return isRecord(value) ? (value as VisitDetailData & Record<string, unknown>) : ({} as VisitDetailData & Record<string, unknown>);
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
    mapData?.coordinates ??
    (latitude !== null && longitude !== null ? buildCoordinateText(latitude, longitude) : null);

  if (
    !googleMapsUrl &&
    !coordinates &&
    !mapData?.placeLabel &&
    !mapData?.landmark &&
    !mapData?.travelNote
  ) {
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

const buildVisitMapPayload = (
  mapInput: string,
  placeLabel: string,
  landmark: string,
  travelNote: string,
) => {
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
  const googleMapsUrl = isUrl ? trimmed : latitude !== null && longitude !== null ? buildGoogleMapsUrl(latitude, longitude) : trimmed;

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

const VisitStatusChip = memo(({ row }: { row: TeacherVisitStudentRow }) => {
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
});

const VisitImagePreviewCell = memo(({ row }: { row: TeacherVisitStudentRow }) => {
  if (!row.images.length) {
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
      {row.images.slice(0, 3).map((image, index) => (
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
            boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.common.black, 0.12)}`,
          }}
        />
      ))}
    </Stack>
  );
});

const VisitInfoRow = memo(({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ mb: 1.5, '&:last-of-type': { mb: 0 } }}>
    <Typography
      variant='caption'
      sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}
    >
      {label}
    </Typography>
    <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 700, wordBreak: 'break-word', fontSize: '0.9rem' }}>
      {value ?? '-'}
    </Typography>
  </Box>
));

const DetailSectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1),
        color: 'primary.main',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Typography variant='subtitle2' sx={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
      {children}
    </Typography>
  </Stack>
);

interface VisitDetailDialogProps {
  open: boolean;
  row: TeacherVisitStudentRow | null;
  onClose: () => void;
}

const VisitDetailDialog = ({ open, row, onClose }: VisitDetailDialogProps) => {
  const { data: student, isLoading, error } = useStudent(open && row ? row.studentKey : '');

  const studentAccount = student?.user?.account;
  const visitMapData = row ? getVisitMapData(row.visitDetail, row.visitMap) : null;
  const visitEmbedUrl = buildGoogleMapsEmbedUrl(visitMapData);
  const visitMapUrl =
    visitMapData?.googleMapsUrl ??
    (visitMapData?.latitude !== null && visitMapData?.latitude !== undefined && visitMapData?.longitude !== null && visitMapData?.longitude !== undefined
      ? buildGoogleMapsUrl(visitMapData.latitude, visitMapData.longitude)
      : null);
  const studentFullName = student
    ? `${student.user.account?.title ?? ''}${student.user.account?.firstName ?? ''} ${student.user.account?.lastName ?? ''}`.trim()
    : row?.fullName ?? '-';
  const studentAvatar = studentAccount?.avatar ?? undefined;
  const studentAddress = formatStudentAddress(studentAccount);
  const isRecorded = row?.visitStatus === 'recorded';

  return (
    <Dialog
      id='visit-detail-dialog'
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      aria-labelledby='visit-detail-dialog-title'
      sx={{ '& .MuiDialog-paper': { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 }, maxHeight: { xs: '100dvh', sm: 'calc(100dvh - 32px)' } } }}
    >
      {/* ── Header ── */}
      <Box
        id='visit-detail-header'
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          pt: { xs: 2.5, sm: 3 },
          pb: 2.5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Stack direction='row' sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, minWidth: 0, flex: 1 }}>
            <Avatar
              id='visit-detail-student-avatar'
              src={studentAvatar}
              sx={{
                width: { xs: 52, sm: 64 },
                height: { xs: 52, sm: 64 },
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.15),
                color: 'primary.main',
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                fontWeight: 800,
                flexShrink: 0,
                border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {getNameInitials(studentFullName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                id='visit-detail-dialog-title'
                variant='h6'
                sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.02em', lineHeight: 1.3 }}
              >
                {studentFullName}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.4, fontWeight: 600 }}>
                รหัสนักเรียน {row?.studentId}
              </Typography>
              <Stack direction='row' spacing={0.75} sx={{ flexWrap: 'wrap', mt: 1, rowGap: 0.75 }}>
                <Chip
                  id='visit-detail-classroom-chip'
                  size='small'
                  label={row?.classroomName}
                  color='info'
                  variant='outlined'
                  sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                />
                <Chip
                  id='visit-detail-status-chip'
                  size='small'
                  color={isRecorded ? 'success' : 'warning'}
                  label={isRecorded ? 'บันทึกแล้ว' : 'ยังไม่บันทึก'}
                  variant={isRecorded ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                />
                {row?.visitNo ? (
                  <Chip
                    id='visit-detail-visit-no-chip'
                    size='small'
                    label={`ครั้งที่ ${row.visitNo}`}
                    color='primary'
                    variant='filled'
                    sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                  />
                ) : null}
              </Stack>
            </Box>
          </Stack>
          <IconButton
            id='visit-detail-close-icon-button'
            size='small'
            onClick={onClose}
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.14)}`,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Close fontSize='small' />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        {!row ? null : isLoading ? (
          <Box sx={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress id='visit-detail-loading' size={30} />
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {error ? (
              <Grid size={12}>
                <Alert severity='warning' id='visit-detail-error-alert'>{getErrorMessage(error)}</Alert>
              </Grid>
            ) : null}

            {/* ── Visit stat cards ── */}
            <Grid size={12}>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {[
                  {
                    id: 'visit-stat-status',
                    label: 'สถานะ',
                    value: isRecorded ? 'บันทึกแล้ว' : 'ยังไม่บันทึก',
                    color: isRecorded ? 'success' : 'warning',
                    icon: <CalendarCheckOutline sx={{ fontSize: '1.25rem' }} />,
                  },
                  {
                    id: 'visit-stat-date',
                    label: 'วันที่เยี่ยมบ้าน',
                    value: formatVisitDate(row.visitDate),
                    color: 'primary',
                    icon: <HomeOutline sx={{ fontSize: '1.25rem' }} />,
                  },
                  {
                    id: 'visit-stat-images',
                    label: 'รูปบ้าน',
                    value: row.images.length ? `${row.images.length} รูป` : 'ยังไม่มีรูป',
                    color: row.images.length ? 'info' : 'default',
                    icon: <ImageOutline sx={{ fontSize: '1.25rem' }} />,
                  },
                ].map((stat) => (
                  <Grid key={stat.id} size={{ xs: 4 }}>
                    <Box
                      id={stat.id}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: (theme) => {
                          const c = stat.color !== 'default'
                            ? theme.palette[stat.color as 'success' | 'primary' | 'info' | 'warning'].main
                            : theme.palette.primary.main;
                          return alpha(c, theme.palette.mode === 'dark' ? 0.16 : 0.1);
                        },
                        boxShadow: (theme) => {
                          const c = stat.color !== 'default'
                            ? theme.palette[stat.color as 'success' | 'primary' | 'info' | 'warning'].main
                            : theme.palette.primary.main;
                          return `0 2px 6px ${alpha(c, theme.palette.mode === 'dark' ? 0.18 : 0.14)}`;
                        },
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          color: stat.color === 'default' ? 'text.primary' : `${stat.color}.dark`,
                          mb: 0.5,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant='caption'
                        sx={{ display: 'block', color: 'text.primary', fontWeight: 600, fontSize: '0.72rem', mb: 0.3, opacity: 0.6 }}
                      >
                        {stat.label}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 800, fontSize: { xs: '0.82rem', sm: '0.9rem' }, lineHeight: 1.2, color: 'text.primary' }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* ── Student info ── */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                id='visit-detail-student-info-section'
                sx={{
                  height: '100%',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.18)}`,
                  boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.06)}`,
                }}
              >
                <DetailSectionTitle icon={<AccountOutline sx={{ fontSize: '1rem' }} />}>
                  ข้อมูลนักเรียน
                </DetailSectionTitle>
                <VisitInfoRow label='ชื่อ-นามสกุล' value={studentFullName} />
                <VisitInfoRow label='รหัสนักเรียน' value={row.studentId} />
                <VisitInfoRow label='เบอร์โทรศัพท์' value={studentAccount?.phone || '-'} />
                <VisitInfoRow label='วันเกิด' value={formatVisitDate(studentAccount?.birthDate ?? null)} />
                <VisitInfoRow label='ที่อยู่' value={studentAddress} />
                <VisitInfoRow label='ห้องเรียน' value={student?.classroom?.name || row.classroomName} />
                <VisitInfoRow label='ระดับชั้น' value={student?.level?.levelFullName || '-'} />
                <VisitInfoRow label='สาขาวิชา' value={student?.program?.name || '-'} />
              </Box>
            </Grid>

            {/* ── Map ── */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                id='visit-detail-map-section'
                sx={{
                  height: '100%',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.18)}`,
                  boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.06)}`,
                }}
              >
                <Stack direction='row' sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <DetailSectionTitle icon={<MapMarkerOutline sx={{ fontSize: '1rem' }} />}>
                    แผนที่บ้าน
                  </DetailSectionTitle>
                  {visitMapUrl ? (
                    <Button
                      id='visit-detail-open-map-button'
                      component='a'
                      href={visitMapUrl}
                      target='_blank'
                      rel='noreferrer'
                      size='small'
                      variant='outlined'
                      color='primary'
                      endIcon={<OpenInNew sx={{ fontSize: '0.85rem !important' }} />}
                      sx={{ flexShrink: 0, ml: 1, height: 30, fontSize: '0.75rem' }}
                    >
                      Google Maps
                    </Button>
                  ) : null}
                </Stack>

                {visitMapData ? (
                  <>
                    {visitEmbedUrl ? (
                      <Box
                        id='visit-detail-map-embed-wrapper'
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                        }}
                      >
                        <Box
                          id='visit-detail-map-iframe'
                          component='iframe'
                          title='visit-detail-map-preview'
                          src={visitEmbedUrl}
                          loading='lazy'
                          referrerPolicy='no-referrer-when-downgrade'
                          sx={{ width: '100%', height: { xs: 180, sm: 200 }, border: 0, display: 'block' }}
                        />
                      </Box>
                    ) : null}
                    {visitMapData.coordinates ? (
                      <VisitInfoRow label='พิกัดบ้าน' value={visitMapData.coordinates} />
                    ) : null}
                    {visitMapData.placeLabel ? (
                      <VisitInfoRow label='ชื่อจุดหมุด' value={visitMapData.placeLabel} />
                    ) : null}
                    {visitMapData.landmark ? (
                      <VisitInfoRow label='จุดสังเกต' value={visitMapData.landmark} />
                    ) : null}
                    {visitMapData.travelNote ? (
                      <VisitInfoRow label='หมายเหตุ' value={visitMapData.travelNote} />
                    ) : null}
                  </>
                ) : (
                  <Alert severity='info' id='visit-detail-no-map-alert' sx={{ fontSize: '0.82rem' }}>
                    ยังไม่มีพิกัดบ้านในระบบ
                  </Alert>
                )}
              </Box>
            </Grid>

            {/* ── Images ── */}
            <Grid size={12}>
              <Box
                id='visit-detail-images-section'
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.18)}`,
                  boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.06)}`,
                }}
              >
                <DetailSectionTitle icon={<ImageOutline sx={{ fontSize: '1rem' }} />}>
                  รูปบ้านที่อัปโหลด
                </DetailSectionTitle>
                {row.images.length ? (
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {row.images.map((image, index) => (
                      <Grid key={`${row.id}-detail-image-${index}`} size={{ xs: 4 }}>
                        <Box
                          id={`visit-detail-image-${row.id}-${index + 1}`}
                          sx={{
                            position: 'relative',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
                            '&:hover .img-overlay': { opacity: 1 },
                          }}
                        >
                          <Box
                            component='img'
                            src={image}
                            alt={`visit-detail-home-${index + 1}`}
                            sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                          />
                          <Box
                            className='img-overlay'
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'flex-end',
                              p: 1,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                              opacity: 0,
                              transition: 'opacity 200ms ease',
                            }}
                          >
                            <Typography variant='caption' sx={{ color: 'white', fontWeight: 700 }}>
                              รูปบ้าน {index + 1}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity='info' id='visit-detail-no-images-alert' sx={{ fontSize: '0.82rem' }}>
                    ยังไม่มีรูปบ้านในระบบ
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, sm: 3.5 }, py: { xs: 2, sm: 2.5 } }}>
        <Button
          id='visit-detail-close-button'
          variant='contained'
          onClick={onClose}
          fullWidth
          sx={{ maxWidth: { xs: '100%', sm: 160 }, py: 1.1 }}
        >
          ปิด
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
    const mapResult = mapInput.trim() ? buildVisitMapPayload(mapInput, mapPlaceLabel, mapLandmark, mapTravelNote) : null;

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

      toast.success(row.visitId ? 'อัปเดตข้อมูลเยี่ยมบ้านสำเร็จ' : 'บันทึกข้อมูลเยี่ยมบ้านสำเร็จ');
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
    >
      <DialogTitle id='visit-record-dialog-title'>
        {row?.visitId ? 'แก้ไขบันทึกเยี่ยมบ้าน' : 'บันทึกเยี่ยมบ้าน'}
      </DialogTitle>
      <DialogContent dividers>
        {row ? (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Alert severity='info' id='visit-record-dialog-info'>
                ระบบจะปรับรูปภาพประกอบทุกใบเป็นขนาด 800x600 อัตโนมัติ
              </Alert>
            </Grid>
            {dialogError ? (
              <Grid size={12}>
                <Alert severity='error' id='visit-record-dialog-error'>
                  {dialogError}
                </Alert>
              </Grid>
            ) : null}
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
                    helperText: 'สามารถแก้ไขวันที่ย้อนหลังได้',
                  },
                }}
              />
            </Grid>
            <Grid size={12}>
              <Box
                id='visit-record-map-section'
                sx={{
                  p: { xs: 2.25, md: 3 },
                  borderRadius: 3,
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03),
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 2.25 }}
                >
                  <Box>
                    <Typography variant='subtitle1' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      ข้อมูลพิกัดบ้านจาก Google Maps
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                      วางลิงก์แชร์จาก Google Maps หรือกรอกพิกัดบ้านแบบ lat,lng แล้วให้ระบบอ่านค่าพิกัดให้อัตโนมัติ
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      id='visit-map-open-google-button'
                      variant='outlined'
                      color='secondary'
                      onClick={handleOpenGoogleMaps}
                    >
                      เปิด Google Maps
                    </Button>
                    <Button
                      id='visit-map-resolve-button'
                      variant='contained'
                      color='info'
                      onClick={handleResolveMap}
                      disabled={!mapInput.trim()}
                    >
                      อ่านพิกัด
                    </Button>
                    {mapEmbedUrl ? (
                      <Button
                        id='visit-map-toggle-preview-button'
                        variant={isMapPreviewOpen ? 'contained' : 'outlined'}
                        color='success'
                        onClick={() => setIsMapPreviewOpen((current) => !current)}
                      >
                        {isMapPreviewOpen ? 'ซ่อนตัวอย่างแผนที่' : 'ดูตัวอย่างแผนที่'}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>

                {mapError ? (
                  <Alert severity='warning' id='visit-map-error-alert' sx={{ mb: 2.25 }}>
                    {mapError}
                  </Alert>
                ) : null}

                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <TextField
                      id='visit-map-input'
                      fullWidth
                      label='ลิงก์ Google Maps หรือพิกัดบ้าน'
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
                      helperText='รองรับทั้งลิงก์แชร์จาก Google Maps และพิกัด lat,lng ที่คัดลอกมาจากแอป'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-place-label'
                      fullWidth
                      label='ชื่อจุดบ้านหรือชื่อหมุด'
                      placeholder='เช่น บ้านน้องต้น ซอย 3'
                      value={mapPlaceLabel}
                      onChange={(event) => setMapPlaceLabel(event.target.value)}
                      helperText='ใช้เป็นชื่อเรียกตำแหน่งบ้านเวลาค้นในภายหลัง'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-coordinates'
                      fullWidth
                      label='พิกัดที่อ่านได้'
                      value={mapPreview?.coordinates || '-'}
                      slotProps={{ input: { readOnly: true } }}
                      helperText='ระบบจะแสดงพิกัดหลังจากกดปุ่มอ่านพิกัด'
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
                      label='จุดสังเกตใกล้บ้าน'
                      placeholder='เช่น เลยร้านชำมาประมาณ 200 เมตร บ้านสีฟ้าหลังมุม'
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
                      label='หมายเหตุการเดินทาง'
                      placeholder='เช่น รถยนต์เข้าซอยได้ถึงหน้าบ้าน หรือควรนัดผู้ปกครองให้ออกมารับ'
                      value={mapTravelNote}
                      onChange={(event) => setMapTravelNote(event.target.value)}
                    />
                  </Grid>
                </Grid>

                {mapEmbedUrl ? (
                  <Collapse in={isMapPreviewOpen} timeout='auto' unmountOnExit>
                    <Box
                      id='visit-map-preview-wrapper'
                      sx={{
                        mt: 2.5,
                        p: 1,
                        borderRadius: 2.5,
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box
                        id='visit-map-preview-iframe'
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
              <Grid container spacing={3}>
                {images.map((image, index) => {
                  const isProcessing = resizingSlots.includes(index);

                  return (
                    <Grid key={`visit-image-slot-${index}`} size={{ xs: 12, md: 4 }}>
                      <Box
                        id={`visit-image-slot-${index + 1}`}
                        sx={{
                          height: '100%',
                          p: 2,
                          borderRadius: 3,
                          border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.22)}`,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.035),
                        }}
                      >
                        <Typography id={`visit-image-slot-title-${index + 1}`} variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>
                          รูปภาพประกอบ {index + 1}
                        </Typography>
                        <Box
                          id={`visit-image-preview-box-${index + 1}`}
                          sx={{
                            height: 180,
                            borderRadius: 2,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                            mb: 1.5,
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
                            <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', px: 2 }}>
                              ยังไม่ได้เลือกรูปภาพ
                            </Typography>
                          )}
                        </Box>
                        <Stack direction='row' spacing={1.5}>
                          <Button
                            id={`visit-image-upload-button-${index + 1}`}
                            component='label'
                            variant='contained'
                            color='primary'
                            fullWidth
                            disabled={isSaving || isProcessing}
                          >
                            เลือกรูป
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
      <DialogActions>
        <Button id='visit-record-cancel-button' variant='outlined' onClick={onClose} disabled={isSaving}>
          ยกเลิก
        </Button>
        <Button id='visit-record-save-button' variant='contained' onClick={() => void handleSubmit()} disabled={isSaving || resizingSlots.length > 0}>
          {isSaving ? 'กำลังบันทึก...' : row?.visitId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
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
  const [visitStatusFilter, setVisitStatusFilter] = useState<'all' | 'recorded' | 'pending'>('all');
  const [detailRow, setDetailRow] = useState<TeacherVisitStudentRow | null>(null);
  const [selectedRow, setSelectedRow] = useState<TeacherVisitStudentRow | null>(null);

  const handleClassroomChange = useCallback((value: { id: string; name: string } | null) => {
    setSelectedClassroomId(value?.id ?? null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleVisitStatusChange = useCallback((value: 'all' | 'recorded' | 'pending') => {
    setVisitStatusFilter(value);
  }, []);

  const handleOpenDetail = useCallback((row: TeacherVisitStudentRow) => {
    setDetailRow(row);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailRow(null);
  }, []);

  const handleOpenRecord = useCallback((row: TeacherVisitStudentRow) => {
    setSelectedRow(row);
  }, []);

  const handleCloseRecord = useCallback(() => {
    setSelectedRow(null);
  }, []);

  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const advisorClassroomIds = useMemo(() => {
    const teacherOnClassroom = Array.isArray(user?.teacherOnClassroom) ? user.teacherOnClassroom : [];

    return teacherOnClassroom
      .map(getAdvisorClassroomId)
      .filter((classroomId): classroomId is string => Boolean(classroomId));
  }, [user?.teacherOnClassroom]);
  const hasAdvisorClassrooms = advisorClassroomIds.length > 0;

  const {
    data: advisorStudents = [],
    isLoading,
    isFetching,
  } = useTeacherVisitStudents(undefined, {
    enabled: Boolean(isInitialized && !loading && isTeacher),
    advisorClassroomIds,
  });

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
        [row.studentId, row.fullName, row.classroomName].some((value) => value?.toLowerCase().includes(normalizedSearch));
      const matchesStatus =
        visitStatusFilter === 'all' ||
        (visitStatusFilter === 'recorded' && row.visitStatus === 'recorded') ||
        (visitStatusFilter === 'pending' && row.visitStatus !== 'recorded');

      return matchesClassroom && matchesSearch && matchesStatus;
    });
  }, [advisorStudents, searchValue, selectedClassroomId, visitStatusFilter]);

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

  const getActionIconSx = useCallback(
    (color: 'info' | 'warning' | 'primary') => ({
      width: 32,
      height: 32,
      borderRadius: 1.5,
      border: (theme: Theme) => `1px solid ${alpha(theme.palette[color].main, 0.24)}`,
      backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.12),
      color: `${color}.dark`,
      transition: 'all 160ms ease',
      '&:hover': {
        backgroundColor: (theme: Theme) => alpha(theme.palette[color].main, 0.2),
      },
    }),
    [],
  );

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
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.25,
              py: 0.35,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
              maxWidth: '100%',
            }}
          >
            <Typography noWrap variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {row.classroomName}
            </Typography>
          </Box>
        ),
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
          <Typography variant='body2' sx={{ color: row.visitDate ? 'text.primary' : 'text.secondary', fontWeight: row.visitDate ? 600 : 500 }}>
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
        flex: 0.14,
        minWidth: 160,
        field: 'actions',
        headerName: 'การดำเนินการ',
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: GridRenderCellParams<TeacherVisitStudentRow>) => (
          <Stack
            id={`visit-actions-${row.id}`}
            direction='row'
            sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75, width: '100%' }}
          >
            <Tooltip title='ดูข้อมูล'>
              <IconButton
                id={`visit-view-button-${row.id}`}
                sx={getActionIconSx('info')}
                onClick={() => handleOpenDetail(row)}
              >
                <EyeOutline fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.visitId ? 'แก้ไขบันทึก' : 'บันทึกเยี่ยมบ้าน'}>
              <IconButton
                id={`visit-action-button-${row.id}`}
                sx={getActionIconSx(row.visitId ? 'warning' : 'primary')}
                onClick={() => handleOpenRecord(row)}
              >
                {row.visitId ? <PencilOutline fontSize='small' /> : <HomeOutline fontSize='small' />}
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [getActionIconSx, handleOpenDetail, handleOpenRecord],
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
          ) : !hasAdvisorClassrooms ? (
            <Box sx={{ px: { xs: 3, sm: 4, lg: 5 }, pb: { xs: 3, sm: 4 } }}>
              <Alert severity='warning' id='visit-list-classroom-alert'>
                ยังไม่พบห้องที่คุณเป็นครูที่ปรึกษาในหน้าตั้งค่าบัญชี กรุณาตรวจสอบหัวข้อครูที่ปรึกษาระดับชั้นก่อนใช้งานหน้านี้
              </Alert>
            </Box>
          ) : (
            <>
              <TableHeader
                classroomOptions={classroomOptions}
                selectedClassroomId={selectedClassroomId}
                searchValue={searchValue}
                visitStatusFilter={visitStatusFilter}
                onClassroomChange={handleClassroomChange}
                onSearchChange={handleSearchChange}
                onVisitStatusChange={handleVisitStatusChange}
              />

              <Box id='visit-list-datagrid-container' sx={{ px: { xs: 1.5, sm: 2.5, lg: 3 }, pb: { xs: 2.5, sm: 3.5 } }}>
                <AppListDataGrid
                  autoHeight
                  rows={filteredRows}
                  columns={columns as GridColDef[]}
                  loading={isLoading || isFetching}
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

      <VisitDetailDialog open={Boolean(detailRow)} row={detailRow} onClose={handleCloseDetail} />

      <VisitDialog
        open={Boolean(selectedRow)}
        row={selectedRow}
        onClose={handleCloseRecord}
      />
    </Grid>
  );
};

export default VisitListPage;
