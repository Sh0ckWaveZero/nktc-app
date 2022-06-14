// ** React Imports
import { ReactNode } from "react";

// ** MUI Imports
import { Zoom, useScrollTrigger } from "@mui/material";
import { makeStyles, styled } from "@mui/styles";

interface ScrollToTopProps {
  className?: string;
  children: ReactNode;
}

const ScrollToTopStyled = styled("div")(({ theme }: any) => ({
  zIndex: 11,
  position: "fixed",
  right: theme.spacing(6),
  bottom: theme.spacing(10),
}));

const ScrollToTop = (props: ScrollToTopProps) => {
  // ** Props
  const { children, className } = props;

  // ** init trigger
  const trigger = useScrollTrigger({
    threshold: 400,
    disableHysteresis: true,
  });

  const handleClick = () => {
    const anchor = document.querySelector("body");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Zoom in={trigger}>
      <ScrollToTopStyled
        className={className}
        onClick={handleClick}
        role="presentation"
      >
        {children}
      </ScrollToTopStyled>
    </Zoom>
  );
};

export default ScrollToTop;
