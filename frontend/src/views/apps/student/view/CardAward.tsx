// ** MUI Imports
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

// ** Hook
import { useSettings } from '@/@core/hooks/useSettings';
import { useAuth } from '../../../../hooks/useAuth';
import { forwardRef } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { Dialog, Slide } from '@mui/material';
import Icon from '@/@core/components/icon';

// Styled component for the triangle shaped background image
const TriangleImg = styled('img')(({ theme }) => ({
  right: 0,
  bottom: 0,
  width: '10.375rem',
  position: 'absolute',
  ...(theme.direction === 'rtl' ? { transform: 'scaleX(-1)' } : {}),
}));

// Styled component for the trophy image
const TrophyImg = styled('img')({
  right: 35,
  bottom: 20,
  width: '5.188rem',
  position: 'absolute',
});

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  trophyOverview: string;
  goodScore: string;
};

const CardAward = ({ open, handleClose, trophyOverview, goodScore }: PropsTypes) => {
  // ** Hook
  const { settings } = useSettings();
  const { user } = useAuth();
  const fullName = user?.account?.firstName + ' ' + user?.account?.lastName;
  // ** Var
  const imageSrc = settings.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png';

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      maxWidth='sm'
      fullWidth
      keepMounted
      onClose={handleClose}
      aria-describedby='alert-dialog-slide-description'
    >
      <Card
        sx={{
          position: 'relative',
        }}
      >
        <CardContent>
          <Typography variant='h6'>{`ขอแสดงความยินดีกับ ${fullName} ได้รับเกียรติบัตรความประพฤติดี! 🥳`}</Typography>
          <Typography variant='body2'>{`นี่เป็นความสำเร็จที่มีค่าและเป็นเครื่องหมายของความพยายามและความมุ่งมั่นของนักเรียน ในปีการศึกษา ${process.env.NEXT_PUBLIC_EDUCATION_YEARS}`}</Typography>
          <Typography variant='h5' sx={{ mt: 3.5, color: 'primary.main' }}>
            {goodScore} คะแนน
          </Typography>
          <Typography variant='body2' sx={{ mb: 4.25 }}>
            {`คะแนนความประพฤติดี`}
          </Typography>
          <Button
            color='success'
            size='medium'
            variant='contained'
            startIcon={<Icon icon={'line-md:cloud-download-outline-loop'} />}
          >
            ดาวน์โหลดเกียรติบัตร
          </Button>
          <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
          <TrophyImg alt='trophy' src='/images/misc/trophy.png' />
        </CardContent>
      </Card>
    </Dialog>
  );
};

export default CardAward;
