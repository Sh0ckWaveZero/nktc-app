'use client';

import { useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ** MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { useTheme, styled, alpha } from '@mui/material/styles';
import type { NavLink, ThemeColor } from '@/@core/layouts/types';

// ** Custom Components Imports
import CustomAvatar from '@/@core/components/mui/avatar';
import CanViewNavLink from '@/layouts/components/acl/CanViewNavLink';

// ** Icons Imports
import {
  HiOutlineClipboardList,
  HiOutlineChartPie,
  HiOutlineFlag,
  HiOutlineLightBulb,
  HiOutlineDatabase,
  HiOutlineSelector,
  HiStar,
  HiThumbDown,
} from 'react-icons/hi';
import {
  MdHistoryToggleOff,
  MdIso,
  MdManageAccounts,
  MdOutlineClass,
  MdOutlineHome,
  MdOutlineTrendingUp,
  MdChevronRight,
} from 'react-icons/md';
import { BsCalendar2Month, BsCalendar2Week, BsClipboardData } from 'react-icons/bs';
import { TbChartBar, TbReport } from 'react-icons/tb';
import IconifyIcon from '@/@core/components/icon';

// ** Hooks & Contexts
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useSystemSettings } from '@/hooks/queries';
import { useTeacherStudents } from '@/hooks/queries/useTeachers';
import { useTeacherVisitStudents } from '@/hooks/queries/useVisits';
import { useCheckInReportsByClassrooms } from '@/hooks/queries/useCheckIn';
import { getAdvisorClassroomIds } from '@/utils/advisor-classrooms';
import { toApiDate } from '@/utils/datetime';
import { formatThaiDate } from '@/@core/components/mui/date-picker-thai/utils';
import { apiConfig } from '@/configs/api';
import { AbilityContext } from '@/layouts/components/acl/Can';

// ** Recharts Imports (Dynamic Import or mounted guard to prevent Next.js hydration issues)
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { CardMenuProps } from '@/@core/components/card-statistics/types';

// ** Styled Components — อิง theme palette ตามหลัก 60-30-10
const WelcomeCard = styled(Card)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: `0 14px 36px ${alpha(theme.palette.common.black, isDark ? 0.22 : 0.06)}`,
  };
});

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.16 : 0.04)}`,
}));

const SurfaceCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.16 : 0.04)}`,
}));

const isInternshipStudent = (status: unknown) => status === 'intern' || status === 'internship';
const SHORTCUT_PREVIEW_COUNT = 4;

const QuickActionButton = styled('button')(({ theme }) => ({
  width: '100%',
  minHeight: 68,
  height: '100%',
  padding: theme.spacing(1.5),
  display: 'flex',
  gap: theme.spacing(1.5),
  alignItems: 'center',
  justifyContent: 'flex-start',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  textAlign: 'left',
  textDecoration: 'none',
  font: 'inherit',
  color: 'inherit',
  '&:hover': {
    borderColor: theme.palette.primary.light,
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
  },
  '&:focus-visible': {
    outline: `3px solid ${alpha(theme.palette.primary.main, 0.28)}`,
    outlineOffset: 2,
  },
}));

const RiskAvatar = styled(Avatar)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    width: 44,
    height: 44,
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.error.main, isDark ? 0.18 : 0.08),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, isDark ? 0.35 : 0.2)}`,
  };
});

const StarAvatar = styled(Avatar)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    width: 44,
    height: 44,
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.warning.main, isDark ? 0.18 : 0.08),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, isDark ? 0.35 : 0.2)}`,
  };
});

const TeacherHomePage = () => {
  const auth = useAuth();
  const { isAdmin, isTeacher } = useRole();
  const { settings } = useSystemSettings();
  const ability = useContext(AbilityContext);
  const router = useRouter();
  const theme = useTheme();

  // ** States
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showAllShortcuts, setShowAllShortcuts] = useState<boolean>(false);

  // Set isMounted to true on client mount to prevent hydration mismatch for recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ** React Query - Fetch classrooms & students for current advisor
  const teacherId = auth?.user?.teacher?.id as string;
  const { data: teacherStudents, isLoading: isLoadingTeacherData } = useTeacherStudents(teacherId);

  // Get active advisor classroom details
  const classroomInfo = useMemo(() => {
    if (teacherStudents?.classrooms && teacherStudents.classrooms.length > 0) {
      return teacherStudents.classrooms[0];
    }
    return null;
  }, [teacherStudents]);

  // Get all advisor classroom names as a comma-separated string
  const classroomNames = useMemo(() => {
    if (teacherStudents?.classrooms && teacherStudents.classrooms.length > 0) {
      return teacherStudents.classrooms
        .map((c: any) => c.name)
        .filter(Boolean)
        .join(', ');
    }
    return '';
  }, [teacherStudents]);

  // Total students aggregated from all classrooms under this advisor teacher
  const dbStudents = useMemo(() => {
    if (teacherStudents?.classrooms && teacherStudents.classrooms.length > 0) {
      return teacherStudents.classrooms.flatMap((c: any) => c.students || []);
    }
    return [];
  }, [teacherStudents]);

  const hasRealClassroom = classroomInfo !== null && dbStudents.length > 0;

  const authAdvisorClassroomIds = useMemo(() => getAdvisorClassroomIds(auth.user), [auth.user]);

  // ** Get Classroom IDs under this advisor for the visit progress API
  const advisorClassroomIds = useMemo(() => {
    const teacherClassroomIds = Array.isArray(teacherStudents?.classrooms)
      ? teacherStudents.classrooms.map((c: any) => c.id).filter(Boolean)
      : [];

    return Array.from(new Set([...authAdvisorClassroomIds, ...teacherClassroomIds])).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [authAdvisorClassroomIds, teacherStudents]);

  // ** Fetch real-time visit status & SDQ assessments for advisor students
  const {
    data: visitStudents = [],
    isLoading: isLoadingVisitData,
    isFetching: isFetchingVisitData,
  } = useTeacherVisitStudents(undefined, {
    enabled: Boolean(auth.isInitialized && !auth.loading && isTeacher),
    advisorClassroomIds,
  });

  // ** Fetch today's check-in report for the first classroom of the advisor
  const todayStr = useMemo(() => toApiDate(new Date()), []);
  const todayLabel = useMemo(() => formatThaiDate(new Date(`${todayStr}T00:00:00`)), [todayStr]);
  const {
    data: todayCheckInReport,
    isLoading: isLoadingCheckInData,
    isFetching: isFetchingCheckInData,
  } = useCheckInReportsByClassrooms({
    teacherId,
    classroomIds: advisorClassroomIds,
    date: todayStr,
  });

  // ** Dynamic Thai Time-based Greeting
  const greetingText = useMemo(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'อรุณสวัสดิ์';
    if (hours >= 12 && hours < 17) return 'สวัสดีตอนบ่าย';
    if (hours >= 17 && hours < 22) return 'สวัสดีตอนเย็น';
    return 'สวัสดีตอนค่ำ';
  }, []);

  // ** Generate rich dashboard statistics (Integrating real DB data + fallback mockup)
  const dashboardStats = useMemo(() => {
    const totalCount = hasRealClassroom ? dbStudents.length : 32;
    const internCount = hasRealClassroom ? dbStudents.filter((s: any) => isInternshipStudent(s.status)).length : 3;
    const normalCount = totalCount - internCount;

    // Male / Female ratio calculation
    let maleCount = 0;
    let femaleCount = 0;
    if (hasRealClassroom) {
      dbStudents.forEach((s: any) => {
        const account = s.user?.account || s.account;
        const title = account?.title || '';
        const firstName = account?.firstName || '';
        const combined = `${title}${firstName}`.trim();

        if (
          combined.includes('นาย') ||
          combined.includes('เด็กชาย') ||
          combined.includes('ด.ช.') ||
          combined.toLowerCase().includes('mr.')
        ) {
          maleCount++;
        } else if (
          combined.includes('นางสาว') ||
          combined.includes('นาง') ||
          combined.includes('เด็กหญิง') ||
          combined.includes('ด.ญ.') ||
          combined.toLowerCase().includes('ms.') ||
          combined.toLowerCase().includes('mrs.') ||
          combined.toLowerCase().includes('miss')
        ) {
          femaleCount++;
        } else {
          // Safe fallback if title is not specified
          femaleCount++;
        }
      });
    } else {
      maleCount = 20;
      femaleCount = 12;
    }

    // Attendance (Today's check-in calculation based on real check-in data)
    let present = 0;
    let late = 0;
    let leave = 0;
    let absent = 0;
    let hasCheckInRecord = false;

    if (hasRealClassroom && todayCheckInReport.totalChecked > 0) {
      if (todayCheckInReport.totalChecked > 0) {
        present = todayCheckInReport.present.length;
        late = todayCheckInReport.late.length;
        leave = todayCheckInReport.leave.length;
        absent = todayCheckInReport.absent.length;
        hasCheckInRecord = true;
      }
    }

    // Fallback to mockup simulation ONLY when there is no check-in record for today
    if (!hasCheckInRecord) {
      present = hasRealClassroom ? Math.floor(normalCount * 0.93) : 26;
      late = hasRealClassroom ? Math.floor(normalCount * 0.04) : 1;
      leave = hasRealClassroom ? Math.floor(normalCount * 0.02) : 1;
      absent = normalCount - present - late - leave;
    }

    const checkedStudentsCount = present + late + leave + absent;
    const attendanceBaseCount = hasCheckInRecord ? checkedStudentsCount : normalCount;
    const attendanceRate = attendanceBaseCount > 0 ? Math.round(((present + late) / attendanceBaseCount) * 100) : 100;

    // Real behavior statistics calculation
    let totalScoreSum = 0;
    let totalGoodCount = 0;
    let totalBadCount = 0;

    if (hasRealClassroom) {
      dbStudents.forEach((student: any) => {
        const goodPoints = student._count?.goodnessIndividual || 0;
        const badPoints = student._count?.badnessIndividual || 0;
        totalGoodCount += goodPoints;
        totalBadCount += badPoints;
        totalScoreSum += 100 + goodPoints * 5 - badPoints * 10;
      });
    }

    const averageScore = dbStudents.length > 0 ? Math.round((totalScoreSum / dbStudents.length) * 10) / 10 : 94.5;
    const goodnessTotalCount = hasRealClassroom ? totalGoodCount : 84;
    const badnessTotalCount = hasRealClassroom ? totalBadCount : 6;

    // Home visit and SDQ progress
    let visitedCount = 14;
    let sdqCount = 24;
    let eqCount = 22;
    const taskPopulationCount = hasRealClassroom
      ? dbStudents.length
      : visitStudents.length > 0
        ? visitStudents.length
        : 32;

    if (visitStudents && visitStudents.length > 0) {
      visitedCount = visitStudents.filter((s: any) => s.visitStatus === 'recorded').length;
      sdqCount = visitStudents.filter((s: any) => {
        const assessments = s.visitDetail?.sdqAssessments;
        return Array.isArray(assessments) && assessments.length > 0;
      }).length;
      eqCount = Math.min(sdqCount, Math.floor(visitStudents.length * 0.7));
    } else if (hasRealClassroom) {
      visitedCount = 0;
      sdqCount = 0;
      eqCount = 0;
    }

    const visitProgress = taskPopulationCount > 0 ? Math.round((visitedCount / taskPopulationCount) * 100) : 0;
    const sdqProgress = taskPopulationCount > 0 ? Math.round((sdqCount / taskPopulationCount) * 100) : 0;

    return {
      totalCount,
      internCount,
      normalCount,
      maleCount,
      femaleCount,
      attendance: {
        present,
        late,
        leave,
        absent,
        attendanceRate,
      },
      behavior: {
        averageScore,
        goodnessTotalCount,
        badnessTotalCount,
        totalGoodnessScore: goodnessTotalCount * 5,
      },
      tasks: {
        visitedCount,
        visitProgress,
        sdqCount,
        sdqProgress,
        eqCount,
        taskPopulationCount,
      },
    };
  }, [hasRealClassroom, dbStudents, todayCheckInReport, visitStudents]);

  // ** Student Alerts List (E.g. low behavior score or high absences)
  const studentAlerts = useMemo(() => {
    if (hasRealClassroom) {
      // Build alerts using real DB students
      const mappedAlerts: any[] = [];
      const outstandingList: any[] = [];

      dbStudents.forEach((student: any) => {
        const account = student.user?.account || student.account;
        const fullName = `${account?.title ?? ''}${account?.firstName ?? ''} ${account?.lastName ?? ''}`;
        const studentId = student.studentId ?? 'N/A';

        // Real behavior score calculation
        const goodPoints = student._count?.goodnessIndividual || 0;
        const badPoints = student._count?.badnessIndividual || 0;
        const score = 100 + goodPoints * 5 - badPoints * 10;
        const goodnessScore = goodPoints * 5; // คะแนนความดีสะสมจริง

        if (score < 90) {
          mappedAlerts.push({
            id: student.id,
            name: fullName,
            studentId,
            reason:
              score < 80 ? `คะแนนความประพฤติวิกฤต (${score} คะแนน)` : `คะแนนความประพฤติต่ำกว่าเกณฑ์ (${score} คะแนน)`,
            type: 'behavior',
          });
        }

        // Add students to outstanding list based on actual goodness points
        outstandingList.push({
          id: student.id,
          name: fullName,
          studentId,
          score,
          goodnessScore,
          goodnessCount: goodPoints,
        });
      });

      const sortedOutstanding = outstandingList
        .filter((student) => student.goodnessScore > 0) // กรองเฉพาะนักเรียนที่ทำความดีและมีคะแนนสะสมมากกว่า 0
        .sort((a, b) => b.goodnessScore - a.goodnessScore)
        .slice(0, 3);

      return { alerts: mappedAlerts.slice(0, 4), outstanding: sortedOutstanding };
    } else {
      // Complete Premium Mock for default state
      return {
        alerts: [
          {
            id: 'mock-1',
            name: 'นายเกียรติศักดิ์ อุดมศักดิ์',
            studentId: '66309012401',
            reason: 'ขาดเรียน 3 วันสัปดาห์นี้ (เสี่ยงหลุดระบบ)',
            type: 'attendance',
          },
          {
            id: 'mock-2',
            name: 'นายปฏิภาณ เจริญสุข',
            studentId: '66309012415',
            reason: 'มาสายสะสมเกิน 5 ครั้ง (ตักเตือนแล้ว)',
            type: 'attendance',
          },
          {
            id: 'mock-3',
            name: 'นายชินดนัย เรืองศรี',
            studentId: '66309012408',
            reason: 'คะแนนพฤติกรรมสะสมต่ำกว่าเกณฑ์ (52 คะแนน)',
            type: 'behavior',
          },
        ],
        outstanding: [
          {
            id: 'good-1',
            name: 'นางสาวธนภรณ์ รัตนโชติ',
            studentId: '66309012428',
            score: 145,
            goodnessScore: 45,
            goodnessCount: 9,
          },
          {
            id: 'good-2',
            name: 'นางสาวปรียาภรณ์ มั่งมี',
            studentId: '66309012431',
            score: 130,
            goodnessScore: 30,
            goodnessCount: 6,
          },
          {
            id: 'good-3',
            name: 'นายสรวิชญ์ บูรณพิมพ์',
            studentId: '66309012421',
            score: 125,
            goodnessScore: 25,
            goodnessCount: 5,
          },
        ],
      };
    }
  }, [hasRealClassroom, dbStudents]);

  // ** Educational Insight Pedagogy Quote
  const educationalInsight = useMemo(() => {
    const insights = [
      {
        quote: "เด็กที่ 'ยากที่สุด' มักจะเป็นเด็กที่ต้องการความรักและความช่วยเหลือจากเรา 'มากที่สุด'",
        author: 'จิตวิทยาแนะแนวการศึกษา',
        tip: 'ลองสละเวลาวันละ 3 นาที ทักทายหรือพูดคุยส่วนตัวเรื่องนอกบทเรียนกับนักเรียนกลุ่มเสี่ยง จะช่วยเพิ่มความไว้วางใจและลดสถิติการโดดเรียนได้ถึง 40%',
      },
      {
        quote: 'การศึกษาไม่ใช่การเติมน้ำใส่ถัง แต่คือการจุดประกายไฟแห่งการเรียนรู้',
        author: 'William Butler Yeats',
        tip: 'จัดเวทีสั้นๆ 5 นาทีให้นักเรียนได้เล่าถึงสิ่งที่ตนเองเชี่ยวชาญก่อนเข้าโฮมรูม จะช่วยสร้างความมั่นใจและการแสดงออกเชิงสร้างสรรค์ในชั้นเรียน',
      },
      {
        quote: 'วินัยเชิงบวกช่วยสร้างความนับถือตนเองและการยอมรับในข้อผิดพลาดเพื่อปรับปรุงตัว',
        author: 'ทฤษฎีจิตวิทยาวินัยเชิงบวก',
        tip: 'เมื่อนักเรียนมีพฤติกรรมไม่เหมาะสม ให้เน้นการตักเตือนแบบส่วนตัว หลีกเลี่ยงการตำหนิต่อหน้าเพื่อนร่วมห้อง และมองหาจุดดีเล็กๆ น้อยๆ เพื่อชื่นชมก่อนเริ่มต้นตักเตือน',
      },
    ];
    // Simple rotation based on the day of the month
    const day = new Date().getDate();
    return insights[day % insights.length];
  }, []);

  // ** Recharts Weekly Attendance Data Simulation
  const weeklyAttendanceChartData = useMemo(() => {
    return [
      { name: 'จันทร์', 'อัตรามาเรียน (%)': 96, 'ขาด/สาย (คน)': 1, 'มาเรียน (คน)': 28 },
      { name: 'อังคาร', 'อัตรามาเรียน (%)': 93, 'ขาด/สาย (คน)': 2, 'มาเรียน (คน)': 27 },
      { name: 'พุธ', 'อัตรามาเรียน (%)': 90, 'ขาด/สาย (คน)': 3, 'มาเรียน (คน)': 26 },
      { name: 'พฤหัสบดี', 'อัตรามาเรียน (%)': 96, 'ขาด/สาย (คน)': 1, 'มาเรียน (คน)': 28 },
      { name: 'ศุกร์', 'อัตรามาเรียน (%)': 93, 'ขาด/สาย (คน)': 2, 'มาเรียน (คน)': 27 },
    ];
  }, []);

  // ** Menu Shortcuts — สีอิง theme palette key ตามหมวดหมู่ (60-30-10: accent จำกัด)
  const menuList = useMemo<CardMenuProps[]>(
    () => [
      // --- GROUP: DAILY LOGS → primary ---
      {
        title: 'เช็คชื่อเสาธง',
        subtitle: 'ตอนเช้าหน้าเสาธง',
        color: 'primary',
        icon: <IconifyIcon icon='icon-park-twotone:flag' />,
        navLink: {
          title: 'เช็คชื่อหน้าเสาธง',
          path: '/apps/reports/check-in',
          action: 'read',
          subject: 'check-in-page',
        },
        badge: 'daily',
      },
      {
        title: 'เช็คชื่อกิจกรรม',
        subtitle: 'กิจกรรมพิเศษวิทยาลัย',
        color: 'primary',
        icon: <IconifyIcon icon='pepicons-pop:flag' />,
        navLink: {
          title: 'เช็คชื่อกิจกรรม',
          path: '/apps/reports/activity-check-in',
          action: 'read',
          subject: 'activity-check-in-page',
        },
        badge: 'activity',
      },
      {
        title: 'บันทึกความดีเดี่ยว',
        subtitle: 'นักเรียนรายบุคคล',
        color: 'success',
        icon: <IconifyIcon icon='ic:round-star-outline' />,
        navLink: {
          title: 'บันทึกความดี รายบุคคล',
          action: 'read',
          subject: 'record-goodness-page',
          path: '/apps/record-goodness/individual',
        },
        badge: 'individual',
      },
      {
        title: 'บันทึกความดีกลุ่ม',
        subtitle: 'นักเรียนรายกลุ่ม',
        color: 'success',
        icon: <IconifyIcon icon='ic:round-star-outline' />,
        navLink: {
          title: 'บันทึกความดี รายกลุ่ม',
          action: 'read',
          subject: 'record-goodness-page',
          path: '/apps/record-goodness/group',
        },
        badge: 'group',
      },
      {
        title: 'บันทึกพฤติกรรมเดี่ยว',
        subtitle: 'ไม่เหมาะสมรายบุคคล',
        color: 'error',
        icon: <IconifyIcon icon='heroicons:hand-thumb-down' />,
        navLink: {
          title: 'บันทึกพฤติกรรมไม่เหมาะสม รายบุคคล',
          action: 'read',
          subject: 'record-badness-page',
          path: '/apps/record-badness/individual',
        },
        badge: 'individual',
      },
      {
        title: 'บันทึกพฤติกรรมกลุ่ม',
        subtitle: 'ไม่เหมาะสมรายกลุ่ม',
        color: 'error',
        icon: <IconifyIcon icon='heroicons:hand-thumb-down' />,
        navLink: {
          title: 'บันทึกพฤติกรรมไม่เหมาะสม รายกลุ่ม',
          action: 'read',
          subject: 'record-badness-page',
          path: '/apps/record-badness/group',
        },
        badge: 'group',
      },

      // --- GROUP: REPORTS & STATISTICS → info ---
      {
        title: 'รายงานเช็คเสาธงรายวัน',
        subtitle: 'สรุปการมาแถวรายวัน',
        color: 'info',
        icon: <BsClipboardData />,
        navLink: {
          title: 'รายงานเช็คเสาธงรายวัน',
          path: '/apps/reports/activity-check-in/daily',
          action: 'read',
          subject: 'report-check-in-daily-page',
        },
        badge: 'report',
      },
      {
        title: 'สรุปสถิติหน้าเสาธง',
        subtitle: 'สรุปภาพรวมการมาเรียนเสาธง',
        color: 'info',
        icon: <BsClipboardData />,
        navLink: {
          title: 'รายงานเช็คเสาธงสรุป',
          path: '/apps/reports/check-in/summary',
          action: 'read',
          subject: 'report-check-in-page',
        },
        badge: 'summary',
      },
      {
        title: 'รายงานเช็คกิจกรรมรายวัน',
        subtitle: 'การเข้าร่วมกิจกรรมรายวัน',
        color: 'info',
        icon: <TbChartBar />,
        navLink: {
          title: 'รายงานเช็คกิจกรรมรายวัน',
          path: '/apps/reports/check-in/daily',
          action: 'read',
          subject: 'daily-check-in-report-activity-page',
        },
        badge: 'report',
      },
      {
        title: 'สรุปสถิติกิจกรรมรวม',
        subtitle: 'สรุปอัตราเข้าร่วมกิจกรรมทั้งหมด',
        color: 'info',
        icon: <TbChartBar />,
        navLink: {
          title: 'รายงานเช็คกิจกรรมสรุป',
          path: '/apps/reports/activity-check-in/summary',
          action: 'read',
          subject: 'activity-check-in-page',
        },
        badge: 'summary',
      },
      {
        title: 'รายงานความดีสะสม',
        subtitle: 'รายการบันทึกความดีทั้งหมด',
        color: 'info',
        icon: <HiStar />,
        navLink: {
          title: 'รายงานความดีทั้งหมด',
          action: 'read',
          subject: 'report-goodness-page',
          path: '/apps/reports/goodness/all',
        },
        badge: 'all',
      },
      {
        title: 'รายงานพฤติกรรมไม่เหมาะสม',
        subtitle: 'รายการบันทึกพฤติกรรมลบทั้งหมด',
        color: 'info',
        icon: <HiThumbDown />,
        navLink: {
          title: 'รายงานความไม่ประพฤติทั้งหมด',
          action: 'read',
          subject: 'report-badness-page',
          path: '/apps/reports/badness/all',
        },
        badge: 'all',
      },
      {
        title: 'จัดลำดับคะแนนความดี',
        subtitle: 'ลีดเดอร์บอร์ดคนดีห้องเรียน',
        color: 'info',
        icon: <IconifyIcon icon='game-icons:trophy' />,
        navLink: {
          title: 'ลำดับคะแนนความดี',
          path: '/apps/reports/goodness/summary',
          action: 'read',
          subject: 'student-goodness-summary-report',
        },
        badge: 'rank',
      },
      {
        title: 'จัดลำดับคะแนนความประพฤติ',
        subtitle: 'วิเคราะห์ลำดับคะแนนพฤติกรรมลบ',
        color: 'info',
        icon: <IconifyIcon icon='icon-park-outline:bad-two' />,
        navLink: {
          title: 'ลำดับคะแนนความประพฤติ',
          path: '/apps/reports/badness/summary',
          action: 'read',
          subject: 'student-badness-summary-report',
        },
        badge: 'rank',
      },
      {
        title: 'รายงานสถิติการมาเรียน',
        subtitle: 'วิเคราะห์การขาด ลา สาย',
        color: 'info',
        icon: <HiOutlineClipboardList />,
        navLink: { title: 'สถิติการมาเรียน', path: '/home', action: 'read', subject: 'report-attendance-page' },
        badge: 'analytics',
      },
      {
        title: 'สรุปชั่วโมงเวลาเรียน',
        subtitle: 'สรุปเปอร์เซ็นต์เวลาเรียนเข้าสอบ',
        color: 'info',
        icon: <HiOutlineChartPie />,
        navLink: { title: 'สรุปเวลาเรียน', path: '/home', action: 'read', subject: 'report-summary-time-page' },
        badge: 'summary',
      },
      {
        title: 'สรุปคัดกรอง SDQ / EQ',
        subtitle: 'วิเคราะห์พฤติกรรมและอารมณ์เด็ก',
        color: 'info',
        icon: <MdOutlineTrendingUp />,
        navLink: { title: 'สรุปคัดกรอง SDQ EQ', path: '/home', action: 'read', subject: 'summary-sdq-eq-page' },
        badge: 'screening',
      },
      {
        title: 'สรุปผลบันทึกเยี่ยมบ้าน',
        subtitle: 'สรุปผลและรายงานการเยี่ยมบ้าน',
        color: 'info',
        icon: <MdOutlineHome />,
        navLink: {
          title: 'สรุปบันทึก เยี่ยมบ้านนักเรียน',
          path: '/home',
          action: 'read',
          subject: 'summary-home-visit-page',
        },
        badge: 'visit',
      },
      {
        title: 'รายงานการเข้าใช้ระบบครู',
        subtitle: 'ประวัติการล็อกอินเช็คชื่อ',
        color: 'info',
        icon: <TbReport />,
        navLink: {
          title: 'รายงานการเข้าใช้งาน',
          path: '/apps/reports/access-report',
          action: 'read',
          subject: 'access-report',
        },
        badge: 'access',
      },

      // --- GROUP: ADMIN / MANAGEMENT → secondary ---
      {
        title: 'ข้อมูลนักเรียนทั้งหมด',
        subtitle: 'ค้นหาและดูข้อมูลระเบียนรายคน',
        color: 'secondary',
        icon: <HiOutlineDatabase />,
        navLink: {
          title: 'ข้อมูลนักเรียนทั้งหมด',
          path: '/apps/student/list',
          action: 'read',
          subject: 'student-list-pages',
        },
        badge: 'db',
      },
      {
        title: 'เพิ่ม/แก้ไข ข้อมูลนักเรียน',
        subtitle: 'บันทึกระเบียนนักเรียนเข้าใหม่/ย้ายโอน',
        color: 'secondary',
        icon: <HiOutlineSelector />,
        navLink: {
          title: 'เพิ่ม ลบ แก้ไข ข้อมูลนักเรียน',
          path: '/apps/student/list',
          action: 'read',
          subject: 'student-manage-pages',
        },
        badge: 'action',
      },
      {
        title: 'บุคลากรอาจารย์',
        subtitle: `สืบค้นฐานข้อมูลอาจารย์ ${settings.collegeAcronym}`,
        color: 'secondary',
        icon: <MdManageAccounts />,
        navLink: {
          title: 'จัดการข้อมูลครู/ บุคลากร',
          path: '/apps/teacher/list',
          action: 'read',
          subject: 'teacher-list-pages',
        },
        badge: 'staff',
      },
      {
        title: 'จัดการข้อมูลห้องเรียน',
        subtitle: 'เพิ่ม/แก้ไข/ลบ ห้องเรียนในวิทยาลัย',
        color: 'secondary',
        icon: <MdOutlineClass />,
        navLink: { title: 'จัดการข้อมูลจำนวนห้องเรียน', path: '/home', action: 'read', subject: 'manage-class-page' },
        badge: 'admin',
      },
      {
        title: 'สถิติเสาธงรายวันวิทยาลัย',
        subtitle: 'รายงานกลางเสาธง (ผู้บริหาร/แอดมิน)',
        color: 'secondary',
        icon: <IconifyIcon icon='icon-park-twotone:flag' />,
        navLink: {
          title: 'รายงานเช็คชื่อเสาธงรายวัน',
          path: '/apps/admin/reports/check-in/daily',
          action: 'read',
          subject: 'admin-report-check-in-daily-page',
        },
        badge: 'admin',
      },
      {
        title: 'สถิติเสาธงสัปดาห์วิทยาลัย',
        subtitle: 'รายงานกลางเสาธงรายสัปดาห์',
        color: 'secondary',
        icon: <BsCalendar2Week />,
        navLink: {
          title: 'รายงานเช็คชื่อเสาธงรายสัปดาห์',
          path: '/apps/admin/reports/check-in/weekly',
          action: 'read',
          subject: 'admin-report-check-in-weekly-page',
        },
        badge: 'admin',
      },
      {
        title: 'สถิติเสาธงเดือนวิทยาลัย',
        subtitle: 'รายงานกลางเสาธงรายเดือน',
        color: 'secondary',
        icon: <BsCalendar2Month />,
        navLink: {
          title: 'รายงานเช็คชื่อเสาธงรายเดือน',
          path: '/apps/admin/reports/check-in/monthly',
          action: 'read',
          subject: 'admin-report-check-in-monthly-page',
        },
        badge: 'admin',
      },
      {
        title: 'ตั้งค่าเพิ่ม/ลด คะแนนอัตโนมัติ',
        subtitle: 'กำหนดคะแนนตั้งต้นและการหักแต้มอัตโนมัติ',
        color: 'secondary',
        icon: <MdIso />,
        navLink: {
          title: 'ตั้งค่าเพิ่ม/ลบ คะแนนอัตโนมัติ',
          path: '/home',
          action: 'read',
          subject: 'setting-add-delete-auto-score-page',
        },
        badge: 'setting',
      },
      {
        title: 'ตั้งค่าเกณฑ์ความดีความประพฤติ',
        subtitle: 'กำหนดหมวดหมู่และคะแนนเกณฑ์ความประพฤติ',
        color: 'secondary',
        icon: <HiOutlineLightBulb />,
        navLink: {
          title: 'ตั้งค่าเกณฑ์คะแนน ความดี/พฤติกรรม',
          path: '/home',
          action: 'read',
          subject: 'setting-criteria-score-good-behavior-page',
        },
        badge: 'setting',
      },
      {
        title: 'เปิด-ปิด ประวัติเช็คชื่อย้อนหลัง',
        subtitle: 'กำหนดช่วงเวลาอนุญาตบันทึกเช็คชื่อย้อนหลัง',
        color: 'secondary',
        icon: <MdHistoryToggleOff />,
        navLink: {
          title: 'เปิด-ปิด ระบบ เช็คชื่อย้อนหลัง',
          path: '/home',
          action: 'read',
          subject: 'toggle-checkIn-history-page',
        },
        badge: 'setting',
      },
    ],
    [settings.collegeAcronym],
  );

  // ** Filter menus based on user permission abilities
  const filteredShortcuts = useMemo(() => {
    return menuList.filter((menu): menu is CardMenuProps & { navLink: NavLink & { path: string } } => {
      const navLink = menu.navLink;
      if (!navLink || !navLink.path) return false;
      return ability.can(navLink.action, navLink.subject);
    });
  }, [ability, menuList]);

  // ** Categorized lists for tabs
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

    return {
      all: filteredShortcuts,
      dailyLogs,
      reports,
      settings,
    };
  }, [filteredShortcuts]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setShowAllShortcuts(false);
  };

  const selectedShortcuts =
    activeTab === 0
      ? categorizedShortcuts.all
      : activeTab === 1
        ? categorizedShortcuts.dailyLogs
        : activeTab === 2
          ? categorizedShortcuts.reports
          : categorizedShortcuts.settings;

  const visibleShortcuts = useMemo(() => {
    if (!showAllShortcuts && selectedShortcuts.length > SHORTCUT_PREVIEW_COUNT) {
      return selectedShortcuts.slice(0, SHORTCUT_PREVIEW_COUNT);
    }

    return selectedShortcuts;
  }, [selectedShortcuts, showAllShortcuts]);

  // Custom tool navigation
  const handleShortcutClick = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={6}>
        {/* ==================== ROW 1: WELCOME BANNER ==================== */}
        <Grid size={12}>
          <WelcomeCard>
            <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
              <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <Avatar
                      alt={auth?.user?.account?.firstName || 'Teacher'}
                      src={auth?.user?.account?.avatar || ''}
                      sx={{
                        width: { xs: 56, md: 72 },
                        height: { xs: 56, md: 72 },
                        border: `3px solid ${theme.palette.primary.main}`,
                      }}
                    >
                      {auth?.user?.account?.firstName?.[0] || 'T'}
                    </Avatar>
                    <Box>
                      <Typography
                        component='h1'
                        variant='h4'
                        sx={{
                          fontWeight: 800,
                          mb: 0.5,
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        }}
                      >
                        {greetingText}, ครู{auth?.user?.account?.firstName || 'ผู้ดูแลระบบ'}{' '}
                        {auth?.user?.account?.lastName || ''}
                      </Typography>
                      <Typography
                        variant='subtitle1'
                        sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <IconifyIcon icon='solar:backpack-bold-duotone' />
                        {classroomNames ? (
                          <span>
                            ครูที่ปรึกษาประจำชั้นห้อง <b>{classroomNames}</b>
                            {auth?.user?.teacher?.department?.name ? ` • ${auth?.user?.teacher?.department?.name}` : ''}
                          </span>
                        ) : (
                          <span>
                            {isAdmin
                              ? `ผู้ดูแลระบบ ${settings.collegeAcronym}`
                              : `ครูผู้สอน / บุคลากร${settings.collegeName}`}
                          </span>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.secondary', maxWidth: '600px' }}>
                    แดชบอร์ดสำหรับติดตามการเข้าเรียน ความประพฤติ และการเยี่ยมบ้านของนักเรียนในความดูแล
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <Paper
                      variant='outlined'
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        textAlign: 'right',
                        width: '100%',
                        maxWidth: '280px',
                        backgroundColor: alpha(
                          theme.palette.background.paper,
                          theme.palette.mode === 'dark' ? 0.72 : 0.86,
                        ),
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}
                      >
                        ปีการศึกษา
                      </Typography>
                      <Typography variant='h6' sx={{ fontWeight: 700, mt: 0.5 }}>
                        {apiConfig.educationYears || '—'}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {todayLabel}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </WelcomeCard>
        </Grid>

        {/* ==================== ROW 2: STATS KPI INDICATORS ==================== */}
        {isLoadingTeacherData ||
        isLoadingVisitData ||
        isFetchingVisitData ||
        isLoadingCheckInData ||
        isFetchingCheckInData ? (
          Array.from(new Array(4)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`skeleton-stat-${index}`}>
              <Card sx={{ p: 4 }}>
                <Skeleton variant='circular' width={40} height={40} sx={{ mb: 2 }} />
                <Skeleton variant='text' width='60%' height={24} sx={{ mb: 1 }} />
                <Skeleton variant='text' width='40%' height={32} />
              </Card>
            </Grid>
          ))
        ) : (
          <>
            {/* Card 1: Student Count */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        นักเรียนทั้งหมดในความดูแล
                      </Typography>
                      <Typography variant='h4' sx={{ fontWeight: 800, mt: 1 }}>
                        {dashboardStats.totalCount} คน
                      </Typography>
                    </Box>
                    <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                      <HiOutlineDatabase style={{ fontSize: '1.4rem' }} />
                    </CustomAvatar>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      ชาย {dashboardStats.maleCount} คน | หญิง {dashboardStats.femaleCount} คน
                    </Typography>
                    <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      ปกติ {dashboardStats.normalCount} | ฝึกงาน {dashboardStats.internCount}
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Card 2: Today's Attendance */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        อัตราการเข้าเรียนวันนี้
                      </Typography>
                      <Typography variant='h4' sx={{ fontWeight: 800, mt: 1 }}>
                        {dashboardStats.attendance.attendanceRate}%
                      </Typography>
                    </Box>
                    <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                      <HiOutlineFlag style={{ fontSize: '1.4rem' }} />
                    </CustomAvatar>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                    <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600 }}>
                      มา {dashboardStats.attendance.present}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'warning.main' }}>
                      สาย {dashboardStats.attendance.late}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'info.main' }}>
                      ลา {dashboardStats.attendance.leave}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600 }}>
                      ขาด {dashboardStats.attendance.absent}
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Card 3: Goodness Score */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        คะแนนความดีสะสมรวม
                      </Typography>
                      <Typography variant='h4' sx={{ fontWeight: 800, mt: 1 }}>
                        {dashboardStats.behavior.totalGoodnessScore} แต้ม
                      </Typography>
                    </Box>
                    <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                      <IconifyIcon icon='solar:star-bold-duotone' style={{ fontSize: '1.4rem' }} />
                    </CustomAvatar>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant='caption' sx={{ color: 'success.main' }}>
                      ทำความดี {dashboardStats.behavior.goodnessTotalCount} ครั้ง
                    </Typography>
                    <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
                    <Typography variant='caption' sx={{ color: 'error.main' }}>
                      ทำผิดกฎ {dashboardStats.behavior.badnessTotalCount} ครั้ง
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Card 4: Home Visits Progress */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant='subtitle2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        ความคืบหน้าการเยี่ยมบ้าน
                      </Typography>
                      <Typography variant='h4' sx={{ fontWeight: 800, mt: 1 }}>
                        {dashboardStats.tasks.visitProgress}%
                      </Typography>
                    </Box>
                    <CustomAvatar skin='light' color='primary' sx={{ width: 44, height: 44 }}>
                      <MdOutlineHome style={{ fontSize: '1.4rem' }} />
                    </CustomAvatar>
                  </Box>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <LinearProgress
                      variant='determinate'
                      value={dashboardStats.tasks.visitProgress}
                      color='primary'
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    เยี่ยมแล้ว {dashboardStats.tasks.visitedCount} จาก {dashboardStats.tasks.taskPopulationCount} คน{' '}
                    (คัดกรอง SDQ {dashboardStats.tasks.sdqProgress}%)
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </>
        )}

        {/* ==================== ROW 3: RECHARTS & QUICK ACTIONS ==================== */}
        {/* Attendance trend chart (Left, 8 Cols on Large Screens) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <SurfaceCard sx={{ height: '100%', minHeight: '380px' }}>
            <CardHeader
              title={
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  สถิติและแนวโน้มการเข้าเรียน
                </Typography>
              }
              action={
                <Button
                  size='small'
                  variant='outlined'
                  onClick={() => router.push('/apps/reports/check-in/summary')}
                  endIcon={<MdChevronRight />}
                >
                  รายงานทั้งหมด
                </Button>
              }
            />
            <CardContent sx={{ pb: 6 }}>
              {isMounted ? (
                <Box sx={{ width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width='100%' height={280} minWidth={0}>
                    <AreaChart data={weeklyAttendanceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
                      <XAxis dataKey='name' stroke={theme.palette.text.secondary} fontSize={12} />
                      <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} fontSize={12} tickCount={6} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary,
                          borderRadius: 12,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Area
                        type='monotone'
                        dataKey='อัตรามาเรียน (%)'
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        fill={theme.palette.primary.main}
                        fillOpacity={0.08}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 280,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}
            </CardContent>
          </SurfaceCard>
        </Grid>

        {/* Quick Menu Panel (Right, 4 Cols on Large Screens) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SurfaceCard sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  กล่องเครื่องมือครู
                </Typography>
              }
              subheader={`${filteredShortcuts.length} ฟังก์ชันที่เปิดใช้งานตามระดับสิทธิ์ของคุณ`}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant='scrollable'
                  scrollButtons='auto'
                  aria-label='หมวดหมู่เครื่องมือครู'
                  sx={{ minHeight: 38 }}
                >
                  <Tab label='ทั้งหมด' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
                  <Tab label='บันทึกรายวัน' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
                  <Tab label='รายงาน' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
                  <Tab label='จัดการระบบ' sx={{ minHeight: 38, py: 1, fontSize: '0.8rem' }} />
                </Tabs>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gridAutoRows: '1fr',
                  gap: 2,
                }}
              >
                {visibleShortcuts.map((item) => {
                  const paletteKey = (item.color as ThemeColor) || 'primary';
                  const accentColor = theme.palette[paletteKey]?.main ?? theme.palette.primary.main;

                  return (
                    <Box
                      key={`${item.navLink.subject ?? 'shortcut'}:${item.title}`}
                      sx={{ display: 'flex', minWidth: 0 }}
                    >
                      <CanViewNavLink navLink={item.navLink}>
                        <QuickActionButton
                          type='button'
                          aria-label={`${item.title}: ${item.subtitle}`}
                          onClick={() => handleShortcutClick(item.navLink.path)}
                        >
                          <Avatar
                            sx={{
                              backgroundColor: alpha(accentColor, 0.12),
                              color: accentColor,
                              width: 34,
                              height: 34,
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant='subtitle2'
                              sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary', lineHeight: 1.3 }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem', lineHeight: 1.3 }}
                            >
                              {item.subtitle}
                            </Typography>
                          </Box>
                        </QuickActionButton>
                      </CanViewNavLink>
                    </Box>
                  );
                })}
              </Box>

              {/* Show All / Show Less button */}
              {selectedShortcuts.length > SHORTCUT_PREVIEW_COUNT && (
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    size='small'
                    variant='text'
                    onClick={() => setShowAllShortcuts(!showAllShortcuts)}
                    endIcon={<IconifyIcon icon={showAllShortcuts ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
                  >
                    {showAllShortcuts ? 'แสดงเมนูลัดย่อลง' : 'แสดงเครื่องมือทั้งหมด'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </SurfaceCard>
        </Grid>

        {/* ==================== ROW 4: STUDENT FOCUS & PEDAGOGY INSIGHTS ==================== */}
        {/* Student Focus & Risk alert List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  ระบบดูแลช่วยเหลือนักเรียน
                </Typography>
              }
              subheader='แจ้งเตือนนักเรียนกลุ่มเสี่ยง และเชิดชูนักเรียนผลงานยอดเยี่ยมประจำห้องเรียน'
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 700, color: 'error.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <IconifyIcon icon='solar:bell-bing-bold-duotone' />
                นักเรียนกลุ่มเสี่ยงที่ต้องติดตามดูแลอย่างใกล้ชิด ({studentAlerts.alerts.length} คน)
              </Typography>

              {studentAlerts.alerts.length === 0 ? (
                <Paper
                  variant='outlined'
                  sx={{
                    p: 6,
                    mb: 3,
                    textAlign: 'center',
                    borderColor: 'success.light',
                    backgroundColor: alpha(theme.palette.success.main, 0.02),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='subtitle1'
                    sx={{
                      color: 'success.main',
                      fontWeight: 600,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <IconifyIcon icon='solar:check-circle-bold-duotone' style={{ fontSize: '1.5rem' }} />
                    ชั้นเรียนมีความประพฤติดีเยี่ยม!
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    ไม่พบนักเรียนกลุ่มเสี่ยงที่มีคะแนนความประพฤติต่ำกว่าเกณฑ์ในขณะนี้
                  </Typography>
                </Paper>
              ) : (
                studentAlerts.alerts.map((student: any) => (
                  <Paper
                    key={student.id}
                    variant='outlined'
                    sx={{
                      p: 3,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: 'error.light',
                      backgroundColor: alpha(theme.palette.error.main, 0.01),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <RiskAvatar>
                        {student.name.substring(student.name.indexOf(' ') + 1, student.name.indexOf(' ') + 3)}
                      </RiskAvatar>
                      <Box>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                          {student.name}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          รหัสนักเรียน {student.studentId}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant='caption'
                        sx={{ color: 'error.main', fontWeight: 600, display: 'block', mb: 1 }}
                      >
                        {student.reason}
                      </Typography>
                      <Button
                        size='small'
                        variant='outlined'
                        color='error'
                        onClick={() => router.push(`/apps/student/list?q=${student.studentId}`)}
                        sx={{ py: 0.5, px: 2, fontSize: '0.75rem', borderRadius: 4 }}
                      >
                        ช่วยประสาน
                      </Button>
                    </Box>
                  </Paper>
                ))
              )}

              <Divider sx={{ my: 4 }} />

              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 700, color: 'success.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <IconifyIcon icon='solar:cup-bold-duotone' />
                ดาวเด่นความประพฤติยอดเยี่ยมประจำห้องเรียน
              </Typography>

              {studentAlerts.outstanding.length === 0 ? (
                <Paper
                  variant='outlined'
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderColor: 'warning.light',
                    backgroundColor: alpha(theme.palette.warning.main, 0.02),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='subtitle1'
                    sx={{
                      color: 'warning.main',
                      fontWeight: 600,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <IconifyIcon icon='solar:cup-bold-duotone' style={{ fontSize: '1.5rem' }} />
                    ห้องเรียนนี้ยังไม่มีการสะสมคะแนนความดี
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    เนื่องจากนักเรียนทุกคนในความดูแลเริ่มสะสมความดีด้วยคะแนนมาตรฐาน 100 คะแนน
                    และยังไม่มีบันทึกข้อมูลความดีเพิ่มเติมในภาคเรียนนี้
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {studentAlerts.outstanding.map((student: any, idx: number) => (
                    <Grid size={12} key={student.id}>
                      <Paper
                        variant='outlined'
                        sx={{
                          p: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderColor: 'warning.light',
                          backgroundColor: alpha(theme.palette.warning.main, 0.01),
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <StarAvatar>{idx + 1}</StarAvatar>
                          <Box>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                              รหัส {student.studentId}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant='subtitle2' sx={{ color: 'warning.main', fontWeight: 700 }}>
                            +{student.goodnessScore} แต้ม ({student.goodnessCount} ครั้ง)
                          </Typography>
                          <Button
                            size='small'
                            variant='text'
                            color='warning'
                            onClick={() => router.push(`/apps/student/list?q=${student.studentId}`)}
                            sx={{ py: 0.5, px: 2, fontSize: '0.75rem' }}
                          >
                            ดูความดี
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </SurfaceCard>
        </Grid>

        {/* Pedagogical Tips & Motivational Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  มุมคิดช่วยครู พัฒนาการศึกษา
                </Typography>
              }
              subheader='จิตวิทยาเด็กและเทคนิคการจัดการชั้นเรียนประจำวันเพื่ออนาคตที่ดีกว่า'
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.1)}`,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <Typography variant='h6' sx={{ color: 'primary.main', mb: 2, fontWeight: 700 }}>
                  เกร็ดคิดแนะแนววันนี้
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    fontStyle: 'italic',
                    mb: 2,
                    color: 'text.primary',
                    fontWeight: 500,
                    pl: 3,
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  }}
                >
                  "{educationalInsight.quote}"
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ display: 'block', textAlign: 'right', color: 'text.secondary', fontWeight: 600, mb: 3 }}
                >
                  — {educationalInsight.author}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  แนะนำเทคนิคสำหรับครู:
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {educationalInsight.tip}
                </Typography>
              </Paper>

              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 700, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <IconifyIcon icon='solar:list-check-bold-duotone' />
                ภารกิจงานที่ปรึกษาที่ต้องติดตามดำเนินการ
              </Typography>

              <Grid container spacing={3}>
                <Grid size={6}>
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.25s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}
                      >
                        การประเมินคัดกรอง SDQ
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                        {dashboardStats.tasks.sdqCount} / {dashboardStats.totalCount} คน
                      </Typography>
                      {dashboardStats.totalCount - dashboardStats.tasks.sdqCount > 0 ? (
                        <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600, display: 'block' }}>
                          ค้างคัดกรองอีก {dashboardStats.totalCount - dashboardStats.tasks.sdqCount} คน
                        </Typography>
                      ) : (
                        <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600, display: 'block' }}>
                          คัดกรองครบ 100% แล้ว
                        </Typography>
                      )}
                    </Box>
                    <Button
                      size='small'
                      variant={dashboardStats.totalCount - dashboardStats.tasks.sdqCount > 0 ? 'contained' : 'outlined'}
                      color='primary'
                      sx={{ mt: 3, borderRadius: 2 }}
                      onClick={() => router.push('/apps/visit/sdq')}
                    >
                      {dashboardStats.totalCount - dashboardStats.tasks.sdqCount > 0
                        ? 'เริ่มประเมินคัดกรอง'
                        : 'ดูผลการประเมิน'}
                    </Button>
                  </Paper>
                </Grid>

                <Grid size={6}>
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.25s',
                      '&:hover': { borderColor: 'info.main' },
                    }}
                  >
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}
                      >
                        เยี่ยมบ้านนักเรียน
                      </Typography>
                      <Typography variant='h5' sx={{ fontWeight: 800, color: 'info.main', mb: 1 }}>
                        {dashboardStats.tasks.visitedCount} / {dashboardStats.totalCount} คน
                      </Typography>
                      {dashboardStats.totalCount - dashboardStats.tasks.visitedCount > 0 ? (
                        <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600, display: 'block' }}>
                          ค้างเยี่ยมบ้านอีก {dashboardStats.totalCount - dashboardStats.tasks.visitedCount} คน
                        </Typography>
                      ) : (
                        <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600, display: 'block' }}>
                          เยี่ยมบ้านครบ 100% แล้ว
                        </Typography>
                      )}
                    </Box>
                    <Button
                      size='small'
                      variant={
                        dashboardStats.totalCount - dashboardStats.tasks.visitedCount > 0 ? 'contained' : 'outlined'
                      }
                      color='info'
                      sx={{ mt: 3, borderRadius: 2 }}
                      onClick={() => router.push('/apps/visit/list')}
                    >
                      {dashboardStats.totalCount - dashboardStats.tasks.visitedCount > 0
                        ? 'เริ่มบันทึกเยี่ยมบ้าน'
                        : 'ดูประวัติเยี่ยมบ้าน'}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </SurfaceCard>
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
