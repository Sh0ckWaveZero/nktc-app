'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { NavLink } from '@/@core/layouts/types';
import type { CardMenuProps } from '@/@core/components/card-statistics/types';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useTeacherDashboard } from './hooks/useTeacherDashboard';
import { MENU_LIST } from './constants';
import WelcomeBanner from './components/WelcomeBanner';
import StatsCards from './components/StatsCards';
import AttendanceChart from './components/AttendanceChart';
import QuickMenuPanel from './components/QuickMenuPanel';
import StudentSpotlight from './components/StudentSpotlight';
import PedagogyInsights from './components/PedagogyInsights';

type FilteredShortcut = CardMenuProps & { navLink: NavLink & { path: string } };

const TeacherHomePage = () => {
  const auth = useAuth();
  const { isAdmin } = useRole();
  const ability = useContext(AbilityContext);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showAllShortcuts, setShowAllShortcuts] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { classroomNames, dashboardStats, studentAlerts, greetingText, educationalInsight, isLoading } =
    useTeacherDashboard();

  const filteredShortcuts = useMemo<FilteredShortcut[]>(() => {
    return MENU_LIST.filter((menu): menu is CardMenuProps & { navLink: NavLink & { path: string } } => {
      const navLink = menu.navLink;
      if (!navLink || !navLink.path) return false;
      return ability.can(navLink.action, navLink.subject);
    });
  }, [ability]);

  const categorizedShortcuts = useMemo(() => {
    const dailyLogs = filteredShortcuts.filter(
      (item) =>
        ['daily', 'activity', 'individual', 'group'].includes(item.badge || '') && !item.title.startsWith('รายงาน'),
    );
    const reports = filteredShortcuts.filter(
      (item) =>
        item.title.startsWith('รายงาน') ||
        item.title.startsWith('สรุป') ||
        item.title.startsWith('จัดลำดับ') ||
        item.title.startsWith('Report'),
    );
    const settings = filteredShortcuts.filter(
      (item) =>
        ['db', 'action', 'staff', 'admin', 'setting'].includes(item.badge || '') &&
        !item.title.includes('จัดลำดับ') &&
        !item.title.startsWith('รายงาน'),
    );
    return { all: filteredShortcuts, dailyLogs, reports, settings };
  }, [filteredShortcuts]);

  const visibleShortcuts = useMemo<FilteredShortcut[]>(() => {
    const list =
      activeTab === 0 ? categorizedShortcuts.all
      : activeTab === 1 ? categorizedShortcuts.dailyLogs
      : activeTab === 2 ? categorizedShortcuts.reports
      : categorizedShortcuts.settings;

    if (!showAllShortcuts && list.length > 8) {
      return list.slice(0, 8);
    }
    return list;
  }, [activeTab, categorizedShortcuts, showAllShortcuts]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleShortcutClick = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='h1' sx={{ display: 'none' }}>
        NKTC Student Management System - หน้าหลักแดชบอร์ดคุณครูประจำชั้น
      </Typography>

      <Grid container spacing={6}>
        {/* ROW 1: WELCOME BANNER */}
        <Grid size={12}>
          <WelcomeBanner
            user={auth?.user}
            classroomNames={classroomNames}
            isAdmin={isAdmin}
            greetingText={greetingText}
          />
        </Grid>

        {/* ROW 2: STATS KPI INDICATORS */}
        <StatsCards dashboardStats={dashboardStats} isLoading={isLoading} />

        {/* ROW 3: CHART & QUICK ACTIONS */}
        <Grid size={{ xs: 12, md: 8 }}>
          <AttendanceChart isMounted={isMounted} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickMenuPanel
            filteredShortcuts={filteredShortcuts}
            visibleShortcuts={visibleShortcuts}
            activeTab={activeTab}
            showAllShortcuts={showAllShortcuts}
            onTabChange={handleTabChange}
            onShortcutClick={handleShortcutClick}
            onToggleShowAll={() => setShowAllShortcuts(!showAllShortcuts)}
          />
        </Grid>

        {/* ROW 4: STUDENT FOCUS & PEDAGOGY */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentSpotlight studentAlerts={studentAlerts} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PedagogyInsights educationalInsight={educationalInsight} dashboardStats={dashboardStats} />
        </Grid>
      </Grid>
    </Box>
  );
};

TeacherHomePage.acl = {
  action: 'read',
  subject: 'home-page',
};

export default TeacherHomePage;
