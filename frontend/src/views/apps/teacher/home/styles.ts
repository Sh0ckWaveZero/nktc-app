import { styled, alpha } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';

export const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px 0 rgba(79, 70, 229, 0.15)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    right: '-10%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    filter: 'blur(30px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-20%',
    left: '-5%',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    filter: 'blur(20px)',
  },
}));

export const GlassCard = styled(Card)(({ theme }) => ({
  backdropFilter: 'blur(16px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.08)',
  },
}));

export const QuickActionButton = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  height: '100%',
  textAlign: 'center',
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: theme.palette.primary.light,
    '& .action-avatar': {
      transform: 'scale(1.1)',
    },
  },
}));

export const RiskAvatar = styled(Avatar)(({ theme }) => ({
  width: 44,
  height: 44,
  fontSize: '0.875rem',
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.error.main, 0.08),
  color: theme.palette.error.main,
  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
}));

export const StarAvatar = styled(Avatar)(({ theme }) => ({
  width: 44,
  height: 44,
  fontSize: '0.875rem',
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.warning.main, 0.08),
  color: theme.palette.warning.main,
  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
}));
