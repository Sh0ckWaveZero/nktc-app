'use client';

import { useCallback, useEffect, useReducer, useState, useSyncExternalStore } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AddRounded from '@mui/icons-material/AddRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import DevicesRounded from '@mui/icons-material/DevicesRounded';
import FingerprintRounded from '@mui/icons-material/FingerprintRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';

import BackupCodesRecovery from '@/@core/components/backup-codes/backup-codes-recovery';
import OtpInput from '@/@core/components/otp-input/otp-input';
import { authClient } from '@/libs/better-auth/client';
import { exchangeBetterAuthSession } from '@/libs/better-auth/exchange-session';

interface PasskeyRecord {
  id: string;
  name?: string | null;
  deviceType: string;
  backedUp: boolean;
  createdAt?: Date | string | null;
}

interface TotpEnrollment {
  totpURI: string;
  backupCodes: string[];
}

interface BackupCodesState {
  codes: string[];
  isVisible: boolean;
}

type BackupCodesAction = { type: 'reset' } | { type: 'setCodes'; codes: string[] } | { type: 'toggleVisibility' };

const INITIAL_BACKUP_CODES_STATE: BackupCodesState = {
  codes: [],
  isVisible: false,
};

const backupCodesReducer = (state: BackupCodesState, action: BackupCodesAction): BackupCodesState => {
  switch (action.type) {
    case 'reset':
      return INITIAL_BACKUP_CODES_STATE;
    case 'setCodes':
      return { ...state, codes: action.codes, isVisible: false };
    case 'toggleVisibility':
      return { ...state, isVisible: !state.isVisible };
    default:
      return state;
  }
};

const getErrorMessage = (error: { message?: string } | null, fallback: string): string => error?.message || fallback;
const emptySubscribe = () => () => {};
const getPasskeySupport = (): boolean => window.isSecureContext && 'PublicKeyCredential' in window;
const passkeyDateFormatter = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatPasskeyDate = (value: PasskeyRecord['createdAt']): string | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return passkeyDateFormatter.format(date);
};

/** จัดการ TOTP MFA, backup codes และ Passkey ของบัญชี */
const AuthenticationMethods = () => {
  const { data: session, isPending: isSessionPending, refetch: refetchSession } = authClient.useSession();
  const [backupCodesState, dispatchBackupCodes] = useReducer(backupCodesReducer, INITIAL_BACKUP_CODES_STATE);
  const [isBusy, setIsBusy] = useState(false);
  const isPasskeySupported = useSyncExternalStore(emptySubscribe, getPasskeySupport, () => false);
  const [passkeyName, setPasskeyName] = useState('');
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [securityPassword, setSecurityPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState(false);
  const [totpEnrollment, setTotpEnrollment] = useState<TotpEnrollment | null>(null);
  const { codes: backupCodes, isVisible: isBackupCodesVisible } = backupCodesState;

  const loadPasskeys = useCallback(async () => {
    if (!session) return;
    const result = await authClient.passkey.listUserPasskeys();
    if (result.error) {
      toast.error(getErrorMessage(result.error, 'โหลด Passkey ไม่สำเร็จ'));
      return;
    }
    setPasskeys(result.data || []);
  }, [session]);

  useEffect(() => {
    void loadPasskeys();
  }, [loadPasskeys]);

  const handleEnableMfa = async () => {
    if (!securityPassword) {
      toast.error('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }
    setIsBusy(true);
    try {
      const result = await authClient.twoFactor.enable({
        password: securityPassword,
        issuer: 'NKTC Student Management System',
      });
      if (result.error) throw new Error(getErrorMessage(result.error, 'เปิด MFA ไม่สำเร็จ'));
      setTotpEnrollment({ totpURI: result.data.totpURI, backupCodes: result.data.backupCodes });
      dispatchBackupCodes({ type: 'reset' });
      setTotpCode('');
      setTotpError(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เปิด MFA ไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyEnrollment = async (code = totpCode) => {
    const normalizedCode = code.replace(/\D/g, '').slice(0, 6);
    const enrollment = totpEnrollment;
    if (normalizedCode.length !== 6 || isBusy || !enrollment) return;

    setIsBusy(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({ code: normalizedCode });
      if (result.error) {
        setTotpError(true);
        throw new Error(getErrorMessage(result.error, 'รหัสยืนยันไม่ถูกต้อง'));
      }
      await exchangeBetterAuthSession();
      await refetchSession();
      setTotpEnrollment(null);
      setTotpCode('');
      setTotpError(false);
      setSecurityPassword('');
      dispatchBackupCodes({ type: 'setCodes', codes: enrollment.backupCodes });
      toast.success('เปิดใช้งาน MFA แล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'รหัสยืนยันไม่ถูกต้อง');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!securityPassword) {
      toast.error('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }
    setIsBusy(true);
    try {
      const result = await authClient.twoFactor.disable({ password: securityPassword });
      if (result.error) throw new Error(getErrorMessage(result.error, 'ปิด MFA ไม่สำเร็จ'));
      await refetchSession();
      dispatchBackupCodes({ type: 'reset' });
      setSecurityPassword('');
      toast.success('ปิดใช้งาน MFA แล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ปิด MFA ไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!securityPassword) {
      toast.error('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }
    setIsBusy(true);
    try {
      const result = await authClient.twoFactor.generateBackupCodes({ password: securityPassword });
      if (result.error) throw new Error(getErrorMessage(result.error, 'สร้างรหัสสำรองไม่สำเร็จ'));
      dispatchBackupCodes({ type: 'setCodes', codes: result.data.backupCodes });
      setSecurityPassword('');
      toast.success('สร้างรหัสสำรองชุดใหม่แล้ว กดแสดงรหัสเพื่อดู');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'สร้างรหัสสำรองไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!backupCodes.length || !isBackupCodesVisible) return;
    const blob = new Blob([`${backupCodes.join('\n')}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nktc-backup-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success('ดาวน์โหลดรหัสสำรองแล้ว');
  };

  const handleCopyBackupCodes = () => {
    if (!backupCodes.length || !isBackupCodesVisible) return;
    if (!navigator.clipboard) {
      toast.error('เบราว์เซอร์นี้ไม่รองรับการคัดลอกอัตโนมัติ');
      return;
    }
    void navigator.clipboard
      .writeText(backupCodes.join('\n'))
      .then(() => toast.success('คัดลอกรหัสสำรองแล้ว'))
      .catch(() => toast.error('คัดลอกรหัสสำรองไม่สำเร็จ'));
  };

  const handleAddPasskey = async () => {
    setIsBusy(true);
    try {
      const result = await authClient.passkey.addPasskey({
        name: passkeyName.trim() || undefined,
      });
      if (result.error) throw new Error(getErrorMessage(result.error, 'เพิ่ม Passkey ไม่สำเร็จ'));
      setPasskeyName('');
      await loadPasskeys();
      toast.success('เพิ่ม Passkey แล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เพิ่ม Passkey ไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    setIsBusy(true);
    try {
      const result = await authClient.passkey.deletePasskey({ id });
      if (result.error) throw new Error(getErrorMessage(result.error, 'ลบ Passkey ไม่สำเร็จ'));
      setPendingDeleteId(null);
      await loadPasskeys();
      toast.success('ลบ Passkey แล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ลบ Passkey ไม่สำเร็จ');
    } finally {
      setIsBusy(false);
    }
  };

  if (isSessionPending) {
    return (
      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress aria-label='กำลังโหลดวิธีเข้าสู่ระบบ' />
      </CardContent>
    );
  }

  if (!session) {
    return (
      <CardContent>
        <Alert severity='info'>กรุณาออกจากระบบแล้วเข้าสู่ระบบอีกครั้ง เพื่อจัดการ MFA และ Passkey</Alert>
      </CardContent>
    );
  }

  const isMfaEnabled = session.user.twoFactorEnabled === true;

  return (
    <CardContent>
      <Divider sx={{ mb: 4 }} />
      <Box component='section' aria-labelledby='mfa-heading' sx={{ p: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={(theme) => ({
                display: 'grid',
                width: 44,
                height: 44,
                flexShrink: 0,
                placeItems: 'center',
                borderRadius: 1.5,
                color: theme.palette.info.dark,
                backgroundColor: alpha(theme.palette.info.main, 0.1),
              })}
            >
              <ShieldRounded sx={{ fontSize: 25 }} />
            </Box>
            <Box>
              <Typography id='mfa-heading' variant='h6' component='h2' sx={{ fontWeight: 700 }}>
                การยืนยันตัวตนหลายขั้นตอน
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
                ใช้แอปยืนยันตัวตนที่รองรับ TOTP และเก็บรหัสสำรองไว้ในที่ปลอดภัย
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={isMfaEnabled ? 'MFA เปิดใช้งาน' : 'MFA ยังไม่เปิด'}
            color={isMfaEnabled ? 'success' : 'default'}
            variant={isMfaEnabled ? 'filled' : 'outlined'}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 600 }}
          />
        </Stack>

        <Box
          sx={(theme) => ({
            mt: 3,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 1.5,
            backgroundColor: alpha(theme.palette.info.main, 0.035),
          })}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
            <TextField
              id='mfa-security-password'
              type='password'
              size='small'
              label='รหัสผ่านปัจจุบัน'
              value={securityPassword}
              onChange={(event) => setSecurityPassword(event.target.value)}
              autoComplete='current-password'
              sx={{ flex: 1, minWidth: { sm: 260 } }}
            />
            {isMfaEnabled ? (
              <>
                <Button variant='outlined' onClick={handleGenerateBackupCodes} disabled={isBusy}>
                  สร้างรหัสสำรองใหม่
                </Button>
                <Button color='error' variant='outlined' onClick={handleDisableMfa} disabled={isBusy}>
                  ปิด MFA
                </Button>
              </>
            ) : (
              <Button variant='contained' onClick={handleEnableMfa} disabled={isBusy}>
                ตั้งค่า MFA
              </Button>
            )}
          </Stack>
        </Box>

        {totpEnrollment ? (
          <Alert
            severity='info'
            sx={{
              mt: 2,
              alignItems: 'stretch',
              borderRadius: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>สแกน QR Code แล้วกรอกรหัส 6 หลักเพื่อยืนยัน</Typography>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 2, md: 3 }}
              sx={{ mt: 2, alignItems: { md: 'center' } }}
            >
              <Box
                sx={{
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  bgcolor: 'common.white',
                  p: { xs: 1.5, sm: 2 },
                  lineHeight: 0,
                  borderRadius: 1.5,
                  boxShadow: '0 4px 14px rgba(31, 45, 61, 0.08)',
                }}
              >
                <QRCode value={totpEnrollment.totpURI} size={180} aria-label='QR Code สำหรับตั้งค่า TOTP' />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                  เปิดแอปยืนยันตัวตน แล้วกรอกรหัสที่แสดงอยู่ตอนนี้
                </Typography>
                <OtpInput
                  id='mfa-totp-code'
                  value={totpCode}
                  onChange={(value) => {
                    setTotpCode(value);
                    if (totpError) setTotpError(false);
                    if (value.length === 6) void handleVerifyEnrollment(value);
                  }}
                  helperText={totpError ? 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุ' : undefined}
                  error={totpError}
                  disabled={isBusy}
                  autoFocus
                />
                <Button
                  variant='contained'
                  onClick={() => void handleVerifyEnrollment()}
                  disabled={isBusy || totpCode.length !== 6}
                  sx={{ mt: 2, minHeight: 44 }}
                >
                  ยืนยันการเปิด MFA
                </Button>
              </Box>
            </Stack>
          </Alert>
        ) : null}

        {backupCodes.length > 0 ? (
          <BackupCodesRecovery
            codes={backupCodes}
            isVisible={isBackupCodesVisible}
            isBusy={isBusy}
            onToggleVisibility={() => dispatchBackupCodes({ type: 'toggleVisibility' })}
            onDownload={handleDownloadBackupCodes}
            onCopy={handleCopyBackupCodes}
          />
        ) : null}
      </Box>

      <Divider sx={{ my: 4 }} />
      <Box
        component='section'
        aria-labelledby='passkey-heading'
        sx={(theme) => ({
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.07)} 0%, ${
            theme.palette.background.paper
          } 34%)`,
          p: { xs: 2, sm: 3 },
        })}
      >
        <Box
          aria-hidden='true'
          sx={(theme) => ({
            position: 'absolute',
            top: -96,
            right: -70,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.18)} 0%, ${alpha(
              theme.palette.info.main,
              0,
            )} 70%)`,
            pointerEvents: 'none',
          })}
        />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ position: 'relative', justifyContent: 'space-between' }}
        >
          <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={(theme) => ({
                display: 'grid',
                width: 52,
                height: 52,
                flexShrink: 0,
                placeItems: 'center',
                borderRadius: 1.5,
                color: theme.palette.primary.dark,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(
                  theme.palette.info.main,
                  0.1,
                )} 100%)`,
                boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.7)}`,
              })}
            >
              <FingerprintRounded sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                id='passkey-heading'
                variant='h6'
                component='h2'
                sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                Passkeys
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25, maxWidth: 560 }}>
                เข้าสู่ระบบด้วยลายนิ้วมือ ใบหน้า PIN หรือกุญแจความปลอดภัย โดยไม่ต้องกรอกรหัสผ่าน
              </Typography>
            </Box>
          </Stack>
          <Chip
            size='small'
            icon={passkeys.length ? <CheckCircleRounded /> : <ShieldRounded />}
            label={passkeys.length ? `${passkeys.length} รายการ` : 'ยังไม่ได้ตั้งค่า'}
            color={passkeys.length ? 'success' : 'default'}
            variant={passkeys.length ? 'filled' : 'outlined'}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 600 }}
          />
        </Stack>

        {!isPasskeySupported ? (
          <Alert
            severity='warning'
            icon={<ShieldRounded fontSize='inherit' />}
            sx={{ position: 'relative', mt: 3, alignItems: 'center' }}
          >
            อุปกรณ์หรือหน้าเว็บนี้ไม่รองรับ Passkey กรุณาใช้ HTTPS หรือ localhost
          </Alert>
        ) : (
          <>
            <Box
              sx={(theme) => ({
                position: 'relative',
                mt: 3,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.035),
              })}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                    <KeyRounded sx={{ color: 'primary.main', fontSize: 19 }} />
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      เพิ่ม Passkey ใหม่
                    </Typography>
                  </Stack>
                  <Typography variant='caption' color='text.secondary'>
                    ตั้งชื่ออุปกรณ์เพื่อให้จำได้ง่ายเมื่อต้องจัดการในภายหลัง
                  </Typography>
                </Box>
                <TextField
                  id='passkey-name'
                  size='small'
                  label='ชื่ออุปกรณ์ (ไม่บังคับ)'
                  placeholder='เช่น MacBook ส่วนตัว'
                  value={passkeyName}
                  onChange={(event) => setPasskeyName(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                  sx={{ width: { xs: '100%', sm: 250 } }}
                />
                <Button
                  variant='contained'
                  startIcon={<AddRounded />}
                  onClick={handleAddPasskey}
                  disabled={isBusy}
                  sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
                >
                  เพิ่ม Passkey
                </Button>
              </Stack>
            </Box>

            {passkeys.length ? (
              <Box
                sx={(theme) => ({
                  mt: 2,
                  overflow: 'hidden',
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.background.paper, 0.72),
                })}
              >
                <List disablePadding aria-label='Passkey ที่ลงทะเบียนไว้'>
                  {passkeys.map((passkey, index) => {
                    const createdAt = formatPasskeyDate(passkey.createdAt);
                    const isPendingDelete = pendingDeleteId === passkey.id;

                    return (
                      <ListItem
                        key={passkey.id}
                        disableGutters
                        sx={(theme) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: { xs: 1.25, sm: 2 },
                          p: { xs: 1.5, sm: 2 },
                          borderBottom: index === passkeys.length - 1 ? 'none' : `1px solid ${theme.palette.divider}`,
                        })}
                      >
                        <Box
                          sx={(theme) => ({
                            display: 'grid',
                            width: { xs: 40, sm: 44 },
                            height: { xs: 40, sm: 44 },
                            flexShrink: 0,
                            placeItems: 'center',
                            borderRadius: 1.5,
                            color: theme.palette.text.secondary,
                            backgroundColor: alpha(theme.palette.grey[500], 0.12),
                          })}
                        >
                          <FingerprintRounded sx={{ fontSize: { xs: 23, sm: 26 } }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            sx={{ alignItems: { sm: 'center' } }}
                          >
                            <Typography noWrap variant='subtitle2' sx={{ fontWeight: 700 }}>
                              {passkey.name || 'Passkey'}
                            </Typography>
                            {passkey.backedUp ? (
                              <Chip
                                size='small'
                                label='สำรองแล้ว'
                                color='success'
                                variant='outlined'
                                sx={{ width: 'fit-content', height: 22, fontSize: '0.7rem' }}
                              />
                            ) : null}
                          </Stack>
                          <Stack
                            direction='row'
                            spacing={1.5}
                            sx={{ mt: 0.35, flexWrap: 'wrap', color: 'text.secondary' }}
                          >
                            <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
                              <DevicesRounded sx={{ fontSize: 16 }} />
                              <Typography variant='caption'>
                                {passkey.deviceType === 'multiDevice' ? 'ซิงก์หลายอุปกรณ์' : 'อุปกรณ์นี้'}
                              </Typography>
                            </Stack>
                            {createdAt ? <Typography variant='caption'>เพิ่มเมื่อ {createdAt}</Typography> : null}
                          </Stack>
                        </Box>
                        {isPendingDelete ? (
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={0.5}
                            sx={{ alignItems: { sm: 'center' } }}
                          >
                            <Button
                              size='small'
                              color='error'
                              onClick={() => handleDeletePasskey(passkey.id)}
                              disabled={isBusy}
                            >
                              ยืนยันลบ
                            </Button>
                            <Button
                              size='small'
                              color='secondary'
                              onClick={() => setPendingDeleteId(null)}
                              disabled={isBusy}
                            >
                              ยกเลิก
                            </Button>
                          </Stack>
                        ) : (
                          <Tooltip title='ลบ Passkey'>
                            <IconButton
                              size='small'
                              color='error'
                              aria-label={`ลบ ${passkey.name || 'Passkey'}`}
                              onClick={() => setPendingDeleteId(passkey.id)}
                              disabled={isBusy}
                            >
                              <DeleteOutlineRounded fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : (
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mt: 2,
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.035),
                })}
              >
                <Box
                  sx={(theme) => ({
                    display: 'grid',
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    placeItems: 'center',
                    borderRadius: 1.5,
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  })}
                >
                  <FingerprintRounded fontSize='small' />
                </Box>
                <Box>
                  <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                    ยังไม่มี Passkey ในบัญชีนี้
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    เพิ่ม Passkey เพื่อเข้าสู่ระบบได้เร็วขึ้นและปลอดภัยยิ่งขึ้น
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </CardContent>
  );
};

export default AuthenticationMethods;
