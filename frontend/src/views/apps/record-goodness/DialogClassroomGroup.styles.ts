import { Dialog, styled } from '@mui/material';

/**
 * Styled Dialog component for classroom group selection
 * Provides consistent padding and styling across the application
 */
export const StyledClassroomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(5),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3),
  },
}));
