'use client';

import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import ThaiDatePicker from '@/@core/components/mui/date-picker-thai';

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

  return (
    <Box
      id='checkin-controls-section'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        mb: responsiveConfig.isMobile ? 2 : 0,
        width: '100%',
        px: 0,
        py: 3,
        backgroundColor: 'transparent',
        borderRadius: '0px',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      {/* แสดงข้อความแจ้งเตือนเมื่อบันทึกแล้ว */}
      {hasSavedCheckIn && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            backgroundColor: 'success.light',
            color: 'success.contrastText',
            borderRadius: 1,
            fontSize: responsiveConfig.isMobile ? '0.875rem' : '0.9375rem', // เพิ่มขนาดตัวอักษร
            fontWeight: 500,
            width: '100%',
          }}
        >
          ✓ บันทึกข้อมูลการเช็คชื่อเรียบร้อยแล้ว
        </Box>
      )}
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
                        backgroundColor: 'background.paper',
                        zIndex: 1300,
                      },
                    },
                  },
                }}
                sx={{
                  height: responsiveConfig.isMobile ? '48px' : '44px',
                  minHeight: responsiveConfig.isMobile ? '48px' : '44px',
                  '& .MuiSelect-select': {
                    height: responsiveConfig.isMobile ? '48px' : '44px',
                    minHeight: responsiveConfig.isMobile ? '48px' : '44px',
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
                      borderRadius: '6px',
                      mx: responsiveConfig.isMobile ? 1 : 1.5,
                      mb: 0.5,
                      minHeight: responsiveConfig.isMobile ? 'auto' : '40px',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
                      backgroundColor: 'background.paper',
                      zIndex: 1300,
                    },
                  },
                },
              }}
              sx={{
                height: responsiveConfig.isMobile ? '48px' : '44px',
                minHeight: responsiveConfig.isMobile ? '48px' : '44px',
                '& .MuiSelect-select': {
                  height: responsiveConfig.isMobile ? '48px' : '44px',
                  minHeight: responsiveConfig.isMobile ? '48px' : '44px',
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
                      borderRadius: '6px',
                      mx: responsiveConfig.isMobile ? 1 : 1.5,
                      mb: 0.5,
                      minHeight: responsiveConfig.isMobile ? 'auto' : '40px',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
                    borderRadius: '8px',
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
              flex: responsiveConfig.isMobile ? '1 1 auto' : '0 0 240px',
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
                      height: responsiveConfig.isMobile ? '48px' : '44px',
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

        {/* Save button */}
        <Button
          id='checkin-save-button'
          variant='contained'
          onClick={onSaveCheckIn}
          disabled={currentStudentsCount === 0 || loading || !defaultClassroom?.id || !isComplete || hasSavedCheckIn}
          size={responsiveConfig.buttonSize}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
            },
            '&:active': {
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              background: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)'),
              boxShadow: 'none',
              transform: 'none',
            },
            minWidth: responsiveConfig.isMobile ? '100%' : '160px',
            maxWidth: responsiveConfig.isMobile ? '100%' : '200px',
            height: responsiveConfig.isMobile ? '48px' : '44px',
            minHeight: responsiveConfig.isMobile ? '48px' : '44px',
            fontSize: responsiveConfig.isMobile ? '1rem' : '0.9rem',
            fontWeight: 600,
            lineHeight: responsiveConfig.isMobile ? '20px' : '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            textTransform: 'none',
            letterSpacing: '0.3px',
            boxShadow: responsiveConfig.isMobile
              ? '0 3px 10px rgba(25, 118, 210, 0.25)'
              : '0 4px 12px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              transition: 'left 0.6s',
            },
            '&:hover::before': {
              left: '100%',
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              กำลังบันทึก...
            </Box>
          ) : (
            'บันทึกการเช็คชื่อ'
          )}
        </Button>
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
              '& .MuiInputBase-input': {
                fontSize: responsiveConfig.inputFontSize,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CheckInControls;
