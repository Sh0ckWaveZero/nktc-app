// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Hook
import { useSettings } from '@/@core/hooks/useSettings'
import { useAuth } from "../../../../hooks/useAuth";

// Styled component for the triangle shaped background image
const TriangleImg = styled('img')(({ theme }) => ({
  right: 0,
  bottom: 0,
  width: '10.375rem',
  position: 'absolute',
  ...(theme.direction === 'rtl' ? { transform: 'scaleX(-1)' } : {})
}))

// Styled component for the trophy image
const TrophyImg = styled('img')({
  right: 35,
  bottom: 20,
  width: '5.188rem',
  position: 'absolute'
})

const CardAward = () => {
  // ** Hook
  const { settings } = useSettings();
  const { user } = useAuth();
  const fullName = user?.account?.firstName + ' ' + user?.account?.lastName;
  // ** Var
  const imageSrc = settings.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png'

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h6'>{`ขอแสดงความยินดีกลับ ${fullName}! 🥳`}</Typography>
        <Typography variant='body2'>ทำความดีในปีการศึกษานี้</Typography>
        <Typography variant='h5' sx={{ mt: 3.5, color: 'primary.main' }}>
          200 คะแนน
        </Typography>
        <Typography variant='body2' sx={{ mb: 4.25 }}>
          เมือหักลบแล้ว 🚀
        </Typography>
        <Button color='success' size='small' variant='contained'>
          ดูเกียรติบัตร
        </Button>
        <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
        <TrophyImg alt='trophy' src='/images/misc/trophy.png' />
      </CardContent>
    </Card>
  )
}

export default CardAward