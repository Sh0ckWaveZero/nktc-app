// ** MUI Imports
import { Box, Card, CardContent, Typography } from '@mui/material';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Types Imports
import { CardMenuProps } from '@/@core/components/card-statistics/types';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';
import Link from 'next/link';
import { styled } from '@mui/material/styles'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const CardMenu = (props: CardMenuProps) => {
  // ** Props
  const { title, subtitle, color, icon, navLink } = props;
  return (
    <CanViewNavLink navLink={navLink}>
      <LinkStyled href={`${navLink?.path}`} passHref>
        <Card
          sx={{
            ':hover': {
              backgroundColor: '#f5f5f5',
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
                sx={{
                  boxShadow: 2,
                  m: 2,
                  height: '5rem',
                  width: '5rem',
                  '& svg': {
                    fontSize: '4rem',
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

CardMenu.defaultProps = {
  color: 'primary',
  trend: 'positive',
};
