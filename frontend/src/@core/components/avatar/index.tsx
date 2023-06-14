import { CircularProgress } from '@mui/material';
import CustomAvatar from '@/@core/components/mui/avatar';
import { getInitials } from '@/@core/utils/get-initials';
import useGetImage from '@/hooks/useGetImage';

interface RenderAvatarProps {
  row: any;
  storedToken: string;
}

const RenderAvatar = (props: RenderAvatarProps) => {
  const { row, storedToken } = props;
  if (row?.avatar) {
    const { isLoading, image } = useGetImage(row.avatar, storedToken);
    return isLoading ? (
      <CircularProgress />
    ) : (
      <CustomAvatar src={image as string} sx={{ mr: 3, width: 40, height: 40 }} />
    );
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row?.avatarColor || 'primary'}
        sx={{ mr: 3, width: 40, height: 40, fontSize: '.875rem' }}
      >
        {getInitials(row?.firstName + ' ' + row?.lastName)}
      </CustomAvatar>
    );
  }
};

export default RenderAvatar;
