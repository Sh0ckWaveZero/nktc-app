// ** MUI Imports
import { Box, Card, CardContent, Typography } from '@mui/material';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Types Imports
import type { CardMenuProps } from '@/@core/components/card-statistics/types';
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
  return (
    <CanViewNavLink navLink={navLink}>
      <LinkStyled href={`${navLink?.path}`} passHref>
        <Card
          sx={{
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
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
          <CardContent
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CustomAvatar
                badge={badge}
                sx={{
                  boxShadow: 2,
                  height: '4rem',
                  width: '4rem',
                  flexShrink: 0,
                  '& svg': {
                    fontSize: '3rem',
                    padding: '0.2rem',
                  },
                }}
              >
                {icon}
              </CustomAvatar>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  minHeight: '2.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant='subtitle2'
                sx={{
                  textAlign: 'center',
                  lineHeight: 1.3,
                  minHeight: '2.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </LinkStyled>
    </CanViewNavLink>
  );
};

export default CardMenu;
