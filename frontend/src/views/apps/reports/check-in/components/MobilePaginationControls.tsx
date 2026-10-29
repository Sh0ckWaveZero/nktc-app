'use client';

import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, Button, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';

import SHAPE_TOKENS from '@/@core/theme/tokens/shape';

interface MobilePaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const MobilePaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: MobilePaginationControlsProps) => {
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <Box
      id='checkin-mobile-pagination'
      sx={{
        mt: 3,
        pt: 1,
      }}
    >
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5, textAlign: 'center' }}>
        แสดง {startIndex + 1}–{endIndex} จาก {totalItems} คน
      </Typography>

      <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          id='mobile-pagination-prev'
          variant='outlined'
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          startIcon={<ChevronLeft />}
          sx={{ minHeight: 44, borderRadius: SHAPE_TOKENS.control }}
        >
          ก่อนหน้า
        </Button>

        <Typography variant='body2' sx={{ minWidth: 72, textAlign: 'center', fontWeight: 600 }}>
          {currentPage + 1} / {totalPages}
        </Typography>

        <Button
          id='mobile-pagination-next'
          variant='outlined'
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          endIcon={<ChevronRight />}
          sx={{ minHeight: 44, borderRadius: SHAPE_TOKENS.control }}
        >
          ถัดไป
        </Button>
      </Stack>

      {onPageSizeChange && (
        <Stack direction='row' spacing={1.5} sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            จำนวนต่อหน้า
          </Typography>
          <FormControl size='small'>
            <Select
              id='mobile-page-size-select'
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              inputProps={{ 'aria-label': 'จำนวนรายชื่อต่อหน้า' }}
              sx={{ minWidth: 80, borderRadius: SHAPE_TOKENS.control }}
            >
              {[2, 5, 10, 20, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}
    </Box>
  );
};

export default MobilePaginationControls;
