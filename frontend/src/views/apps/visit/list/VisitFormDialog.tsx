'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AccountOutline from 'mdi-material-ui/AccountOutline';
import Close from 'mdi-material-ui/Close';
import ContentSaveEditOutline from 'mdi-material-ui/ContentSaveEditOutline';
import ContentSaveOutline from 'mdi-material-ui/ContentSaveOutline';
import ImageOutline from 'mdi-material-ui/ImageOutline';
import MapMarkerOutline from 'mdi-material-ui/MapMarkerOutline';
import { toast } from 'react-toastify';
import {
  type VisitDetailData,
  type VisitMapData,
  type TeacherVisitStudentRow,
  type VisitPayload,
  useCreateVisit,
  useUpdateVisit,
} from '@/hooks/queries/useVisits';
import { resizeImageToDataUrl } from '@/utils/resize-image';

// ── Schema ─────────────────────────────────────────────────────────────────────

const visitSchema = z.object({
  visitDate: z.date(),
  images: z
    .array(z.string())
    .refine((imgs) => imgs.filter(Boolean).length <= 3, {
      message: 'อัปโหลดได้สูงสุด 3 รูปเท่านั้น',
    }),
  mapInput: z.string(),
  mapPlaceLabel: z.string(),
  mapLandmark: z.string(),
  mapTravelNote: z.string(),
});

type VisitFormValues = z.infer<typeof visitSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

const RESIZE_TARGET = { width: 800, height: 600 } as const;
const EMPTY_IMAGE_SLOTS = ['', '', ''];
const GOOGLE_MAPS_URL = 'https://www.google.com/maps';
const MAP_COORDINATE_PRECISION = 6;

// ── Utilities ─────────────────────────────────────────────────────────────────

const normalizeImageSlots = (images?: string[]) => EMPTY_IMAGE_SLOTS.map((_, index) => images?.[index] ?? '');

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

const buildVisitMapPayload = (mapInput: string, placeLabel: string, landmark: string, travelNote: string) => {
  const trimmed = mapInput.trim();
  if (!trimmed) return null;
  const coordinates = extractCoordinatesFromMapInput(trimmed);
  const isUrl = /^https?:\/\//i.test(trimmed);
  if (!coordinates && !isUrl) return null;
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

const sectionCardSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1.5,
  bgcolor: 'background.paper',
} as const;

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {label}
    </Typography>
    <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.9rem' }}>
      {value ?? '-'}
    </Typography>
  </Box>
);

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
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

const formatThaiDate = (date: Date) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const getNameInitials = (fullName: string) => {
  const segments = fullName.trim().split(/\s+/).filter(Boolean);
  if (segments.length === 0) return '?';
  return segments.slice(0, 2).map((s) => s.charAt(0)).join('').toUpperCase();
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
};

// ── Component ─────────────────────────────────────────────────────────────────

export interface VisitFormDialogProps {
  open: boolean;
  row: TeacherVisitStudentRow | null;
  onClose: () => void;
}

const VisitFormDialog = ({ open, row, onClose }: VisitFormDialogProps) => {
  const [mapPreview, setMapPreview] = useState<VisitMapData | null>(null);
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);
  const [mapError, setMapError] = useState('');
  const [resizingSlots, setResizingSlots] = useState<number[]>([]);
  const [dialogError, setDialogError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const {
    control,
    register,
    handleSubmit: rhfSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    mode: 'onChange',
    defaultValues: {
      visitDate: new Date(),
      images: ['', '', ''],
      mapInput: '',
      mapPlaceLabel: '',
      mapLandmark: '',
      mapTravelNote: '',
    },
  });

  const images = watch('images');
  const visitDate = watch('visitDate');
  const mapInput = watch('mapInput');
  const mapPlaceLabel = watch('mapPlaceLabel');
  const mapLandmark = watch('mapLandmark');
  const mapTravelNote = watch('mapTravelNote');

  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();
  const isSaving = createVisit.isPending || updateVisit.isPending;
  const mapEmbedUrl = buildGoogleMapsEmbedUrl(mapPreview);

  useEffect(() => {
    if (!open || !row) return;
    const initialMapData = getVisitMapData(row.visitDetail, row.visitMap);
    reset({
      visitDate: row.visitDate ? new Date(row.visitDate) : new Date(),
      images: normalizeImageSlots(row.images),
      mapInput: initialMapData?.googleMapsUrl ?? initialMapData?.coordinates ?? row.visitMap ?? '',
      mapPlaceLabel: initialMapData?.placeLabel ?? '',
      mapLandmark: initialMapData?.landmark ?? '',
      mapTravelNote: initialMapData?.travelNote ?? '',
    });
    setMapPreview(initialMapData);
    setIsMapPreviewOpen(false);
    setMapError('');
    setDialogError('');
    setResizingSlots([]);
  }, [open, row, reset]);

  const handleOpenGoogleMaps = () => {
    const targetUrl = mapPreview?.googleMapsUrl || mapInput.trim() || GOOGLE_MAPS_URL;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleImageChange = async (index: number, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    setResizingSlots((current) => [...current, index]);
    try {
      const resized = await resizeImageToDataUrl(file, RESIZE_TARGET);
      const current = getValues('images');
      const next = [...current];
      next[index] = resized;
      setValue('images', next, { shouldValidate: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResizingSlots((current) => current.filter((item) => item !== index));
    }
  };

  const handleAddImage = async (file: File | undefined) => {
    if (!file) return;
    const currentImages = getValues('images');
    const nextSlot = currentImages.findIndex((img) => !img);
    if (nextSlot === -1) return;
    await handleImageChange(nextSlot, file);
  };

  const handleClearImage = (index: number) => {
    const current = getValues('images');
    const next = [...current];
    next[index] = '';
    setValue('images', next, { shouldValidate: true });
  };

  const onSubmit = async (data: VisitFormValues) => {
    if (!row) return;
    setDialogError('');
    const hasMapNotes = [data.mapPlaceLabel, data.mapLandmark, data.mapTravelNote].some((v) => v.trim());
    const currentVisitDetail = getVisitDetailData(row.visitDetail);
    const mapResult = data.mapInput.trim()
      ? buildVisitMapPayload(data.mapInput, data.mapPlaceLabel, data.mapLandmark, data.mapTravelNote)
      : null;
    if ((data.mapInput.trim() || hasMapNotes) && !mapResult) {
      const message = 'กรุณาวางลิงก์ Google Maps หรือกรอกพิกัดรูปแบบ lat,lng';
      setDialogError(message);
      setMapError(message);
      return;
    }
    if (hasMapNotes && !data.mapInput.trim()) {
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
      visitDate: toApiDate(data.visitDate),
      images: data.images,
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

  const mapInputReg = register('mapInput');
  const isSaveDisabled = isSaving || resizingSlots.length > 0 || !isValid;

  return (
    <>
    <Dialog
      id='visit-record-dialog'
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || isSaving) return;
        onClose();
      }}
      fullWidth
      maxWidth='lg'
      aria-labelledby='visit-record-dialog-title'
      sx={{ '& .MuiDialog-paper': { borderRadius: 1.5, m: { xs: 0, sm: 2 }, maxHeight: { xs: '100dvh', sm: 'calc(100dvh - 32px)' } } }}
    >
      {/* ── Header ── */}
      <Box
        id='visit-record-header'
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, minWidth: 0, flex: 1 }}>
            <Avatar
              id='visit-record-student-avatar'
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
              {row ? getNameInitials(row.fullName) : '?'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                id='visit-record-dialog-title'
                variant='h6'
                sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.02em', lineHeight: 1.3 }}
              >
                {row?.fullName ?? '—'}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.4, fontWeight: 600 }}>
                รหัสนักเรียน {row?.studentId}
              </Typography>
              {visitDate ? (
                <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.25, display: 'block', fontWeight: 500 }}>
                  วันที่เยี่ยมบ้าน {formatThaiDate(visitDate)}
                </Typography>
              ) : null}
              <Stack direction='row' spacing={0.75} sx={{ flexWrap: 'wrap', mt: 1, rowGap: 0.75 }}>
                {row?.classroomName ? (
                  <Chip
                    id='visit-record-classroom-chip'
                    size='small'
                    label={row.classroomName}
                    color='info'
                    variant='outlined'
                    sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                  />
                ) : null}
                <Chip
                  id='visit-record-mode-chip'
                  size='small'
                  label={row?.visitId ? 'แก้ไขบันทึก' : 'บันทึกใหม่'}
                  color={row?.visitId ? 'warning' : 'success'}
                  variant='outlined'
                  sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                />
              </Stack>
            </Box>
          </Stack>
          <IconButton
            id='visit-record-close-icon-button'
            size='small'
            onClick={onClose}
            disabled={isSaving}
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

      <DialogContent
        id='visit-record-dialog-content'
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
          '& .MuiFormHelperText-root:not(.Mui-error)': { color: 'text.disabled' },
        }}
      >
        {row ? (
          <Grid container spacing={3}>
            {dialogError ? (
              <Grid size={12}>
                <Alert severity='error' id='visit-record-dialog-error'>
                  {dialogError}
                </Alert>
              </Grid>
            ) : null}

            {/* ── Map section ── */}
            <Grid size={12}>
              <Box
                id='visit-record-map-section'
                sx={{
                  ...sectionCardSx,
                  p: { xs: 2.25, md: 3 },
                }}
              >
                <SectionTitle icon={<MapMarkerOutline sx={{ fontSize: '1rem' }} />}>
                  ข้อมูลพิกัดบ้านจาก Google Maps
                </SectionTitle>

                {/* Input */}
                <TextField
                    id='visit-map-input'
                    fullWidth
                    label='ลิงก์ Google Maps หรือพิกัดบ้าน'
                    placeholder='เช่น https://maps.google.com/... หรือ 13.756331,100.501762'
                    {...mapInputReg}
                    onChange={(e) => {
                      void mapInputReg.onChange(e);
                      setMapPreview(null);
                      setIsMapPreviewOpen(false);
                      if (mapError) setMapError('');
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text').trim();
                      if (!pasted) return;
                      const mapResult = buildVisitMapPayload(pasted, mapPlaceLabel, mapLandmark, mapTravelNote);
                      if (!mapResult) return;
                      setTimeout(() => {
                        setValue('mapInput', mapResult.visitMap);
                        setMapPreview(mapResult.mapData);
                        setIsMapPreviewOpen(true);
                        setMapError('');
                      }, 0);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!value) return;
                      const mapResult = buildVisitMapPayload(value, mapPlaceLabel, mapLandmark, mapTravelNote);
                      if (!mapResult) return;
                      setValue('mapInput', mapResult.visitMap);
                      setMapPreview(mapResult.mapData);
                      setIsMapPreviewOpen(true);
                      setMapError('');
                    }}
                    helperText='วางลิงก์แชร์หรือพิกัด lat,lng จาก Google Maps'
                    slotProps={{
                      input: {
                        endAdornment: mapInput ? (
                          <InputAdornment position='end'>
                            <IconButton
                              id='visit-map-input-clear-button'
                              size='small'
                              edge='end'
                              onClick={() => {
                                setValue('mapInput', '');
                                setMapPreview(null);
                                setIsMapPreviewOpen(false);
                                if (mapError) setMapError('');
                              }}
                            >
                              <Close fontSize='small' />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                  />

                {/* Secondary actions */}
                <Stack direction='row' spacing={0.5} sx={{ mt: 1, mb: mapError ? 2 : 2 }}>
                  <Button
                    id='visit-map-open-google-button'
                    size='small'
                    variant='text'
                    color='secondary'
                    onClick={handleOpenGoogleMaps}
                    sx={{ fontSize: '0.72rem', px: 1, minWidth: 0 }}
                  >
                    เปิด Google Maps ↗
                  </Button>
                  {mapEmbedUrl ? (
                    <Button
                      id='visit-map-toggle-preview-button'
                      size='small'
                      variant='text'
                      color='info'
                      onClick={() => setIsMapPreviewOpen((current) => !current)}
                      sx={{ fontSize: '0.72rem', px: 1, minWidth: 0 }}
                    >
                      {isMapPreviewOpen ? 'ซ่อนแผนที่' : 'ดูแผนที่'}
                    </Button>
                  ) : null}
                </Stack>

                {mapError ? (
                  <Alert severity='warning' id='visit-map-error-alert' sx={{ mb: 2 }}>
                    {mapError}
                  </Alert>
                ) : null}

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-place-label'
                      fullWidth
                      label='ชื่อจุดบ้านหรือชื่อหมุด'
                      placeholder='เช่น บ้านน้องต้น ซอย 3'
                      {...register('mapPlaceLabel')}
                      helperText='ใช้เป็นชื่อเรียกตำแหน่งบ้านเวลาค้นในภายหลัง'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id='visit-map-coordinates'
                      fullWidth
                      label='พิกัดที่อ่านได้'
                      value={mapPreview?.coordinates ?? '-'}
                      slotProps={{ input: { readOnly: true } }}
                      helperText='ระบบแสดงพิกัดหลังจากกดอ่านพิกัด'
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
                      {...register('mapLandmark')}
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
                      {...register('mapTravelNote')}
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

            {/* ── Image section ── */}
            <Grid size={12}>
              <Box id='visit-record-images-section' sx={sectionCardSx}>
                <SectionTitle icon={<ImageOutline sx={{ fontSize: '1rem' }} />}>รูปบ้านที่อัปโหลด</SectionTitle>

                {/* Thumbnails */}
                {images.some(Boolean) ? (
                  <Stack id='visit-image-preview-list' direction='row' sx={{ flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                    {images.map((image, index) =>
                      image ? (
                        <Box
                          key={`thumb-${index}`}
                          id={`visit-image-thumbnail-${index + 1}`}
                          sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, cursor: 'zoom-in' }}
                          onClick={() => setPreviewIndex(index)}
                        >
                          {resizingSlots.includes(index) ? (
                            <Box sx={{ width: 120, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 1.5 }}>
                              <CircularProgress id={`visit-image-processing-${index + 1}`} size={24} />
                            </Box>
                          ) : (
                            <Box
                              component='img'
                              src={image}
                              alt={`visit-preview-${index + 1}`}
                              sx={{ width: 120, height: 90, objectFit: 'cover', display: 'block' }}
                            />
                          )}
                          <IconButton
                            id={`visit-image-remove-button-${index + 1}`}
                            size='small'
                            onClick={(e) => { e.stopPropagation(); handleClearImage(index); }}
                            disabled={isSaving}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 22,
                              height: 22,
                              bgcolor: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              '&:hover': { bgcolor: 'error.main' },
                            }}
                          >
                            <Close sx={{ fontSize: '0.75rem' }} />
                          </IconButton>
                          <Typography
                            variant='caption'
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              px: 0.75,
                              py: 0.25,
                              bgcolor: 'rgba(0,0,0,0.45)',
                              color: '#fff',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              lineHeight: 1.6,
                            }}
                          >
                            รูป {index + 1}
                          </Typography>
                        </Box>
                      ) : null
                    )}
                  </Stack>
                ) : null}

                {/* Drop zone */}
                {images.filter(Boolean).length < 3 ? (
                  <Box
                    id='visit-image-drop-zone'
                    component='label'
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) void handleAddImage(file);
                    }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      p: 3,
                      borderRadius: 1.5,
                      border: (theme) => `2px dashed ${alpha(theme.palette.primary.main, isDragging ? 0.6 : 0.22)}`,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, isDragging ? (theme.palette.mode === 'dark' ? 0.14 : 0.06) : 0),
                      cursor: isSaving || resizingSlots.length > 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 160ms ease',
                    }}
                  >
                    <ImageOutline sx={{ fontSize: '2rem', color: isDragging ? 'primary.main' : 'text.disabled' }} />
                    <Typography variant='body2' sx={{ color: isDragging ? 'primary.main' : 'text.secondary', fontWeight: 600 }}>
                      {isDragging ? 'วางรูปที่นี่' : 'ลากวางรูป หรือคลิกเพื่อเลือก'}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                      {images.filter(Boolean).length}/3 รูป · ระบบปรับขนาดเป็น 800×600 อัตโนมัติ
                    </Typography>
                    <input
                      id='visit-image-add-input'
                      hidden
                      type='file'
                      accept='image/*'
                      disabled={isSaving || resizingSlots.length > 0}
                      onChange={(event) => {
                        void handleAddImage(event.target.files?.[0]);
                        event.target.value = '';
                      }}
                    />
                  </Box>
                ) : null}

                {errors.images ? (
                  <Typography
                    id='visit-images-error'
                    variant='caption'
                    sx={{ display: 'block', mt: 1, color: 'error.main' }}
                  >
                    {errors.images.message}
                  </Typography>
                ) : null}
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>

      <DialogActions
        id='visit-record-dialog-actions'
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
        <Stack direction='row' spacing={1.5} sx={{ justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          <Button
            id='visit-record-cancel-button'
            variant='text'
            color='inherit'
            startIcon={<Close fontSize='small' />}
            onClick={onClose}
            disabled={isSaving}
            sx={{ px: 3, py: 1.2, color: 'text.secondary' }}
          >
            ยกเลิก
          </Button>
          <Button
            id='visit-record-save-button'
            variant='contained'
            startIcon={isSaving
              ? <CircularProgress size={16} color='inherit' />
              : row?.visitId
                ? <ContentSaveEditOutline fontSize='small' />
                : <ContentSaveOutline fontSize='small' />
            }
            onClick={() => void rhfSubmit(onSubmit)()}
            disabled={isSaveDisabled}
            sx={{ px: 3, py: 1.2 }}
          >
            {isSaving ? 'กำลังบันทึก...' : row?.visitId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>

    {/* ── Image preview lightbox ── */}
    {previewIndex !== null && images[previewIndex] ? (
      <Dialog
        id='visit-image-preview-dialog'
        open
        onClose={() => setPreviewIndex(null)}
        maxWidth={false}
        sx={{ '& .MuiDialog-paper': { bgcolor: 'transparent', boxShadow: 'none', m: 2 } }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            component='img'
            src={images[previewIndex]}
            alt={`visit-preview-full-${previewIndex + 1}`}
            sx={{ display: 'block', maxWidth: '90vw', maxHeight: '85vh', borderRadius: 2, objectFit: 'contain' }}
          />
          <IconButton
            id='visit-image-preview-close-button'
            onClick={() => setPreviewIndex(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.55)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Dialog>
    ) : null}
    </>
  );
};

export default VisitFormDialog;
