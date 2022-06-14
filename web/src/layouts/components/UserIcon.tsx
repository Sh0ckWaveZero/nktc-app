// ** MUI Imports
import Icon from "@mdi/react";
import { Box, SvgIconProps } from "@mui/material";
import { ReactNode } from "react";

interface UserIconProps {
  iconProps?: SvgIconProps;
  icon: string | ReactNode;
  size?: number;
  styles?: any;
}

const UserIcon = (props: UserIconProps) => {
  // ** Props
  const { icon, iconProps, size = 1, styles } = props;

  const initStyles = {
    display: "flex",
    alignItems: "center",
    ...styles,
  };

  return (
    <Box sx={initStyles}>
      <Icon path={icon as string} size={size} />
    </Box>
  );
};

export default UserIcon;
