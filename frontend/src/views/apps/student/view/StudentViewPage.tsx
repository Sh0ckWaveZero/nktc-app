'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import Icon from '@/@core/components/icon';
import CardAward from './CardAward';
import TimelineBadness from './TimelineBadness';
import TimelineGoodness from './TimelineGoodness';
import UserViewLeft from './UserViewLeft';

import { useStudentGoodnessRecords, useDeleteGoodnessRecord } from '@/hooks/queries/useGoodness';
import { useStudentBadnessRecords, useDeleteBadnessRecord } from '@/hooks/queries/useBadness';
import { useStudent, useStudentTrophyOverview, useStudentClassroomTeachers } from '@/hooks/queries/useStudents';
import { useAuth } from '@/hooks/useAuth';
import useImageQuery from '@/hooks/useImageQuery';

import type { StudentData } from '@/types/apps/studentTypes';

// ── Styled tab list ─────────────────────────────────────────────────────────────

const MuiTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-indicator': { display: 'none' },
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
    [theme.breakpoints.up('sm')]: { minWidth: 130 },
  },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────────

const statusMap: Record<string, { label: string; color: 'success' | 'error' | 'info' | 'default' }> = {
  active: { label: 'กำลังศึกษา', color: 'success' },
  inactive: { label: 'ไม่ได้ศึกษา', color: 'error' },
  graduated: { label: 'สำเร็จการศึกษา', color: 'info' },
};

const EmptyState = ({ icon, label }: { icon: string; label: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 14,
      gap: 2,
      color: 'text.disabled',
    }}
  >
    <Icon icon={icon} fontSize={48} />
    <Typography variant='body2'>{label}</Typography>
  </Box>
);

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'center' }}>
    <Box sx={{ fontWeight: 600, minWidth: 148, color: 'text.secondary', flexShrink: 0, fontSize: '0.875rem' }}>
      {label}
    </Box>
    <Box sx={{ color: 'text.primary', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
      {value ?? '-'}
    </Box>
  </Box>
);

// ── Student detail card ─────────────────────────────────────────────────────────

const StudentDetailCard = ({ student }: { student: StudentData | undefined }) => {
  if (!student) {
    return (
      <Card>
        <CardContent>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant='text' height={28} sx={{ mb: 1.5 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  const { user, classroom, program, department, level, studentId, status } = student;
  const account = user.account;

  const address = [account.addressLine1, account.subdistrict, account.district, account.province, account.postcode]
    .filter(Boolean)
    .join(' ');

  const statusInfo = statusMap[status] ?? { label: status, color: 'default' as const };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent sx={{ pt: 5, pb: '20px !important' }}>
        <Typography variant='h6' sx={{ mb: 4 }}>
          ข้อมูลส่วนตัว
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <DetailRow label='รหัสนักเรียน' value={studentId} />
        <DetailRow
          label='สถานะ'
          value={<Chip size='small' label={statusInfo.label} color={statusInfo.color} />}
        />
        <DetailRow label='วันเกิด' value={formatDate(account.birthDate)} />
        <DetailRow label='เลขบัตรประชาชน' value={account.idCard} />
        <DetailRow label='เบอร์โทรศัพท์' value={account.phone} />
        <DetailRow label='ที่อยู่' value={address || null} />

        {(program || department || level || classroom) && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant='h6' sx={{ mb: 4 }}>
              ข้อมูลการศึกษา
            </Typography>
            {level && <DetailRow label='ระดับชั้น' value={level.levelFullName} />}
            {classroom && <DetailRow label='ห้องเรียน' value={classroom.name} />}
            {program && <DetailRow label='สาขาวิชา' value={program.name} />}
            {department && <DetailRow label='แผนก' value={department.name} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ── Page ────────────────────────────────────────────────────────────────────────

interface StudentViewPageProps {
  id: string;
}

const StudentViewPage = ({ id }: StudentViewPageProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user: authUser } = useAuth() as any;

  const { data: student } = useStudent(id);
  const { data: trophyOverview } = useStudentTrophyOverview(id);
  const { data: goodnessData } = useStudentGoodnessRecords(id, 0, 30);
  const { data: badnessData } = useStudentBadnessRecords(id, 0, 30);
  const { data: teacherClassroom = [] } = useStudentClassroomTeachers(student?.classroom?.classroomId ?? '');
  const { mutate: deleteGoodness } = useDeleteGoodnessRecord();
  const { mutate: deleteBadness } = useDeleteBadnessRecord();

  const avatarUrl = student?.user?.account?.avatar ?? '';
  const { image, isLoading: imageLoading } = useImageQuery(avatarUrl);

  const fullName = student
    ? `${student.user.account.title}${student.user.account.firstName} ${student.user.account.lastName}`
    : '';

  const classroomName = student?.classroom
    ? `${student.classroom.level?.levelName ?? ''} ${student.classroom.name ?? ''}`.trim()
    : '-';

  const goodnessRecords: any[] = Array.isArray(goodnessData)
    ? goodnessData
    : (goodnessData as any)?.data ?? [];

  const badnessRecords: any[] = Array.isArray(badnessData)
    ? badnessData
    : (badnessData as any)?.data ?? [];

  const trophy = trophyOverview as any;
  const isEligibleForAward =
    (trophy?.totalTrophy ?? 0) > 0 && (trophy?.goodScore ?? 0) > (trophy?.badScore ?? 0);

  return (
    <Grid container spacing={6}>
      {/* Back button */}
      <Grid size={12}>
        <Button
          component={Link}
          href='/apps/student/list'
          variant='text'
          startIcon={<Icon icon='mdi:arrow-left' fontSize={18} />}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          ย้อนกลับ
        </Button>
      </Grid>

      {/* Sidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        <UserViewLeft
          user={student?.user}
          trophyOverview={trophyOverview}
          teacherClassroom={teacherClassroom}
          isLoading={imageLoading}
          image={image}
          fullName={fullName}
          classroomName={classroomName}
        />
      </Grid>

      {/* Main content */}
      <Grid size={{ xs: 12, md: 8 }}>
        <TabContext value={activeTab}>
          <MuiTabList
            variant='scrollable'
            scrollButtons='auto'
            onChange={(_, v: string) => setActiveTab(v)}
            aria-label='student profile tabs'
          >
            <Tab
              value='overview'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon fontSize={18} icon='mdi:account-outline' />
                  ภาพรวม
                </Box>
              }
            />
            <Tab
              value='goodness'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon fontSize={18} icon='mdi:star-outline' />
                  ความดี
                  {goodnessRecords.length > 0 && (
                    <Chip
                      size='small'
                      label={goodnessRecords.length}
                      color='success'
                      sx={{ height: 18, fontSize: '0.65rem', ml: 0.5 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              value='badness'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon fontSize={18} icon='mdi:alert-outline' />
                  ความประพฤติ
                  {badnessRecords.length > 0 && (
                    <Chip
                      size='small'
                      label={badnessRecords.length}
                      color='error'
                      sx={{ height: 18, fontSize: '0.65rem', ml: 0.5 }}
                    />
                  )}
                </Box>
              }
            />
          </MuiTabList>

          <Box sx={{ mt: 6 }}>
            <TabPanel sx={{ p: 0 }} value='overview'>
              <Grid container spacing={4}>
                {isEligibleForAward && (
                  <Grid size={12}>
                    <CardAward trophyOverview={trophyOverview} fullName={fullName} />
                  </Grid>
                )}
                <Grid size={12}>
                  <StudentDetailCard student={student} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value='goodness'>
              {goodnessRecords.length === 0 ? (
                <EmptyState icon='mdi:star-outline' label='ยังไม่มีบันทึกความดี' />
              ) : (
                <TimelineGoodness info={goodnessRecords} user={authUser} onDeleted={deleteGoodness} />
              )}
            </TabPanel>

            <TabPanel sx={{ p: 0 }} value='badness'>
              {badnessRecords.length === 0 ? (
                <EmptyState icon='mdi:alert-outline' label='ยังไม่มีบันทึกความประพฤติ' />
              ) : (
                <TimelineBadness info={badnessRecords} user={authUser} onDeleted={deleteBadness} />
              )}
            </TabPanel>
          </Box>
        </TabContext>
      </Grid>
    </Grid>
  );
};

export default StudentViewPage;
