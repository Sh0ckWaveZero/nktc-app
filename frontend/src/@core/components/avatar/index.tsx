import { CircularProgress, Box } from '@mui/material';
import CustomAvatar from '@/@core/components/mui/avatar';
import { getInitials } from '@/@core/utils/get-initials';
import useImageQuery from '@/hooks/useImageQuery';

interface RenderAvatarProps {
  row: any;
  customStyle?: any;
}

const RenderAvatar = (props: RenderAvatarProps) => {
  const {
    row,
    customStyle = {
      mr: 3,
      width: 40,
      height: 40,
    },
  } = props;

  // Always call the hook (don't call conditionally)
  const { isLoading, image } = useImageQuery(row?.avatar || '');

  // Show loading spinner only briefly
  if (row?.avatar && isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...customStyle }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // If image loaded successfully, display it
  if (image && image !== '/images/avatars/1.png' && row?.avatar) {
    return <CustomAvatar src={image} sx={customStyle} alt={`${row?.firstName} ${row?.lastName}`} />;
  }

  // Fall back to initials (handles no avatar, loading failed, or default avatar)
  return (
    <CustomAvatar skin='light' color={row?.avatarColor || 'primary'} sx={customStyle}>
      {getInitials(row?.firstName + ' ' + row?.lastName)}
    </CustomAvatar>
  );
};

export default RenderAvatar;
