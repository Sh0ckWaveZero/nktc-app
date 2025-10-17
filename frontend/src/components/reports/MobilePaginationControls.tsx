'use client';

import { Box, Button, Typography } from '@mui/material';

interface MobilePaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexDirection: 'column',
        px: 2,
        '@media (min-width: 400px)': {
          gap: 2,
        },
        '@media (min-width: 600px)': {
          flexDirection: 'row',
          px: 0,
        },
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        '@media (min-width: 400px)': {
          gap: 1,
        },
      }}>
        <Button
          id='mobile-pagination-first'
          variant='outlined'
          size='small'
          disabled={currentPage === 0}
          onClick={() => onPageChange(0)}
          sx={{
            minWidth: 'auto',
            px: 1,
            fontSize: '0.75rem',
            '@media (min-width: 400px)': {
              px: 1.5,
              fontSize: '0.875rem',
            },
          }}
        >
          «
        </Button>
        <Button
          id='mobile-pagination-prev'
          variant='outlined'
          size='small'
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          sx={{
            minWidth: 'auto',
            px: 1,
            fontSize: '0.75rem',
            '@media (min-width: 400px)': {
              px: 1.5,
              fontSize: '0.875rem',
            },
          }}
        >
          ‹
        </Button>

        <Typography
          variant='body2'
          sx={{
            mx: 1,
            minWidth: '80px',
            textAlign: 'center',
            fontSize: '0.75rem',
            '@media (min-width: 400px)': {
              mx: 2,
              minWidth: '100px',
              fontSize: '0.875rem',
            },
          }}
        >
          {`${currentPage + 1} / ${totalPages}`}
          <br />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              fontSize: '0.65rem',
              '@media (min-width: 400px)': {
                fontSize: '0.75rem',
              },
            }}
          >
            ({startIndex + 1}-{endIndex} จาก {totalItems})
          </Typography>
        </Typography>

        <Button
          id='mobile-pagination-next'
          variant='outlined'
          size='small'
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          sx={{
            minWidth: 'auto',
            px: 1,
            fontSize: '0.75rem',
            '@media (min-width: 400px)': {
              px: 1.5,
              fontSize: '0.875rem',
            },
          }}
        >
          ›
        </Button>
        <Button
          id='mobile-pagination-last'
          variant='outlined'
          size='small'
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          sx={{
            minWidth: 'auto',
            px: 1,
            fontSize: '0.75rem',
            '@media (min-width: 400px)': {
              px: 1.5,
              fontSize: '0.875rem',
            },
          }}
        >
          »
        </Button>
      </Box>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        '@media (min-width: 400px)': {
          gap: 1,
        },
      }}>
        <Typography
          variant='caption'
          sx={{
            minWidth: '50px',
            fontSize: '0.7rem',
            '@media (min-width: 400px)': {
              minWidth: '60px',
              fontSize: '0.75rem',
            },
          }}
        >
          แสดง:
        </Typography>
        {[5, 10, 20].map((size) => (
          <Button
            key={size}
            id={`mobile-page-size-${size}`}
            variant={pageSize === size ? 'contained' : 'outlined'}
            size='small'
            onClick={() => onPageSizeChange(size)}
            sx={{
              minWidth: 'auto',
              px: 1,
              fontSize: '0.7rem',
              '@media (min-width: 400px)': {
                px: 1.5,
                fontSize: '0.75rem',
              },
            }}
          >
            {size}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default MobilePaginationControls;
