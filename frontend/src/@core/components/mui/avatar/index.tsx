'use client';

// ** React Imports
import { forwardRef } from 'react';

// ** MUI Imports
import MuiAvatar from '@mui/material/Avatar';
import { lighten, useTheme } from '@mui/material/styles';

// ** Types
import { CustomAvatarProps } from './types';
import { ThemeColor } from '@/@core/layouts/types';

// ** Hooks Imports
import useBgColor, { UseBgColorType } from '@/@core/hooks/useBgColor';
import { Badge } from '@mui/material';
import IconifyIcon from '../../icon';

 
const Avatar = forwardRef<HTMLDivElement, CustomAvatarProps>((props, ref) => {
  // ** Props
  const { sx, src, skin = 'filled', color = 'primary', badge = '' } = props;

  // ** Hook
  const theme: any = useTheme();
  const bgColors: UseBgColorType = useBgColor();

  const getAvatarStyles = (skin: 'filled' | 'light' | 'light-static' | undefined, skinColor: ThemeColor) => {
    let avatarStyles;

    if (skin === 'light') {
      avatarStyles = { ...bgColors[`${skinColor}Light`] };
    } else if (skin === 'light-static') {
      avatarStyles = {
        color: bgColors[`${skinColor}Light`].color,
        backgroundColor: lighten(theme.palette[skinColor].main, 0.88),
      };
    } else {
      avatarStyles = { ...bgColors[`${skinColor}Filled`] };
    }

    return avatarStyles;
  };

  const colors: UseBgColorType & { other?: any } = {
    primary: getAvatarStyles(skin, 'primary'),
    secondary: getAvatarStyles(skin, 'secondary'),
    success: getAvatarStyles(skin, 'success'),
    error: getAvatarStyles(skin, 'error'),
    warning: getAvatarStyles(skin, 'warning'),
    info: getAvatarStyles(skin, 'info'),
    other: getAvatarStyles(skin, 'other'),
  };

  const avatarElement = (
    <MuiAvatar ref={ref} {...props} sx={!src && skin && color ? Object.assign(colors[color], sx) : sx} />
  );

  if (badge) {
    return (
      <Badge
        overlap='circular'
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        color='success'
        badgeContent={<IconifyIcon icon={badge} />}
        sx={{
          '& .MuiBadge-badge': {
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            border: `2px solid ${theme.palette.background.paper}`,
          },
        }}
      >
        {avatarElement}
      </Badge>
    );
  } else {
    return avatarElement;
  }
}) as React.ForwardRefExoticComponent<CustomAvatarProps & React.RefAttributes<HTMLDivElement>>;

export default Avatar;
