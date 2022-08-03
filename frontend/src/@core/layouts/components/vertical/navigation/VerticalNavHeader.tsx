// ** React Import
import { ReactNode } from "react";

// ** Next Import
import Link from "next/link";

// ** MUI Imports
import IconButton from "@mui/material/IconButton";
import Box, { BoxProps } from "@mui/material/Box";
import { styled, useTheme } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";

// ** Icons
import Close from "mdi-material-ui/Close";
import CircleOutline from "mdi-material-ui/CircleOutline";
import RecordCircleOutline from "mdi-material-ui/RecordCircleOutline";

// ** Type Import
import { Settings } from "src/@core/context/settingsContext";

// ** Configs
import themeConfig from "src/configs/themeConfig";

interface Props {
  hidden: boolean;
  navHover: boolean;
  settings: Settings;
  collapsedNavWidth: number;
  menuLockedIcon?: ReactNode;
  menuUnlockedIcon?: ReactNode;
  navigationBorderWidth: number;
  toggleNavVisibility: () => void;
  saveSettings: (values: Settings) => void;
  verticalNavMenuBranding?: (props?: any) => ReactNode;
}

// ** Styled Components
const MenuHeaderWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingRight: theme.spacing(4.5),
  transition: "padding .25s ease-in-out",
  minHeight: theme.mixins.toolbar.minHeight,
}));

const HeaderTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  lineHeight: "normal",
  textTransform: "uppercase",
  color: theme.palette.text.primary,
  transition: "opacity .25s ease-in-out, margin .25s ease-in-out",
}));

const StyledLink = styled("a")({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
});

const VerticalNavHeader = (props: Props) => {
  // ** Props
  const {
    hidden,
    navHover,
    settings,
    saveSettings,
    collapsedNavWidth,
    toggleNavVisibility,
    navigationBorderWidth,
    menuLockedIcon: userMenuLockedIcon,
    menuUnlockedIcon: userMenuUnlockedIcon,
    verticalNavMenuBranding: userVerticalNavMenuBranding,
  } = props;

  // ** Hooks & Vars
  const theme = useTheme();
  const { navCollapsed } = settings;

  const menuCollapsedStyles =
    navCollapsed && !navHover ? { opacity: 0 } : { opacity: 1 };

  const menuHeaderPaddingLeft = () => {
    if (navCollapsed && !navHover) {
      if (userVerticalNavMenuBranding) {
        return 0;
      } else {
        return (collapsedNavWidth - navigationBorderWidth - 30) / 8;
      }
    } else {
      return 6;
    }
  };

  const MenuLockedIcon = () =>
    userMenuLockedIcon || (
      <RecordCircleOutline
        sx={{
          fontSize: "1.25rem",
          pointerEvents: "none",
          ...menuCollapsedStyles,
          transition: "opacity .25s ease-in-out",
        }}
      />
    );

  const MenuUnlockedIcon = () =>
    userMenuUnlockedIcon || (
      <CircleOutline
        sx={{
          fontSize: "1.25rem",
          pointerEvents: "none",
          ...menuCollapsedStyles,
          transition: "opacity .25s ease-in-out",
        }}
      />
    );

  return (
    <MenuHeaderWrapper
      className="nav-header"
      sx={{ pl: menuHeaderPaddingLeft() }}
    >
      {userVerticalNavMenuBranding ? (
        userVerticalNavMenuBranding(props)
      ) : (
        <Link href="/" passHref>
          <StyledLink>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              width="30"
              height="26.2"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 310 256"
            >
              <g transform="rotate(90 155 155)">
                <path
                  fill={theme.palette.primary.main}
                  d="M254.313 235.519L148 9.749A17.063 17.063 0 0 0 133.473.037a16.87 16.87 0 0 0-15.533 8.052L2.633 194.848a17.465 17.465 0 0 0 .193 18.747L59.2 300.896a18.13 18.13 0 0 0 20.363 7.489l163.599-48.392a17.929 17.929 0 0 0 11.26-9.722a17.542 17.542 0 0 0-.101-14.76l-.008.008Zm-23.802 9.683l-138.823 41.05c-4.235 1.26-8.3-2.411-7.419-6.685l49.598-237.484c.927-4.443 7.063-5.147 9.003-1.035l91.814 194.973a6.63 6.63 0 0 1-4.18 9.18h.007Z"
                />
              </g>
            </svg>
            <HeaderTitle
              variant="h6"
              sx={{
                ...menuCollapsedStyles,
                ...(navCollapsed && !navHover ? {} : { ml: 3 }),
              }}
            >
              {themeConfig.templateName}
            </HeaderTitle>
          </StyledLink>
        </Link>
      )}

      {hidden ? (
        <IconButton
          disableRipple
          disableFocusRipple
          onClick={toggleNavVisibility}
          sx={{ p: 0, backgroundColor: "transparent !important" }}
        >
          <Close fontSize="small" />
        </IconButton>
      ) : (
        <IconButton
          disableRipple
          disableFocusRipple
          onClick={() =>
            saveSettings({ ...settings, navCollapsed: !navCollapsed })
          }
          sx={{
            p: 0,
            color: "text.primary",
            backgroundColor: "transparent !important",
          }}
        >
          {navCollapsed ? MenuUnlockedIcon() : MenuLockedIcon()}
        </IconButton>
      )}
    </MenuHeaderWrapper>
  );
};

export default VerticalNavHeader;
