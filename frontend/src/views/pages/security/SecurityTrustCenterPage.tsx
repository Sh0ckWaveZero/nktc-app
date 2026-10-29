'use client';

// ** React Imports
import React, { useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// ** MUI Icons & MDI Imports
import ShieldCheckOutline from 'mdi-material-ui/ShieldCheckOutline';
import LockOutline from 'mdi-material-ui/LockOutline';
import ServerSecurity from 'mdi-material-ui/ServerSecurity';
import AccountKeyOutline from 'mdi-material-ui/AccountKeyOutline';
import BugOutline from 'mdi-material-ui/BugOutline';
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline';
import History from 'mdi-material-ui/History';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import ContentCopy from 'mdi-material-ui/ContentCopy';

import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PolicyIcon from '@mui/icons-material/Policy';
import PublicIcon from '@mui/icons-material/Public';
import HttpsIcon from '@mui/icons-material/Https';
import StorageIcon from '@mui/icons-material/Storage';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';

// ** Hook Imports
import { useSystemSettings } from '@/hooks/queries';

/* 
 * 60-30-10 Color Design System:
 * - 60% Dominant Base: Slate Canvas (#f8fafc light / #0b0f19 dark)
 * - 30% Secondary Structure: Deep Surface Cards & Typography (#1e293b surface, #ffffff card, #475569 muted text)
 * - 10% Vibrant Accent: Emerald Security Green (#10b981 / #059669) & Trust Blue (#2563eb) for CTAs & Active Badges
 */
const COLOR_SYSTEM = {
  dominant60: {
    light: '#f8fafc',
    dark: '#0b0f19',
  },
  secondary30: {
    surfaceLight: '#ffffff',
    surfaceDark: '#1e293b',
    borderLight: '#e2e8f0',
    borderDark: '#334155',
    textMainLight: '#0f172a',
    textMutedLight: '#64748b',
  },
  accent10: {
    emerald: '#10b981',
    emeraldDark: '#059669',
    trustBlue: '#2563eb',
    trustBlueHover: '#1d4ed8',
  },
};

const SecurityTrustCenterPage = () => {
  // ** Hooks
  const { settings } = useSystemSettings();

  // ** States
  const [tabValue, setTabValue] = useState<string>('certifications');
  const [openAuditModal, setOpenAuditModal] = useState<boolean>(false);
  const [auditFormData, setAuditFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    purpose: '',
    agreeNda: false,
  });
  const [submittedAudit, setSubmittedAudit] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleOpenAuditModal = () => {
    setSubmittedAudit(false);
    setOpenAuditModal(true);
  };

  const handleCloseAuditModal = () => {
    setOpenAuditModal(false);
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditFormData.fullName || !auditFormData.email || !auditFormData.agreeNda) return;
    setSubmittedAudit(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(settings.securityEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? COLOR_SYSTEM.dominant60.dark : COLOR_SYSTEM.dominant60.light,
        minHeight: '100vh',
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 2,
      }}
    >
      {/* Header Banner Card (30% Secondary Structure Surface) */}
      <Card
        sx={{
          mb: 5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5, flexWrap: 'wrap' }}>
                {/* 10% Accent Highlight Badges */}
                <Chip
                  icon={<ShieldCheckOutline style={{ fontSize: 18, color: COLOR_SYSTEM.accent10.emerald }} />}
                  label={`${settings.collegeAcronym} Security & Compliance Trust Center`}
                  variant='outlined'
                  size='small'
                  sx={{
                    fontWeight: 700,
                    color: COLOR_SYSTEM.accent10.emeraldDark,
                    borderColor: COLOR_SYSTEM.accent10.emerald,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  }}
                />
                <Chip
                  label={`ระบบทำงานปกติ ${settings.systemUptime} Uptime`}
                  color='info'
                  size='small'
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant='h4' sx={{ fontWeight: 800, mb: 2, color: 'text.primary', letterSpacing: '-0.02em' }}>
                ศูนย์ความมั่นคงปลอดภัยและความไว้วางใจ (Trust Center)
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mb: 3.5, maxWidth: 720, lineHeight: 1.6 }}>
                รวบรวมข้อมูลมาตรการความปลอดภัย การปฏิบัติตามมาตรฐานสากลและกฎหมาย PDPA การเข้ารหัสข้อมูล
                มาตรการควบคุมการเข้าถึง ประวัติความปลอดภัย และรายงานผลการทดสอบเจาะระบบของ {settings.collegeAcronym} ({settings.collegeName})
              </Typography>

              {/* 10% Action CTAs */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant='contained'
                  startIcon={<FileDocumentOutline />}
                  onClick={handleOpenAuditModal}
                  sx={{
                    bgcolor: COLOR_SYSTEM.accent10.emerald,
                    '&:hover': { bgcolor: COLOR_SYSTEM.accent10.emeraldDark },
                    px: 3,
                    py: 1.2,
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.35)',
                  }}
                >
                  ขอรับรายงาน Penetration Test
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<BugOutline />}
                  onClick={() => setTabValue('vulnerability')}
                  sx={{
                    borderColor: COLOR_SYSTEM.accent10.trustBlue,
                    color: COLOR_SYSTEM.accent10.trustBlue,
                    '&:hover': { borderColor: COLOR_SYSTEM.accent10.trustBlueHover, bgcolor: 'rgba(37, 99, 235, 0.04)' },
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  รายงานช่องโหว่ความปลอดภัย
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc'),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 2, fontWeight: 700 }}>
                  ภาพรวมมาตรฐานความปลอดภัย
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Data Encryption:
                    </Typography>
                    <Chip label='AES-256 / TLS 1.3' size='small' color='primary' variant='outlined' sx={{ fontWeight: 600 }} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Data Residency:
                    </Typography>
                    <Chip label={settings.primaryDataResidency} size='small' color='success' variant='outlined' sx={{ fontWeight: 600 }} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Access Control:
                    </Typography>
                    <Chip label='RBAC + CASL + MFA' size='small' color='warning' variant='outlined' sx={{ fontWeight: 600 }} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Latest Audit:
                    </Typography>
                    <Typography variant='caption' sx={{ fontWeight: 700, color: COLOR_SYSTEM.accent10.emeraldDark }}>
                      {settings.latestAuditMonth} (PASS)
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Tabs Card (30% Surface structure) */}
      <Card sx={{ boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#ffffff') }}>
            <TabList
              onChange={handleTabChange}
              variant='scrollable'
              scrollButtons='auto'
              aria-label='security trust center tabs'
              sx={{
                '& .MuiTabs-indicator': {
                  bgcolor: COLOR_SYSTEM.accent10.emerald,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .Mui-selected': {
                  color: `${COLOR_SYSTEM.accent10.emerald} !important`,
                  fontWeight: 700,
                },
              }}
            >
              <Tab
                label='ใบรับรองและมาตรฐาน'
                value='certifications'
                icon={<ShieldCheckOutline />}
                iconPosition='start'
              />
              <Tab
                label='การเข้ารหัสและสถานที่เก็บข้อมูล'
                value='encryption'
                icon={<LockOutline />}
                iconPosition='start'
              />
              <Tab
                label='สิทธิ์และการควบคุมเข้าถึง'
                value='access-control'
                icon={<AccountKeyOutline />}
                iconPosition='start'
              />
              <Tab
                label='การรายงานช่องโหว่และประวัติ'
                value='vulnerability'
                icon={<BugOutline />}
                iconPosition='start'
              />
              <Tab
                label='การทดสอบเจาะระบบ (PenTest)'
                value='pentest'
                icon={<ServerSecurity />}
                iconPosition='start'
              />
            </TabList>
          </Box>

          {/* TAB 1: Certifications and Compliance */}
          <TabPanel value='certifications' sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Certifications & Compliance (การรับรองและการปฏิบัติตามมาตรฐาน)
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ระบบ {settings.collegeAcronym} ได้รับการออกแบบและบริหารจัดการให้สอดคล้องกับมาตรฐานความปลอดภัยระดับสากลและข้อกำหนดตามกฎหมาย
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* SOC 2 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 3.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    borderRadius: 2.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                    borderColor: (t) => t.palette.divider,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
                      borderColor: COLOR_SYSTEM.accent10.emerald,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                      <Avatar sx={{ bgcolor: COLOR_SYSTEM.accent10.trustBlue, color: '#ffffff', width: 52, height: 52 }}>
                        <WorkspacePremiumIcon style={{ fontSize: 30, color: '#ffffff' }} />
                      </Avatar>
                      <Chip label='Verified Active' color='success' size='small' sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                      SOC 2 Type II Certified
                    </Typography>
                    <Typography variant='caption' sx={{ color: COLOR_SYSTEM.accent10.trustBlue, fontWeight: 700, display: 'block', mb: 1.5 }}>
                      Security, Availability, & Confidentiality Trust Services Criteria
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      ผ่านการตรวจสอบอิสระโดยผู้สอบบัญชีภายนอก เพื่อยืนยันว่าการควบคุมความปลอดภัย
                      ความพร้อมใช้งาน และการเก็บรักษาความลับของข้อมูลนักเรียนและบุคลากรมีประสิทธิภาพสูงและปฏิบัติอย่างต่อเนื่อง
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3, pt: 2, borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
                    <Typography variant='caption' color='text.secondary'>
                      ขอบเขตการครอบคลุม: ระบบโครงสร้างพื้นฐาน ฐานข้อมูล และการบริการแอปพลิเคชัน {settings.collegeAcronym} ทั้งหมด
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* ISO 27001 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 3.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    borderRadius: 2.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                    borderColor: (t) => t.palette.divider,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
                      borderColor: COLOR_SYSTEM.accent10.emerald,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                      <Avatar sx={{ bgcolor: COLOR_SYSTEM.accent10.emerald, color: '#ffffff', width: 52, height: 52 }}>
                        <VerifiedUserIcon style={{ fontSize: 30, color: '#ffffff' }} />
                      </Avatar>
                      <Chip label='Verified Active' color='success' size='small' sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                      ISO/IEC 27001:2022
                    </Typography>
                    <Typography variant='caption' sx={{ color: COLOR_SYSTEM.accent10.emeraldDark, fontWeight: 700, display: 'block', mb: 1.5 }}>
                      Information Security Management System (ISMS)
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      มาตรฐานสากลสำหรับการบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ
                      ช่วยให้มั่นใจได้ว่าระบบมีการประเมินและบริหารจัดการความเสี่ยงด้านความมั่นคงปลอดภัยไซเบอร์อย่างรอบด้าน
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3, pt: 2, borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
                    <Typography variant='caption' color='text.secondary'>
                      ขอบเขตการครอบคลุม: กระบวนการพัฒนาซอฟต์แวร์ การดูแลเซิร์ฟเวอร์ และการปฏิบัติตามนโยบายความปลอดภัย
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* PDPA */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 3.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    borderRadius: 2.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                    borderColor: (t) => t.palette.divider,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.15)',
                      borderColor: '#f59e0b',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                      <Avatar sx={{ bgcolor: '#f59e0b', color: '#ffffff', width: 52, height: 52 }}>
                        <PolicyIcon style={{ fontSize: 30, color: '#ffffff' }} />
                      </Avatar>
                      <Chip label='Compliant' color='success' size='small' sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                      PDPA Compliance (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#d97706', fontWeight: 700, display: 'block', mb: 1.5 }}>
                      Thailand Personal Data Protection Act
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      ปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย มีการจัดทำ Data Protection Impact Assessment (DPIA),
                      รองรับสิทธิ์ของเจ้าของข้อมูล (Data Subject Rights) และมีเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) กำกับดูแล
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3, pt: 2, borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
                    <Typography variant='caption' color='text.secondary'>
                      ขอบเขตการครอบคลุม: ข้อมูลส่วนตัว ข้อมูลการเข้าเรียน คะแนนความประพฤติ และข้อมูลเยี่ยมบ้าน
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* GDPR */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 3.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    borderRadius: 2.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                    borderColor: (t) => t.palette.divider,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.15)',
                      borderColor: '#8b5cf6',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                      <Avatar sx={{ bgcolor: '#8b5cf6', color: '#ffffff', width: 52, height: 52 }}>
                        <PublicIcon style={{ fontSize: 30, color: '#ffffff' }} />
                      </Avatar>
                      <Chip label='Aligned Standard' color='secondary' size='small' sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                      GDPR Alignment
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#7c3aed', fontWeight: 700, display: 'block', mb: 1.5 }}>
                      EU General Data Protection Regulation Principles
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      นโยบายการจัดเก็บและประมวลผลข้อมูลของ {settings.collegeAcronym} ยึดถือหลักการความเป็นส่วนตัวตั้งแต่การออกแบบ (Privacy by Design)
                      และการตั้งค่าเริ่มต้น (Privacy by Default) สอดคล้องตามมาตรฐาน GDPR สากล
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3, pt: 2, borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
                    <Typography variant='caption' color='text.secondary'>
                      ขอบเขตการครอบคลุม: สิทธิ์การลบข้อมูล (Right to be Forgotten) และการส่งออกข้อมูล (Data Portability)
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 2: Data Encryption & Residency */}
          <TabPanel value='encryption' sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Data Encryption & Residency (การเข้ารหัสและสถานที่เก็บข้อมูล)
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                คำอธิบายมาตรการเข้ารหัสข้อมูลทั้งในขณะรับส่ง (In Transit) และขณะจัดเก็บ (At Rest) พร้อมตำแหน่งศูนย์ข้อมูล
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Encryption in Transit */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ p: 3.5, height: '100%', borderRadius: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                    <Avatar sx={{ bgcolor: COLOR_SYSTEM.accent10.emerald, color: '#ffffff', width: 44, height: 44 }}>
                      <HttpsIcon style={{ fontSize: 24, color: '#ffffff' }} />
                    </Avatar>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      1. การเข้ารหัสข้อมูลขณะส่ง (Data in Transit)
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    ทุกการเชื่อมต่อและการรับส่งข้อมูลระหว่างเบราว์เซอร์ แอปรับบนอุปกรณ์เคลื่อนที่ และเซิร์ฟเวอร์ API ถูกเข้ารหัสอย่างแน่นหนาผ่านโปรโตคอล TLS 1.3
                  </Typography>

                  <Box component='ul' sx={{ pl: 2.5, m: 0, '& li': { mb: 1.2, fontSize: '0.875rem', lineHeight: 1.5 } }}>
                    <li>
                      <strong>TLS 1.3 / HTTPS Encryption:</strong> บังคับใช้การรับส่งข้อมูลผ่านช่องทางปลอดภัยด้วยกุญแจเข้ารหัสความยาวสูง
                    </li>
                    <li>
                      <strong>HSTS Enforcement:</strong> กำหนด HTTP Strict Transport Security เพื่อป้องกันการโจมตีแบบ Protocol Downgrade
                    </li>
                    <li>
                      <strong>Perfect Forward Secrecy (PFS):</strong> ใช้กุญแจเข้ารหัสใหม่ในทุกๆ Session เพื่อความปลอดภัยสูงสุดแม้กุญแจหลักถูกเปิดเผย
                    </li>
                    <li>
                      <strong>Strong Cipher Suites:</strong> ใช้เฉพาะกุญแจเข้ารหัสสากลที่ทันสมัย เช่น AES-256-GCM และ ECDHE
                    </li>
                  </Box>
                </Card>
              </Grid>

              {/* Encryption at Rest */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ p: 3.5, height: '100%', borderRadius: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                    <Avatar sx={{ bgcolor: COLOR_SYSTEM.accent10.trustBlue, color: '#ffffff', width: 44, height: 44 }}>
                      <StorageIcon style={{ fontSize: 24, color: '#ffffff' }} />
                    </Avatar>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      2. การเข้ารหัสข้อมูลขณะจัดเก็บ (Data at Rest)
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    ข้อมูลทั้งหมดที่จัดเก็บในฐานข้อมูล ไฟล์แนบ และข้อมูลสำรอง (Backup) จะถูกเข้ารหัสด้วยมาตรฐาน AES-256 bit
                  </Typography>

                  <Box component='ul' sx={{ pl: 2.5, m: 0, '& li': { mb: 1.2, fontSize: '0.875rem', lineHeight: 1.5 } }}>
                    <li>
                      <strong>AES-256 Database Encryption:</strong> เข้ารหัสไฟล์ดิสก์ฐานข้อมูลและไฟล์แนบเอกสารทั้งหมดระดับ Storage
                    </li>
                    <li>
                      <strong>Column-Level Sensitive Field Encryption:</strong> ข้อมูลอ่อนไหวสูง เช่น เลขประจำตัวประชาชน จะถูกเข้ารหัสเฉพาะฟิลด์
                    </li>
                    <li>
                      <strong>Argon2id Password Hashing:</strong> รหัสผ่านผู้ใช้ไม่เคยถูกจัดเก็บเป็นข้อความธรรมดา แต่จะผ่าน Salted Hash ชั้นสูง
                    </li>
                    <li>
                      <strong>Automated Key Rotation:</strong> กุญแจเข้ารหัสระดับระบบจะถูกหมุนเวียน (Key Rotation) โดยอัตโนมัติตามวงรอบ
                    </li>
                  </Box>
                </Card>
              </Grid>

              {/* Data Residency */}
              <Grid size={12}>
                <Paper variant='outlined' sx={{ p: 4, borderRadius: 2.5, bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc') }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: COLOR_SYSTEM.accent10.trustBlue, color: '#fff', width: 44, height: 44 }}>
                      <LocationOnIcon style={{ fontSize: 24, color: '#ffffff' }} />
                    </Avatar>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      สถานที่จัดเก็บข้อมูลและการประมวลผล (Data Residency)
                    </Typography>
                  </Box>

                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: COLOR_SYSTEM.accent10.trustBlue }}>
                          🏛️ ศูนย์ข้อมูลหลัก (Primary Data Center & Server)
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600 }}>
                          {settings.primaryServerDetail}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1, lineHeight: 1.4 }}>
                          ประมวลผล จัดเก็บ และดูแลความปลอดภัยของข้อมูลนักเรียนและบุคลากรภายใน{settings.collegeName}ตาม PDPA
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant='subtitle2' color='info.main' sx={{ fontWeight: 700 }}>
                          🌏 ศูนย์ข้อมูลสำรอง (Disaster Recovery Center)
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600 }}>
                          ภูมิภาคเอเชียตะวันออกเฉียงใต้ (Southeast Asia Cloud Region)
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1, lineHeight: 1.4 }}>
                          รองรับการกู้คืนระบบจากภัยพิบัติ (Disaster Recovery) แบบสำรองข้อมูลข้ามเซิร์ฟเวอร์
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: COLOR_SYSTEM.accent10.emeraldDark }}>
                          🔄 ระบบสำรองข้อมูล (Backup & Point-In-Time)
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600 }}>
                          Automated Snapshots ทุก 15 นาที
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1, lineHeight: 1.4 }}>
                          RPO &lt; 15 นาที, RTO &lt; 1 ชั่วโมง ข้อมูลถูกเข้ารหัสและทดสอบการกู้คืนรายเดือน
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 3: Access Controls */}
          <TabPanel value='access-control' sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Access Controls & Governance (สิทธิ์และการควบคุมการเข้าถึง)
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                มาตรการระบุตัวตน การควบคุมสิทธิ์การเข้าถึงข้อมูลเฉพาะผู้มีอำนาจ และระบบบันทึกประวัติการใช้งาน
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Accordion defaultExpanded variant='outlined' sx={{ borderRadius: 2 }}>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AdminPanelSettingsIcon style={{ fontSize: 24, color: COLOR_SYSTEM.accent10.emerald }} />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        Role-Based Access Control (RBAC) & CASL
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2, lineHeight: 1.6 }}>
                      ระบบใช้การตรวจสอบสิทธิ์แบบสิทธิขั้นต่ำที่จำเป็น (Least Privilege) กำหนดระดับการเข้าถึงตามบทบาท (Admin, Teacher, Student, Parent) ผ่าน CASL Engine
                    </Typography>
                    <Chip label='Admin: จัดการข้อมูลเฉพาะส่วนที่รับผิดชอบ' size='small' sx={{ mr: 1, mb: 1, fontWeight: 600 }} />
                    <Chip label='Teacher: ดูและบันทึกเฉพาะห้องเรียนที่สอน' size='small' sx={{ mr: 1, mb: 1, fontWeight: 600 }} />
                    <Chip label='Student: ดูได้เฉพาะข้อมูลและผลการเรียนของตนเอง' size='small' sx={{ mr: 1, mb: 1, fontWeight: 600 }} />
                  </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded variant='outlined' sx={{ mt: 2, borderRadius: 2 }}>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <FingerprintIcon style={{ fontSize: 24, color: COLOR_SYSTEM.accent10.trustBlue }} />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        Multi-Factor Authentication (MFA) & WebAuthn
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      ผู้ดูแลระบบและบุคลากรต้องยืนยันตัวตนสองปัจจัย (2FA) ด้วย TOTP Authenticator หรือ Passkeys (WebAuthn / FIDO2) เพื่อป้องกันการคาดเดาหรือขโมยรหัสผ่าน
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Accordion defaultExpanded variant='outlined' sx={{ borderRadius: 2 }}>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AssessmentIcon style={{ fontSize: 24, color: '#f59e0b' }} />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        Immutable Audit Logging (ระบบบันทึกประวัติ)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5, lineHeight: 1.6 }}>
                      การแก้ไข ลบ หรือดูข้อมูลสำคัญ จะถูกบันทึกลงใน Audit Log ที่ไม่สามารถแก้ไขหรือลบประวัติได้ (Write-Once Audit Trail)
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
                      ฟิลด์ที่บันทึก: ผู้ใช้งาน (User ID), เวลา (Timestamp UTC), เลขไอพี (IP Address), กิจกรรม (Action Name), ค่าก่อนและหลังเปลี่ยน
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded variant='outlined' sx={{ mt: 2, borderRadius: 2 }}>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <VpnKeyIcon style={{ fontSize: 24, color: '#8b5cf6' }} />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        Internal Access Controls & Approval
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                      พนักงานและทีมพัฒนาไม่มีสิทธิ์เข้าถึงข้อมูลนักเรียนใน Production โดยตรง หากจำเป็นต้องแก้ไขปัญหา ต้องได้รับการอนุมัติแบบชั่วคราว (JIT Access Request) พร้อมเหตุผลประกอบทุกครั้ง
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 4: Vulnerability Disclosure & Incidents */}
          <TabPanel value='vulnerability' sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Vulnerability Disclosure & Incident History (การรายงานช่องโหว่และประวัติ)
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ช่องทางการแจ้งเตือนความผิดปกติ ช่องโหว่ความปลอดภัย และรายงานความโปร่งใสของเหตุการณ์ในอดีต
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Disclosure Policy */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper variant='outlined' sx={{ p: 3.5, height: '100%', borderRadius: 2.5, bgcolor: 'background.paper' }}>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugOutline color='error' /> นโยบายการรายงานช่องโหว่ (Responsible Disclosure)
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    {settings.collegeAcronym} สนับสนุนให้นักวิจัยความปลอดภัยร่วมกันรายงานช่องโหว่และจุดอ่อนของระบบอย่างรับผิดชอบ
                  </Typography>

                  <Box sx={{ p: 2.5, bgcolor: (t) => (t.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9'), borderRadius: 2, mb: 2.5 }}>
                    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block' }}>
                      อีเมลแจ้งเตือนความปลอดภัย:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 800, fontFamily: 'monospace', color: COLOR_SYSTEM.accent10.trustBlue }}>
                        {settings.securityEmail}
                      </Typography>
                      <Button size='small' startIcon={<ContentCopy />} onClick={handleCopyEmail} sx={{ fontWeight: 600 }}>
                        {copiedEmail ? 'คัดลอกแล้ว' : 'คัดลอก'}
                      </Button>
                    </Box>
                  </Box>

                  <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
                    กรอบเวลาการตอบสนอง (SLA Guarantee):
                  </Typography>
                  <Box component='ul' sx={{ pl: 2.5, m: 0, '& li': { mb: 1, fontSize: '0.875rem' } }}>
                    <li>
                      <strong>ตอบรับคำร้อง (Acknowledgement):</strong> ภายใน 24 ชั่วโมง
                    </li>
                    <li>
                      <strong>ประเมินความเสี่ยง (Triage):</strong> ภายใน 72 ชั่วโมง
                    </li>
                    <li>
                      <strong>อัปเดตความคืบหน้าการแก้ไข:</strong> ทุกๆ 5 วันทำการ
                    </li>
                  </Box>
                </Paper>
              </Grid>

              {/* Past Incident History */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper variant='outlined' sx={{ p: 3.5, height: '100%', borderRadius: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <Typography variant='h6' sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <History color='primary' /> ประวัติเหตุการณ์ความปลอดภัย (Disclosed Incident History)
                    </Typography>
                    <Chip label='ไม่มีเหตุการณ์รุนแรงใน 90 วัน' color='success' size='small' sx={{ fontWeight: 700 }} />
                  </Box>

                  <TableContainer>
                    <Table size='small' aria-label='incident history table'>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>วันที่</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>ประเภทเหตุการณ์</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>ระดับ</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>การแก้ไขและสถานะ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell variant='head' sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            15 มี.ค. 2026
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            API Rate Limit Surge (การเรียกใช้งาน API สูงผิดปกติ)
                          </TableCell>
                          <TableCell>
                            <Chip label='Low' size='small' color='default' variant='outlined' />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip label='Resolved' size='small' color='success' sx={{ mr: 1, fontWeight: 700 }} />
                            ปรับปรุง Rate Limiting & Scaled Instances (ไม่มีข้อมูลรั่วไหล)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell variant='head' sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            10 ม.ค. 2026
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            Scheduled Security Maintenance (อัปเดตระบบตามวงรอบ)
                          </TableCell>
                          <TableCell>
                            <Chip label='Info' size='small' color='info' variant='outlined' />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Chip label='Completed' size='small' color='success' sx={{ mr: 1, fontWeight: 700 }} />
                            อัปเดต Security Patches บน Linux Kernel & Node Dependencies
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Alert severity='info' sx={{ mt: 3, borderRadius: 2 }}>
                    {settings.collegeAcronym} ยึดถือความโปร่งใสเป็นหลัก เหตุการณ์ที่มีผลกระทบต่อความเสถียรหรือความปลอดภัยจะถูกเปิดเผยให้ผู้รับบริการทราบอย่างตรงไปตรงมา
                  </Alert>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 5: Penetration Testing */}
          <TabPanel value='pentest' sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Penetration Testing & Third-Party Audits (การทดสอบเจาะระบบ)
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ข้อมูลผลการตรวจสอบประเมินความปลอดภัยโดยหน่วยงานภายนอกที่เป็นอิสระ (Independent Cybersecurity Audit)
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper variant='outlined' sx={{ p: 4, height: '100%', borderRadius: 2.5, bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: COLOR_SYSTEM.accent10.emerald, color: '#ffffff', width: 56, height: 56 }}>
                      <SecurityIcon style={{ fontSize: 32, color: '#ffffff' }} />
                    </Avatar>
                    <Box>
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>
                        ผลการทดสอบ Penetration Test ล่าสุด
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        ตรวจสอบเมื่อ: {settings.latestAuditCycle}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc') }}>
                        <Typography variant='h4' color='error.main' sx={{ fontWeight: 800 }}>
                          0
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                          Critical
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc') }}>
                        <Typography variant='h4' color='warning.main' sx={{ fontWeight: 800 }}>
                          0
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                          High
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc') }}>
                        <Typography variant='h4' color='info.main' sx={{ fontWeight: 800 }}>
                          0
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                          Medium
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderColor: COLOR_SYSTEM.accent10.emerald }}>
                        <Typography variant='h4' sx={{ fontWeight: 800, color: COLOR_SYSTEM.accent10.emeraldDark }}>
                          PASS
                        </Typography>
                        <Typography variant='caption' sx={{ fontWeight: 700, color: COLOR_SYSTEM.accent10.emeraldDark }}>
                          Overall Status
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
                    รายละเอียดขอบเขตการทดสอบ (Scope of Audit):
                  </Typography>
                  <Typography variant='body2' color='text.secondary' gutterBottom sx={{ lineHeight: 1.6 }}>
                    ครอบคลุมการทดสอบเจาะระบบทั้งแบบ Black-box และ Gray-box บน Frontend Web Application (Next.js), REST APIs (ElysiaJS),
                    การตั้งค่า Cloud Infrastructure และสิทธิ์การเข้าถึงฐานข้อมูลตามแนวทาง OWASP Top 10
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Card
                  variant='outlined'
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc'),
                  }}
                >
                  <Avatar sx={{ width: 64, height: 64, bgcolor: COLOR_SYSTEM.accent10.trustBlue, mb: 2 }}>
                    <FileDocumentOutline style={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                    ขอรับรายงาน Penetration Test
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 3, maxWidth: 360, lineHeight: 1.6 }}>
                    หากท่านเป็นหน่วยงาน สถาบันการศึกษา หรือองค์กรพันธมิตร สามารถยื่นคำขอรับรายงานสรุปสำหรับผู้บริหาร (Executive Summary Report) ได้
                  </Typography>
                  <Button
                    variant='contained'
                    size='large'
                    startIcon={<FileDocumentOutline />}
                    onClick={handleOpenAuditModal}
                    sx={{
                      bgcolor: COLOR_SYSTEM.accent10.trustBlue,
                      '&:hover': { bgcolor: COLOR_SYSTEM.accent10.trustBlueHover },
                      px: 3.5,
                      py: 1.2,
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    ส่งคำขอรับรายงาน (Request Report)
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </Card>

      {/* REQUEST PENETRATION TEST REPORT MODAL DIALOG */}
      <Dialog open={openAuditModal} onClose={handleCloseAuditModal} maxWidth='sm' fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          แบบฟอร์มขอรับรายงาน Penetration Test & Security Audit Report
        </DialogTitle>
        <form onSubmit={handleAuditSubmit}>
          <DialogContent dividers>
            {submittedAudit ? (
              <Alert severity='success' sx={{ my: 2, borderRadius: 2 }}>
                <strong>ส่งคำขอเรียบร้อยแล้ว!</strong> ทีมงานฝ่ายรักษาความปลอดภัย {settings.collegeAcronym}
                จะตรวจสอบข้อมูลและจัดส่งรายงานสรุปแบบ NDA ทางอีเมลที่ท่านระบุภายใน 1-2 วันทำการ
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant='body2' color='text.secondary'>
                  กรุณากรอกข้อมูลเพื่อขอดาวน์โหลดรายงานผลการประเมินความปลอดภัยล่าสุด (จำเป็นต้องยอมรับข้อตกลงรักษาความลับ NDA)
                </Typography>

                <TextField
                  label='ชื่อ - นามสกุล'
                  required
                  fullWidth
                  value={auditFormData.fullName}
                  onChange={(e) => setAuditFormData({ ...auditFormData, fullName: e.target.value })}
                />

                <TextField
                  label='องค์กร / สถาบัน / หน่วยงาน'
                  fullWidth
                  value={auditFormData.organization}
                  onChange={(e) => setAuditFormData({ ...auditFormData, organization: e.target.value })}
                />

                <TextField
                  label='อีเมลติดต่อ (แนะนำให้อีเมลองค์กร)'
                  type='email'
                  required
                  fullWidth
                  value={auditFormData.email}
                  onChange={(e) => setAuditFormData({ ...auditFormData, email: e.target.value })}
                />

                <TextField
                  label='วัตถุประสงค์ในการขอรายงาน'
                  multiline
                  rows={2}
                  fullWidth
                  value={auditFormData.purpose}
                  onChange={(e) => setAuditFormData({ ...auditFormData, purpose: e.target.value })}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={auditFormData.agreeNda}
                      onChange={(e) => setAuditFormData({ ...auditFormData, agreeNda: e.target.checked })}
                      required
                    />
                  }
                  label={
                    <Typography variant='caption' color='text.secondary'>
                      ข้าพเจ้ายินยอมปฏิบัติตามข้อตกลงไม่เปิดเผยข้อมูล (Non-Disclosure Agreement) และจะใช้รายงานเพื่อการประเมินภายในเท่านั้น
                    </Typography>
                  }
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseAuditModal} color='secondary'>
              {submittedAudit ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
            </Button>
            {!submittedAudit && (
              <Button type='submit' variant='contained' disabled={!auditFormData.agreeNda || !auditFormData.email} sx={{ bgcolor: COLOR_SYSTEM.accent10.emerald, '&:hover': { bgcolor: COLOR_SYSTEM.accent10.emeraldDark } }}>
                ยืนยันการส่งคำขอ
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SecurityTrustCenterPage;
