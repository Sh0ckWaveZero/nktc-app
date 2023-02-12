// ** MUI Imports
import { Box, Theme, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

// ** Next Import
import Link from 'next/link';

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography sx={{ mr: 2 }}>
        {`© ${new Date().getFullYear()}, Made with `}
        <Box component='span' sx={{ color: 'error.main' }}>
          ❤️
        </Box>
        {` by `}
        <LinkStyled target='_blank' href='#'>
          MIDSEELEE
        </LinkStyled>
      </Typography>
      {hidden ? null : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            '& :not(:last-child)': { mr: 4 },
          }}
        >
          <LinkStyled
            target='_blank'
            href='https://demos.themeselection.com/materio-mui-react-nextjs-admin-template/documentation'
          >
            Documentation
          </LinkStyled>
        </Box>
      )}
    </Box>
  );
};

export default FooterContent;
