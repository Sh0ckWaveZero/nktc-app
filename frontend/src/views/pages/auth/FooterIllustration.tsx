'use client';

// ** React Imports
import { Fragment, ReactNode } from 'react';

// ** MUI Components
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';

interface FooterIllustrationsV1Props {
  image?: ReactNode;
}

// Styled Components
const MaskImg = styled('img')(() => ({
  bottom: 0,
  zIndex: -1,
  width: '100%',
  position: 'absolute'
}));

const Tree1Img = styled('img')(() => ({
  left: 0,
  bottom: 0,
  position: 'absolute'
}));

const Tree2Img = styled('img')(() => ({
  right: 0,
  bottom: 0,
  position: 'absolute'
}));

const FooterIllustrationsV1 = (props: FooterIllustrationsV1Props) => {
  // ** Props
  const { image } = props;

  // ** Hook
  const theme = useTheme();

  // ** Vars
  const hidden = useMediaQuery(theme.breakpoints.down('md'));

  if (!hidden) {
    return (
      <Fragment>
        {!image ? (
          <Fragment>
            <MaskImg alt='mask' src={`/images/pages/misc-mask-${theme.palette.mode}.png`} />
            <Tree1Img alt='tree' src='/images/pages/tree.png' />
            <Tree2Img alt='tree-2' src='/images/pages/tree-2.png' />
          </Fragment>
        ) : (
          image
        )}
      </Fragment>
    );
  } else {
    return null;
  }
};

export default FooterIllustrationsV1;