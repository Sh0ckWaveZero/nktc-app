// ** React Imports
import {ReactNode} from 'react';

// ** MUI Imports
import {SvgIconProps} from '@mui/material';
import Icon from '@mdi/react'
import Box from "@mui/material/Box";

interface UserIconProps {
  iconProps?: SvgIconProps;
  icon: string | ReactNode;
  size?: number;
  styles?: object;
}

const UserIcon = (props: UserIconProps) => {
  // ** Props
  const {icon, iconProps, size = 1, styles} = props;

  const initStyles = {
    ...styles,
    display: 'flex',
    alignItems: 'center',
  }

  return (
    <Box sx={initStyles}>
      <Icon path={icon as string} size={size}/>
    </Box>
  )


};

export default UserIcon;
