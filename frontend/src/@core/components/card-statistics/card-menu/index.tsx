// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

// ** Icons Imports
import DotsVertical from 'mdi-material-ui/DotsVertical';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';

// ** Types Imports
import { CardMenuProps } from '@/@core/components/card-statistics/types';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';
import Link from 'next/link';

const CardMenu = (props: CardMenuProps) => {
  // ** Props
  const { title, subtitle, color, icon, navLink } = props;
  return (
    <CanViewNavLink navLink={navLink}>
      <Link href={`${navLink?.path}`} passHref>
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
      </Link>
    </CanViewNavLink>
  );
};

export default CardMenu;

CardMenu.defaultProps = {
  color: 'primary',
  trend: 'positive',
};
