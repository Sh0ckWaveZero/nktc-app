import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Fragment, useState } from 'react';

import Button from '@mui/material/Button';
// ** MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CloseIcon from '@mui/icons-material/Close';
import Icon from '@/@core/components/icon';
import IconButton from '@mui/material/IconButton';
import { LocalStorageService } from '@/services/localStorageService';
import Typography from '@mui/material/Typography';
import generateCertificatePdf from '@/utils/generateCertificatePdf';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../../hooks/useAuth';
import useGetPDF from '@/hooks/useGetPDF';
// ** Hook
import { useSettings } from '@/@core/hooks/useSettings';

const localStorage = new LocalStorageService();
const accessToken = localStorage.getToken() || '';
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

type PropsTypes = {
  fullName: string;
  trophyOverview: any;
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const CardAward = ({ trophyOverview, fullName }: PropsTypes) => {
  // ** Hook
  const { settings } = useSettings();
  const { user }: any = useAuth();
  const [open, setOpen] = useState(false);
  const [pdfData, setPdfData] = useState<any | null>(null);
  const certsUrl = `${process.env.NEXT_PUBLIC_API_URL}/statics/goodness-individual/certs/${process.env.NEXT_PUBLIC_EDUCATION_YEARS}`;
  const { PDF, isLoading } = useGetPDF(certsUrl, accessToken);

  const handleClose = () => {
    setOpen(false);
  };
  // ** Var
  const imageSrc = settings.mode === 'light' ? 'triangle-light.png' : 'triangle-dark.png';

  const handleDownload = async () => {
    const modifiedPdf = await generateCertificatePdf(PDF, user);
    const pdfBlob = new Blob([modifiedPdf], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (window.innerWidth < 768) {
      downloadPdf(pdfUrl, user);
    } else {
      // Display PDF on desktop devices
      setOpen(true);
      setPdfData(pdfUrl);
    }
  };

  const downloadPdf = (pdfUrl: any, user: any) => {
    const fullName = `${user?.account?.firstName}_${user?.account?.lastName}`;
    const fileName = `เกียรติบัตรความประพฤติดี_${fullName}.pdf`;

    const linkElement = document.createElement('a');
    linkElement.href = pdfUrl;
    linkElement.download = fileName;

    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  return (
    <Fragment>
      <Card
        sx={{
          position: 'relative',
        }}
      >
        <CardContent>
          <Typography variant='h6'>{`ขอแสดงความยินดีกับ ${fullName} ได้รับเกียรติบัตรความประพฤติดี! 🥳`}</Typography>
          <Typography variant='body2'>{`นี่เป็นความสำเร็จที่มีค่าและเป็นเครื่องหมายของความพยายามและความมุ่งมั่นของนักเรียน ในปีการศึกษา ${process.env.NEXT_PUBLIC_EDUCATION_YEARS}`}</Typography>
          <Typography variant='h5' sx={{ mt: 3.5, color: 'primary.main' }}>
            {trophyOverview?.goodScore - trophyOverview.badScore} คะแนน
          </Typography>
          <Typography variant='body2' sx={{ mb: 4.25 }}>
            {`คะแนนความประพฤติดี`}
          </Typography>
          <Button
            color='success'
            size='medium'
            variant='contained'
            startIcon={<Icon icon={'line-md:cloud-download-outline-loop'} />}
            disabled={isLoading}
            onClick={handleDownload}
          >
            ดาวน์โหลดเกียรติบัตร
          </Button>
          <TriangleImg alt='triangle background' src={`/images/misc/${imageSrc}`} />
          <TrophyImg alt='trophy' src='/images/misc/trophy.png' />
        </CardContent>
      </Card>

      <BootstrapDialog
        fullWidth
        maxWidth={'xl'}
        sx={{ '& .MuiDialog-paper': { width: '100%', height: '100%' } }}
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={open}
      >
        <BootstrapDialogTitle id='customized-dialog-title' onClose={handleClose}>
          เกียรติบัตรความประพฤติดี
        </BootstrapDialogTitle>
        <DialogContent>
          {pdfData && (
            <embed
              src={pdfData}
              type='application/pdf'
              width='100%'
              height='100%'
              style={{
                borderRadius: '5px',
              }}
            />
          )}
        </DialogContent>
      </BootstrapDialog>
    </Fragment>
  );
};

export default CardAward;
