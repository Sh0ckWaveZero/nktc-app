// ** MUI Imports
import { Box, Card, CardContent, Typography, alpha, useTheme } from '@mui/material';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Types Imports
import { CardMenuProps } from '@/@core/components/card-statistics/types';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';
import Link from 'next/link';
import { styled } from '@mui/material/styles';

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

const CardMenu = (props: CardMenuProps) => {
  // ** Props
  const { title, subtitle, color = 'primary', icon, navLink, badge } = props;
  const theme = useTheme();
  const hoverBgColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : alpha(theme.palette.primary.main, 0.08);

  return (
    <CanViewNavLink navLink={navLink}>
      <LinkStyled href={`${navLink?.path}`} passHref>
        <Card
          sx={{
            ':hover': {
              backgroundColor: hoverBgColor,
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              '& .MuiAvatar-root': {
                backgroundColor: color,
              },
            },
          }}
        >
          <CardContent>
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <CustomAvatar
                badge={badge}
                sx={{
                  boxShadow: 2,
                  m: 2,
                  height: '4rem',
                  width: '4rem',
                  '& svg': {
                    fontSize: '3rem',
                    padding: '0.2rem',
                  },
                }}
              >
                {icon}
              </CustomAvatar>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{title}</Typography>
              <Typography variant='subtitle2'>{subtitle}</Typography>
            </Box>
          </CardContent>
        </Card>
      </LinkStyled>
    </CanViewNavLink>
  );
};

export default CardMenu;
