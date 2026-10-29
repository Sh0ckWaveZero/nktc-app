'use client';

import { useState, SyntheticEvent } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Icon from '@/@core/components/icon';
import { useUser, useUserSecurityStatus, useResetMfaForAdmin, useResetPasskeyForAdmin } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import UserViewLeft from './UserViewLeft';
import ConfirmResetDialog from './ConfirmResetDialog';
import useImageQuery from '@/hooks/useImageQuery';

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

interface UserViewPageProps {
  id: string;
}

const MuiTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`,
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('sm')]: {
      minWidth: 130,
    },
  },
}));

const UserViewPage = ({ id }: UserViewPageProps) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [resetTarget, setResetTarget] = useState<'mfa' | 'passkey' | null>(null);

  const theme = useTheme();
  const hideText = useMediaQuery(theme.breakpoints.down('sm'));

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const { data: userData, isLoading, error } = useUser(id);
  const { data: securityRes, isLoading: securityLoading } = useUserSecurityStatus(id);
  const resetMfaMutation = useResetMfaForAdmin();
  const resetPasskeyMutation = useResetPasskeyForAdmin();

  // Extract user data (safe to do before conditional returns)
  const user = userData?.data;
  const security = securityRes?.data;

  // Get user image - MUST be called before any conditional returns
  const { image, isLoading: imageLoading } = useImageQuery(user?.account?.avatar || '');

  const handleChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value);
  };

  const handleConfirmReset = async () => {
    if (!resetTarget) return;
    const isMfa = resetTarget === 'mfa';
    const mutation = isMfa ? resetMfaMutation : resetPasskeyMutation;
    const successMsg = isMfa ? 'รีเซ็ต MFA สำเร็จ ผู้ใช้จะต้องเข้าสู่ระบบใหม่' : 'รีเซ็ต Passkey สำเร็จ ผู้ใช้จะต้องเข้าสู่ระบบใหม่';

    try {
      await mutation.mutateAsync(id);
      toast.success(successMsg);
      setResetTarget(null);
    } catch (error: any) {
      toast.error(error?.message || 'เกิดข้อผิดพลาดในการรีเซ็ต');
    }
  };

  // Handle error state
  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='error'>
                ไม่พบข้อมูลผู้ใช้งาน
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                }}
              >
                ไม่สามารถค้นหาผู้ใช้งานด้วย ID/Username: {id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  if (isLoading || !userData) {
    return (
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant='h6'>กำลังโหลดข้อมูล...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // Format full name
  const fullName = user?.account
    ? `${user.account.title || ''} ${user.account.firstName || ''} ${user.account.lastName || ''}`.trim()
    : '';

  return (
    <Grid container spacing={6}>
      {/* Back button */}
      <Grid size={12}>
        <LinkStyled href='/apps/teacher/list/' passHref>
          <Button variant='contained' color='secondary' startIcon={<Icon icon='ion:arrow-back-circle-outline' />}>
            ย้อนกลับ
          </Button>
        </LinkStyled>
      </Grid>
      {/* Left sidebar with user info */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <UserViewLeft user={user} isLoading={imageLoading} image={image || undefined} fullName={fullName} />
      </Grid>
      {/* Right content area with tabs */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid size={12}>
              <MuiTabList
                variant='scrollable'
                scrollButtons='auto'
                onChange={handleChange}
                aria-label='user profile tabs'
              >
                <Tab
                  value='overview'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize={20} icon='mdi:account-outline' />
                      {!hideText && 'ภาพรวม'}
                    </Box>
                  }
                />
                <Tab
                  value='security'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize={20} icon='mdi:lock-outline' />
                      {!hideText && 'ความปลอดภัย'}
                    </Box>
                  }
                />
              </MuiTabList>
            </Grid>
            <Grid size={12}>
              <TabPanel sx={{ p: 0 }} value='overview'>
                <Card>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 3 }}>
                      ข้อมูลส่วนตัว
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ชื่อ-นามสกุล:
                        </Typography>
                        <Typography variant='body2'>{fullName || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          ชื่อผู้ใช้:
                        </Typography>
                        <Typography variant='body2'>{user?.username || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          บทบาท:
                        </Typography>
                        <Typography variant='body2'>{user?.role || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          สถานะ:
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'success.main' }}>
                          ใช้งานอยู่
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel sx={{ p: 0 }} value='security'>
                {/* MFA card */}
                <Card id={`user-security-mfa-card-${id}`} sx={{ mb: 6 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Icon icon='mdi:two-factor-authentication' fontSize={28} />
                        <Box>
                          <Typography variant='h6'>การยืนยันตัวตนสองขั้นตอน (MFA)</Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            เพิ่มความปลอดภัยด้วยรหัส TOTP
                          </Typography>
                        </Box>
                      </Box>
                      {securityLoading ? (
                        <Chip id={`user-security-mfa-status-${id}`} label='กำลังโหลด...' color='default' size='small' />
                      ) : (
                        <Chip
                          id={`user-security-mfa-status-${id}`}
                          label={security?.twoFactorEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          color={security?.twoFactorEnabled ? 'success' : 'default'}
                          size='small'
                        />
                      )}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {security?.twoFactorCount
                          ? `พบการตั้งค่า MFA ${security.twoFactorCount} รายการ`
                          : 'ยังไม่ได้ตั้งค่า MFA'}
                      </Typography>
                      {isAdmin && (
                        <Button
                          id={`user-reset-mfa-btn-${id}`}
                          variant='outlined'
                          color='error'
                          size='small'
                          disabled={!security?.twoFactorEnabled || resetMfaMutation.isPending}
                          onClick={() => setResetTarget('mfa')}
                          startIcon={<Icon icon='mdi:lock-reset' />}
                        >
                          รีเซ็ต MFA
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Passkey card */}
                <Card id={`user-security-passkey-card-${id}`} sx={{ mb: 6 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Icon icon='mdi:fingerprint' fontSize={28} />
                        <Box>
                          <Typography variant='h6'>Passkey</Typography>
                          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            ล็อกอินด้วยลายนิ้วมือ/ Face ID/ กุญแจฮาร์ดแวร์
                          </Typography>
                        </Box>
                      </Box>
                      {securityLoading ? (
                        <Chip id={`user-security-passkey-status-${id}`} label='กำลังโหลด...' color='default' size='small' />
                      ) : (
                        <Chip
                          id={`user-security-passkey-status-${id}`}
                          label={security?.passkeyCount ? `${security.passkeyCount} รายการ` : 'ไม่มี'}
                          color={security?.passkeyCount ? 'success' : 'default'}
                          size='small'
                        />
                      )}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {security?.passkeyCount
                          ? `ลงทะเบียน passkey ${security.passkeyCount} รายการ`
                          : 'ยังไม่มี passkey ลงทะเบียน'}
                      </Typography>
                      {isAdmin && (
                        <Button
                          id={`user-reset-passkey-btn-${id}`}
                          variant='outlined'
                          color='error'
                          size='small'
                          disabled={!security?.passkeyCount || resetPasskeyMutation.isPending}
                          onClick={() => setResetTarget('passkey')}
                          startIcon={<Icon icon='mdi:lock-reset' />}
                        >
                          รีเซ็ต Passkey
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {!isAdmin && (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon icon='mdi:information-outline' fontSize={20} />
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                          เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถรีเซ็ต MFA และ Passkey ได้
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </TabPanel>
            </Grid>
          </Grid>
        </TabContext>
      </Grid>
      {/* Reset confirmation dialog (MFA / Passkey) */}
      <ConfirmResetDialog
        dialogId='user-reset-mfa'
        open={resetTarget === 'mfa'}
        title='รีเซ็ตการยืนยันตัวตนสองขั้นตอน (MFA)'
        description='การรีเซ็ตจะลบรหัส TOTP และรหัสสำรองทั้งหมดของผู้ใช้รายนี้ ผู้ใช้จะต้องตั้งค่า MFA ใหม่อีกครั้ง'
        warning='ผู้ใช้จะถูกออกจากระบบทันทีและต้องเข้าสู่ระบบใหม่'
        confirmText='ยืนยันรีเซ็ต MFA'
        loading={resetMfaMutation.isPending}
        onConfirm={handleConfirmReset}
        onClose={() => setResetTarget(null)}
      />
      <ConfirmResetDialog
        dialogId='user-reset-passkey'
        open={resetTarget === 'passkey'}
        title='รีเซ็ต Passkey'
        description='การรีเซ็ตจะลบ passkey ทั้งหมดของผู้ใช้รายนี้ ผู้ใช้จะต้องลงทะเบียน passkey ใหม่อีกครั้ง'
        warning='ผู้ใช้จะถูกออกจากระบบทันทีและต้องเข้าสู่ระบบใหม่'
        confirmText='ยืนยันรีเซ็ต Passkey'
        loading={resetPasskeyMutation.isPending}
        onConfirm={handleConfirmReset}
        onClose={() => setResetTarget(null)}
      />
    </Grid>
  );
};

export default UserViewPage;
