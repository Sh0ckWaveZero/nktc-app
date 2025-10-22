import { CircularProgress } from '@mui/material';
import CustomAvatar from '@/@core/components/mui/avatar';
import { getInitials } from '@/@core/utils/get-initials';
import useGetImage from '@/hooks/useGetImage';

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

  if (row?.avatar) {
    const { isLoading, image } = useGetImage(row.avatar);
    return isLoading ? <CircularProgress /> : <CustomAvatar src={image as string} sx={customStyle} />;
  } else {
    return (
      <CustomAvatar skin='light' color={row?.avatarColor || 'primary'} sx={customStyle}>
        {getInitials(row?.firstName + ' ' + row?.lastName)}
      </CustomAvatar>
    );
  }
};

export default RenderAvatar;
