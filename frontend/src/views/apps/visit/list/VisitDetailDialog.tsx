'use client';

import { memo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AccountOutline from 'mdi-material-ui/AccountOutline';
import CalendarCheckOutline from 'mdi-material-ui/CalendarCheckOutline';
import Close from 'mdi-material-ui/Close';
import HomeOutline from 'mdi-material-ui/HomeOutline';
import ImageOutline from 'mdi-material-ui/ImageOutline';
import MapMarkerOutline from 'mdi-material-ui/MapMarkerOutline';
import OpenInNew from 'mdi-material-ui/OpenInNew';
import { type VisitDetailData, type VisitMapData, type TeacherVisitStudentRow } from '@/hooks/queries/useVisits';
import { useStudent } from '@/hooks/queries/useStudents';

// ── Utilities ─────────────────────────────────────────────────────────────────

const GOOGLE_MAPS_URL = 'https://www.google.com/maps';
const MAP_COORDINATE_PRECISION = 6;

const formatVisitDate = (value: string | Date | null) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getNameInitials = (fullName: string) => {
  const segments = fullName.trim().split(/\s+/).filter(Boolean);
  if (segments.length === 0) return '?';
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
  if (!row) return '-';
  const address = [row.addressLine1, row.subdistrict, row.district, row.province, row.postcode]
    .filter(Boolean)
    .join(' ')
    .trim();
  return address || '-';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeCoordinate = (value: number) => Number(value.toFixed(MAP_COORDINATE_PRECISION));

const parseCoordinatePair = (value: string) => {
  const match = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (
    Number.isNaN(latitude) || Number.isNaN(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) return null;
  return { latitude: normalizeCoordinate(latitude), longitude: normalizeCoordinate(longitude) };
};

const buildCoordinateText = (latitude: number, longitude: number) =>
  `${normalizeCoordinate(latitude)}, ${normalizeCoordinate(longitude)}`;

const buildGoogleMapsUrl = (latitude: number, longitude: number) =>
  `${GOOGLE_MAPS_URL}?q=${latitude},${longitude}`;

const buildGoogleMapsEmbedUrl = (mapData?: VisitMapData | null) => {
  if (!mapData) return null;
  const query =
    mapData.coordinates?.trim() ||
    (mapData.latitude !== null && mapData.latitude !== undefined &&
      mapData.longitude !== null && mapData.longitude !== undefined
      ? buildCoordinateText(mapData.latitude, mapData.longitude)
      : '') ||
    mapData.placeLabel?.trim() ||
    '';
  if (!query) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=th&output=embed`;
};

const extractCoordinatesFromMapInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const directCoordinates = parseCoordinatePair(trimmed);
  if (directCoordinates) return directCoordinates;
  const patternMatches = [
    trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/),
    trimmed.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/),
    trimmed.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/),
  ];
  for (const match of patternMatches) {
    if (!match) continue;
    const coordinates = parseCoordinatePair(`${match[1]},${match[2]}`);
    if (coordinates) return coordinates;
  }
  try {
    const url = new URL(trimmed);
    const mapQuery = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('ll');
    if (mapQuery) {
      const coordinates = parseCoordinatePair(mapQuery);
      if (coordinates) return coordinates;
    }
  } catch {
    return null;
  }
  return null;
};

const getVisitDetailData = (value: VisitDetailData | null | undefined) =>
  isRecord(value) ? (value as VisitDetailData & Record<string, unknown>) : ({} as VisitDetailData & Record<string, unknown>);

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
  if (!googleMapsUrl && !coordinates && !mapData?.placeLabel && !mapData?.landmark && !mapData?.travelNote) return null;
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

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
};

// ── Helper components ─────────────────────────────────────────────────────────

const VisitInfoRow = memo(({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}>
    <Typography
      variant='caption'
      sx={{
        display: 'block',
        color: 'text.secondary',
        fontWeight: 600,
        fontSize: '0.72rem',
        mb: 0.2,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </Typography>
    <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 700, wordBreak: 'break-word', fontSize: '0.9rem' }}>
      {value ?? '-'}
    </Typography>
  </Box>
));

VisitInfoRow.displayName = 'VisitInfoRow';

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

const DetailEmptyState = ({ id, icon, text }: { id?: string; icon: React.ReactNode; text: string }) => (
  <Box id={id} sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
    <Box sx={{ color: 'text.disabled', display: 'flex' }}>{icon}</Box>
    <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.82rem', textAlign: 'center' }}>
      {text}
    </Typography>
  </Box>
);

// ── Main component ─────────────────────────────────────────────────────────────

export interface VisitDetailDialogProps {
  open: boolean;
  row: TeacherVisitStudentRow | null;
  onClose: () => void;
  onRecord?: () => void;
}

const VisitDetailDialog = ({ open, row, onClose, onRecord }: VisitDetailDialogProps) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const { data: student, error } = useStudent(open && row ? row.studentKey : '');

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
    : row?.fullName ?? '-';
  const studentAvatar = studentAccount?.avatar ?? undefined;
  const studentAddress = formatStudentAddress(studentAccount);
  const isRecorded = row?.visitStatus === 'recorded';

  const studentInfoRows = (
    [
      { label: 'ชื่อ-นามสกุล', value: studentFullName, always: true },
      { label: 'รหัสนักเรียน', value: row?.studentId, always: true },
      { label: 'ห้องเรียน', value: student?.classroom?.name || row?.classroomName, always: true },
      { label: 'ระดับชั้น', value: student?.level?.levelFullName },
      { label: 'สาขาวิชา', value: student?.program?.name },
      { label: 'เบอร์โทรศัพท์', value: studentAccount?.phone },
      { label: 'วันเกิด', value: formatVisitDate(studentAccount?.birthDate ?? null) },
      { label: 'ที่อยู่', value: studentAddress },
    ] as Array<{ label: string; value?: string | null; always?: boolean }>
  ).flatMap(({ label, value, always }) => {
    if (!always && (!value || value === '-')) return [];
    return [{ label, value: value ?? '-' }];
  });

  return (
    <>
    <Dialog
      id='visit-detail-dialog'
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      aria-labelledby='visit-detail-dialog-title'
      sx={{ '& .MuiDialog-paper': { borderRadius: 1.5, m: { xs: 0, sm: 2 }, maxHeight: { xs: '100dvh', sm: 'calc(100dvh - 32px)' } } }}
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
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Stack direction='row' sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, minWidth: 0, flex: 1 }}
          >
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

      <DialogContent id='visit-detail-dialog-content' sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        {!row ? null : (
          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {error ? (
              <Grid size={12}>
                <Alert severity='warning' id='visit-detail-error-alert'>
                  {getErrorMessage(error)}
                </Alert>
              </Grid>
            ) : null}

            {/* ── Stat cards ── */}
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
                        borderRadius: 1.5,
                        bgcolor: (theme) => {
                          const c =
                            stat.color !== 'default'
                              ? theme.palette[stat.color as 'success' | 'primary' | 'info' | 'warning'].main
                              : theme.palette.primary.main;
                          return alpha(c, theme.palette.mode === 'dark' ? 0.12 : 0.1);
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
            <Grid size={{ xs: 12, sm: visitMapData ? 6 : 12 }}>
              <Box
                id='visit-detail-student-info-section'
                sx={{
                  height: '100%',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                }}
              >
                <DetailSectionTitle icon={<AccountOutline sx={{ fontSize: '1rem' }} />}>
                  ข้อมูลนักเรียน
                </DetailSectionTitle>
                {visitMapData ? (
                  studentInfoRows.map(({ label, value }) => <VisitInfoRow key={label} label={label} value={value} />)
                ) : (
                  <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    {studentInfoRows.map(({ label, value }) => (
                      <Grid key={label} size={{ xs: 12, sm: 6 }}>
                        <VisitInfoRow label={label} value={value} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>

            {/* ── Map ── */}
            {visitMapData ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  id='visit-detail-map-section'
                  sx={{
                    height: '100%',
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.14)}`,
                    boxShadow: (theme) =>
                      `0 2px 8px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.06)}`,
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
                  {visitEmbedUrl ? (
                    <Box
                      id='visit-detail-map-embed-wrapper'
                      sx={{
                        mb: 2,
                        borderRadius: 1.5,
                        overflow: 'hidden',
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
                </Box>
              </Grid>
            ) : null}

            {/* ── Images ── */}
            <Grid size={12}>
              <Box
                id='visit-detail-images-section'
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                }}
              >
                <DetailSectionTitle icon={<ImageOutline sx={{ fontSize: '1rem' }} />}>
                  รูปบ้านที่อัปโหลด
                </DetailSectionTitle>
                {row.images.filter(Boolean).length ? (
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {row.images.filter(Boolean).map((image, index) => (
                      <Grid key={`${row.id}-detail-image-${index}`} size={{ xs: 4 }}>
                        <Box
                          id={`visit-detail-image-${row.id}-${index + 1}`}
                          onClick={() => setLightboxSrc(image)}
                          sx={{
                            position: 'relative',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: (theme) =>
                              `0 2px 8px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
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
                  <DetailEmptyState
                    id='visit-detail-no-images-empty'
                    icon={<ImageOutline sx={{ fontSize: '2rem' }} />}
                    text='ยังไม่มีรูปบ้านในระบบ'
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions
        id='visit-detail-dialog-actions'
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          pt: 2,
          pb: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Stack direction='row' spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%', py: 2 }}>
          {!isRecorded && onRecord ? (
            <Button
              id='visit-detail-record-button'
              variant='contained'
              color='primary'
              onClick={onRecord}
              sx={{ width: { xs: 160, sm: 190 }, py: 1.2 }}
            >
              บันทึกเยี่ยมบ้าน
            </Button>
          ) : null}
          <Button
            id='visit-detail-close-button'
            variant={isRecorded ? 'contained' : 'outlined'}
            onClick={onClose}
            sx={{ width: { xs: 160, sm: 190 }, py: 1.2 }}
          >
            ปิด
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>

      <Dialog
        id='visit-image-lightbox'
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        maxWidth='md'
        fullWidth
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.85)' } } }}
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <IconButton
          id='visit-image-lightbox-close'
          onClick={() => setLightboxSrc(null)}
          sx={{ position: 'absolute', top: -16, right: -16, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
        >
          <Close fontSize='small' />
        </IconButton>
        {lightboxSrc && (
          <Box
            component='img'
            src={lightboxSrc}
            alt='visit-image-preview'
            sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 2, display: 'block' }}
          />
        )}
      </Dialog>
    </>
  );
};

export default VisitDetailDialog;
