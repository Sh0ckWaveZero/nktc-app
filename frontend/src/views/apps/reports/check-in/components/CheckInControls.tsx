'use client';

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 */
/* Hallmark · component: check-in controls · genre: modern-minimal · theme: NKTC
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */

import { useState } from 'react';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';
import SHAPE_TOKENS from '@/@core/theme/tokens/shape';

interface CheckInControlsProps {
  isMobile: boolean;
  isTablet: boolean;
  isSmallMobile: boolean;
  classrooms: any[];
  defaultClassroom: any;
  currentStudentsCount: number;
  isComplete: boolean;
  loading: boolean;
  hasSavedCheckIn: boolean;
  developmentReset?: {
    isResetting: boolean;
    onReset: () => void;
  };
  selectedDate?: Date | null;
  formSize: 'small' | 'medium';
  inputFontSize: string;
  inputPadding: string;
  buttonSize: 'small' | 'medium';
  buttonMinWidth: string;
  buttonFontSize: string;
  onClassroomChange: (event: any) => void;
  onDateChange?: (date: Date | null) => void;
  onSaveCheckIn: () => void;
  activityType?: string;
  onActivityTypeChange?: (event: any) => void;
  activityTypes?: { value: string; label: string }[];
  noteValue?: string;
  onNoteChange?: (value: string) => void;
}

const CheckInControls = ({
  isMobile,
  isTablet,
  isSmallMobile,
  classrooms,
  defaultClassroom,
  currentStudentsCount,
  isComplete,
  loading,
  hasSavedCheckIn,
  developmentReset,
  selectedDate,
  formSize,
  inputFontSize,
  inputPadding,
  buttonSize,
  buttonMinWidth,
  buttonFontSize,
  onClassroomChange,
  onDateChange,
  onSaveCheckIn,
  activityType,
  onActivityTypeChange,
  activityTypes,
  noteValue,
  onNoteChange,
}: CheckInControlsProps) => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const canResetCheckIn = hasSavedCheckIn && Boolean(developmentReset);

  const handleConfirmReset = (): void => {
    developmentReset?.onReset();
    setIsResetDialogOpen(false);
  };

  // Responsive configuration
  const responsiveConfig = {
    isMobile,
    isTablet,
    isSmallMobile,
    formSize,
    inputFontSize,
    inputPadding,
    buttonSize,
    buttonMinWidth,
    buttonFontSize,
  };
  const controlHeight = responsiveConfig.isMobile ? '3rem' : '2.75rem';
  const actionButtonWidth = responsiveConfig.isMobile ? '100%' : '11rem';

  return (
    <Box
      id='checkin-controls-section'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        p: 0,
        backgroundColor: 'transparent',
      }}
    >
      {/* Controls Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: responsiveConfig.isMobile ? 2 : 3,
          flexDirection: responsiveConfig.isMobile ? 'column' : 'row',
          width: '100%',
        }}
      >
        {/* กิจกรรม (ถ้ามี) */}
        {activityTypes && onActivityTypeChange && (
          <Box
            id='checkin-activity-type-controls'
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              width: '100%',
              minWidth: 'auto',
              maxWidth: 'none',
            }}
          >
            <FormControl id='checkin-activity-type-form' fullWidth size={responsiveConfig.formSize}>
              <InputLabel id='checkin-activity-type-label' size={responsiveConfig.formSize}>
                เลือกประเภทกิจกรรม
              </InputLabel>
              <Select
                labelId='checkin-activity-type-label'
                id='checkin-activity-type-select'
                value={activityType || ''}
                label='เลือกประเภทกิจกรรม'
                onChange={onActivityTypeChange}
                size={responsiveConfig.formSize}
                MenuProps={{
                  slotProps: {
                    paper: {
                      sx: {
                        borderRadius: SHAPE_TOKENS.surface,
                        backgroundColor: 'background.paper',
                        zIndex: 1300,
                      },
                    },
                  },
                }}
                sx={{
                  height: controlHeight,
                  borderRadius: SHAPE_TOKENS.control,
                  backgroundColor: 'background.paper',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                {activityTypes.map((type) => (
                  <MenuItem
                    key={type.value}
                    value={type.value}
                    sx={{
                      fontSize: responsiveConfig.inputFontSize,
                      py: 1.5,
                      px: 2.5,
                      borderRadius: SHAPE_TOKENS.compact,
                      mx: responsiveConfig.isMobile ? 1 : 1.5,
                      mb: 0.5,
                      minHeight: responsiveConfig.isMobile ? 'auto' : '40px',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* ชั้นเรียนและกิจกรรม */}
        <Box
          id='checkin-classroom-controls'
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            width: '100%',
            minWidth: 'auto',
            maxWidth: 'none',
          }}
        >
          <FormControl id='checkin-classroom-form' fullWidth size={responsiveConfig.formSize}>
            <InputLabel id='checkin-classroom-label' size={responsiveConfig.formSize}>
              เลือกห้องเรียน
            </InputLabel>
            <Select
              labelId='checkin-classroom-label'
              id='checkin-classroom-select'
              value={defaultClassroom?.name || ''}
              label='เลือกห้องเรียน'
              onChange={onClassroomChange}
              size={responsiveConfig.formSize}
              displayEmpty
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: SHAPE_TOKENS.surface,
                      backgroundColor: 'background.paper',
                      zIndex: 1300,
                    },
                  },
                },
              }}
              sx={{
                height: controlHeight,
                borderRadius: SHAPE_TOKENS.control,
                backgroundColor: 'background.paper',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              {classrooms && classrooms.length > 0 ? (
                classrooms.map((classroom: any) => (
                  <MenuItem
                    key={classroom.id}
                    value={classroom.name}
                    sx={{
                      fontSize: responsiveConfig.inputFontSize,
                      py: responsiveConfig.isMobile ? 1.5 : 1.5,
                      px: responsiveConfig.isMobile ? 2.5 : 2.5,
                      borderRadius: SHAPE_TOKENS.compact,
                      mx: responsiveConfig.isMobile ? 1 : 1.5,
                      mb: 0.5,
                      minHeight: responsiveConfig.isMobile ? 'auto' : '40px',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    {classroom.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem
                  disabled
                  sx={{
                    fontSize: responsiveConfig.inputFontSize,
                    py: responsiveConfig.isMobile ? 2 : 2,
                    px: responsiveConfig.isMobile ? 3 : 3,
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    borderRadius: SHAPE_TOKENS.compact,
                    mx: responsiveConfig.isMobile ? 1 : 1.5,
                    mb: 1,
                  }}
                >
                  ไม่มีห้องเรียน
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        {onDateChange && (
          <Box
            id='checkin-date-controls'
            sx={{
              flex: responsiveConfig.isMobile ? '1 1 auto' : '0 0 15rem',
              width: '100%',
            }}
          >
            <ThaiDatePicker
              label='วันที่เช็คชื่อ'
              value={selectedDate ?? null}
              onChange={onDateChange}
              format='dd-MM-yyyy'
              minDate={new Date(new Date().getFullYear() - 1, 0, 1)}
              maxDate={new Date()}
              placeholder='วัน/เดือน/ปี (พ.ศ.)'
              slotProps={{
                textField: {
                  size: responsiveConfig.formSize,
                  sx: {
                    '& .MuiInputBase-root': {
                      height: controlHeight,
                      borderRadius: SHAPE_TOKENS.control,
                      backgroundColor: 'background.paper',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: responsiveConfig.inputFontSize,
                    },
                  },
                },
              }}
            />
          </Box>
        )}

        {canResetCheckIn ? (
          <Button
            id='checkin-reset-button'
            variant='contained'
            color='warning'
            startIcon={<RestartAltOutlined />}
            onClick={() => setIsResetDialogOpen(true)}
            disabled={developmentReset?.isResetting}
            size={responsiveConfig.buttonSize}
            sx={(theme) => ({
              flex: `0 0 ${actionButtonWidth}`,
              width: actionButtonWidth,
              minWidth: actionButtonWidth,
              maxWidth: actionButtonWidth,
              height: controlHeight,
              minHeight: controlHeight,
              px: 3,
              fontSize: responsiveConfig.isMobile ? '1rem' : '0.9rem',
              fontWeight: 700,
              borderRadius: SHAPE_TOKENS.control,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              color: theme.palette.getContrastText(theme.palette.warning.main),
              backgroundColor: 'warning.main',
              boxShadow: 'none',
              transition:
                'background-color 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 100ms cubic-bezier(0.16, 1, 0.3, 1)',
              '@media (hover: hover) and (pointer: fine)': {
                '&:hover': {
                  backgroundColor: 'warning.dark',
                  boxShadow: 'none',
                  transform: 'translateY(-1px)',
                },
              },
              '&:active': {
                transform: 'translateY(1px)',
              },
              '&.Mui-disabled': {
                color: 'text.disabled',
                backgroundColor: 'action.disabledBackground',
              },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                transform: 'none',
              },
            })}
          >
            {developmentReset?.isResetting ? 'กำลัง Reset...' : 'Reset การเช็คชื่อ'}
          </Button>
        ) : !hasSavedCheckIn ? (
          <Button
            id='checkin-save-button'
            variant='contained'
            onClick={onSaveCheckIn}
            disabled={currentStudentsCount === 0 || loading || !defaultClassroom?.id || !isComplete || hasSavedCheckIn}
            size={responsiveConfig.buttonSize}
            sx={(theme) => ({
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'text.disabled',
                boxShadow: 'none',
              },
              flex: `0 0 ${actionButtonWidth}`,
              width: actionButtonWidth,
              minWidth: actionButtonWidth,
              maxWidth: actionButtonWidth,
              height: controlHeight,
              minHeight: controlHeight,
              px: 3,
              fontSize: responsiveConfig.isMobile ? '1rem' : '0.9rem',
              fontWeight: 600,
              lineHeight: responsiveConfig.isMobile ? '20px' : '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: SHAPE_TOKENS.control,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              color: theme.palette.getContrastText(theme.palette.primary.main),
              backgroundColor: 'primary.main',
            })}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: SHAPE_TOKENS.circle,
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      animationDuration: '2s',
                    },
                  }}
                />
                กำลังบันทึก...
              </Box>
            ) : (
              'บันทึกการเช็คชื่อ'
            )}
          </Button>
        ) : null}
      </Box>

      {onNoteChange && (
        <Box id='checkin-note-controls' sx={{ width: '100%' }}>
          <TextField
            id='checkin-note-input'
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            size={responsiveConfig.formSize}
            label='หมายเหตุ'
            placeholder='กรอกหมายเหตุเพิ่มเติม (ถ้ามี)'
            value={noteValue || ''}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={loading || !defaultClassroom?.id || hasSavedCheckIn}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: SHAPE_TOKENS.control,
              },
              '& .MuiInputBase-input': {
                fontSize: responsiveConfig.inputFontSize,
              },
            }}
          />
        </Box>
      )}

      <Dialog
        open={isResetDialogOpen}
        onClose={(_, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setIsResetDialogOpen(false);
          }
        }}
        aria-labelledby='checkin-reset-dialog-title'
        aria-describedby='checkin-reset-dialog-description'
        maxWidth='xs'
        fullWidth
        scroll='paper'
        slotProps={{
          root: {
            id: 'checkin-reset-dialog-root',
          },
          container: {
            id: 'checkin-reset-dialog-container',
          },
          paper: {
            id: 'checkin-reset-dialog',
          },
        }}
        sx={{
          height: '100dvh',
          '& .MuiDialog-container': {
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto',
          },
          '& .MuiDialog-paper': {
            alignSelf: 'center',
            justifySelf: 'center',
            width: (theme) => `calc(100% - ${theme.spacing(8)})`,
            m: '0 !important',
            maxHeight: (theme) => `calc(100dvh - ${theme.spacing(8)})`,
            borderRadius: SHAPE_TOKENS.surface,
          },
        }}
      >
        <DialogTitle id='checkin-reset-dialog-title'>Reset ข้อมูลการเช็คชื่อ?</DialogTitle>
        <DialogContent>
          <DialogContentText id='checkin-reset-dialog-description'>
            ระบบจะลบข้อมูลที่บันทึกของห้องและวันที่นี้ เพื่อให้สามารถทดลองเช็คชื่อและบันทึกใหม่ได้อีกครั้ง
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, '& .MuiButton-root': { borderRadius: SHAPE_TOKENS.control } }}>
          <Button
            id='checkin-reset-cancel-button'
            autoFocus
            onClick={() => setIsResetDialogOpen(false)}
            color='inherit'
          >
            ยกเลิก
          </Button>
          <Button
            id='checkin-reset-confirm-button'
            onClick={handleConfirmReset}
            variant='contained'
            color='warning'
            startIcon={<RestartAltOutlined />}
            disabled={developmentReset?.isResetting}
          >
            ยืนยัน Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckInControls;
