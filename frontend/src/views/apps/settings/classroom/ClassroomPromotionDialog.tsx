'use client';

import { alpha, Box } from '@mui/material';
import { RiArrowUpLine } from 'react-icons/ri';
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';

import { RiArrowDownLine } from 'react-icons/ri';

const CONTROL_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
  },
};

interface StudentPromotionDialogProps {
  open: boolean;
  classrooms: any[];
  promoteSource: any | null;
  promoteTarget: any | null;
  promotePreview: any | null;
  isLoadingPreview: boolean;
  isPromoting: boolean;
  onSourceChange: (value: any) => void;
  onTargetChange: (value: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ClassroomPromotionDialog = ({
  open,
  classrooms,
  promoteSource,
  promoteTarget,
  promotePreview,
  isLoadingPreview,
  isPromoting,
  onSourceChange,
  onTargetChange,
  onConfirm,
  onCancel,
}: StudentPromotionDialogProps) => {
  return (
    <Dialog
      id='promote-students-dialog'
      open={open}
      fullWidth
      maxWidth='sm'
      aria-labelledby='promotion-dialog-title'
      slotProps={{
        paper: {
          sx: {
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: 6,
          pt: 6,
          pb: 4,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
          }}
        >
          <RiArrowUpLine size={24} />
        </Box>
        <Box>
          <Typography variant='h6' id='promotion-dialog-title' sx={{
            fontWeight: 600
          }}>
            เลื่อนชั้นนักเรียน
          </Typography>
          <Typography variant='body2' sx={{
            color: 'text.secondary'
          }}>
            นักเรียนทุกคนในห้องเรียนต้นทาง (ยกเว้นที่จบการศึกษาแล้ว) จะถูกย้ายไปยังห้องเรียนปลายทาง
          </Typography>
        </Box>
      </Box>
      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                1
              </Box>
              <Typography variant='subtitle2' sx={{
                fontWeight: 600
              }}>
                เลือกห้องเรียนต้นทาง
              </Typography>
            </Box>

            <Autocomplete
              id='promote-source-classroom'
              options={classrooms.filter((c) => c.id !== promoteTarget?.id)}
              getOptionLabel={(option) => option?.name ?? option?.classroomId ?? ''}
              value={promoteSource}
              onChange={(_, value) => onSourceChange(value)}
              disabled={isPromoting}
              renderInput={(params) => (
                <TextField {...params} label='ห้องเรียนต้นทาง' placeholder='พิมพ์เพื่อค้นหา...' sx={CONTROL_SX} />
              )}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              noOptionsText='ไม่พบห้องเรียน'
            />

            {promoteSource && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                {isLoadingPreview ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant='body2' sx={{
                      color: 'text.secondary'
                    }}>กำลังโหลดรายชื่อ...</Typography>
                  </Box>
                ) : promotePreview?.total === 0 ? (
                  <Alert severity='warning' sx={{ borderRadius: 2 }}>
                    ไม่มีนักเรียนในห้องเรียนนี้ที่จะเลื่อนชั้นได้
                  </Alert>
                ) : promotePreview && promotePreview.total > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant='subtitle2' sx={{
                        fontWeight: 600
                      }}>
                        นักเรียนที่จะเลื่อนชั้น
                      </Typography>
                      <Chip
                        size='small'
                        label={`${promotePreview.total} คน`}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        maxHeight: 180,
                        overflowY: 'auto',
                        bgcolor: 'background.paper',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1.5,
                      }}
                    >
                      <List disablePadding dense>
                        {promotePreview.students.map((student: any, index: number) => (
                          <ListItem
                            key={student.id}
                            divider={index < promotePreview.students.length - 1}
                            sx={{ py: 0.75, px: 2 }}
                          >
                            <ListItemText
                              primary={student.name}
                              secondary={student.studentId ?? '-'}
                              slotProps={{
                                primary: { variant: 'body2', sx: { fontWeight: 500 } },
                                secondary: { variant: 'caption' },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <RiArrowDownLine size={20} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                2
              </Box>
              <Typography variant='subtitle2' sx={{
                fontWeight: 600
              }}>
                เลือกห้องเรียนปลายทาง
              </Typography>
            </Box>

            <Autocomplete
              id='promote-target-classroom'
              options={classrooms.filter((c) => c.id !== promoteSource?.id)}
              getOptionLabel={(option) => option?.name ?? option?.classroomId ?? ''}
              value={promoteTarget}
              onChange={(_, value) => onTargetChange(value)}
              disabled={isPromoting || !promoteSource || promotePreview?.total === 0}
              renderInput={(params) => (
                <TextField {...params} label='ห้องเรียนปลายทาง' placeholder='พิมพ์เพื่อค้นหา...' sx={CONTROL_SX} />
              )}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              noOptionsText='ไม่พบห้องเรียน'
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 6, pb: 5, pt: 3, gap: 2 }}>
        <Button
          variant='outlined'
          color='inherit'
          onClick={onCancel}
          disabled={isPromoting}
          fullWidth
          id='promotion-dialog-cancel'
        >
          ยกเลิก
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={onConfirm}
          disabled={!promoteSource || !promoteTarget || isPromoting || promotePreview?.total === 0}
          fullWidth
          id='promotion-dialog-confirm'
        >
          {isPromoting ? 'กำลังเลื่อนชั้น...' : 'ยืนยันเลื่อนชั้น'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassroomPromotionDialog;
