import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import VerifiedTwoToneIcon from '@mui/icons-material/VerifiedTwoTone';

const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  '& .ant-empty-img-1': {
    fill: '#aeb8c2',
    ...theme.applyStyles('dark', {
      fill: '#262626',
    }),
  },
  '& .ant-empty-img-2': {
    fill: '#f5f5f7',
    ...theme.applyStyles('dark', {
      fill: '#595959',
    }),
  },
  '& .ant-empty-img-3': {
    fill: '#dce0e6',
    ...theme.applyStyles('dark', {
      fill: '#434343',
    }),
  },
  '& .ant-empty-img-4': {
    fill: '#fff',
    ...theme.applyStyles('dark', {
      fill: '#1c1c1c',
    }),
  },
  '& .ant-empty-img-5': {
    fillOpacity: '0.8',
    fill: '#f5f5f5',
    ...theme.applyStyles('dark', {
      fillOpacity: '0.08',
      fill: '#fff',
    }),
  },
}));

const CustomNoRowsOverlayCheckedIn = () => {
  return (
    <StyledGridOverlay>
      <VerifiedTwoToneIcon sx={{ fontSize: 60, color: 'success.main' }} />
      <Box sx={{ mt: 1, pb: 1 }}>เช็คชื่อหน้าเสาธงเรียบร้อยแล้ว</Box>
    </StyledGridOverlay>
  );
};

const CustomNoRowsOverlayActivityCheckedIn = () => {
  return (
    <StyledGridOverlay>
      <VerifiedTwoToneIcon sx={{ fontSize: 60, color: 'success.main' }} />
      <Box sx={{ mt: 1, pb: 1 }}>เช็คชื่อเข้าร่วมกิจกรรมเรียบร้อยแล้ว</Box>
    </StyledGridOverlay>
  );
};

export { CustomNoRowsOverlayCheckedIn, CustomNoRowsOverlayActivityCheckedIn };
