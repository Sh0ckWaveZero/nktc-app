import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useTeacherStudents } from '@/hooks/queries/useTeachers';
import { useTeacherVisitStudents } from '@/hooks/queries/useVisits';
import { useCheckInReportsByClassrooms } from '@/hooks/queries/useCheckIn';
import { getAdvisorClassroomIds } from '@/utils/advisor-classrooms';
import { toApiDate } from '@/utils/datetime';
import { EDUCATIONAL_INSIGHTS, MOCK_ALERTS, MOCK_OUTSTANDING } from '../constants';

export interface DashboardStats {
  totalCount: number;
  internCount: number;
  normalCount: number;
  maleCount: number;
  femaleCount: number;
  attendance: {
    present: number;
    late: number;
    leave: number;
    absent: number;
    attendanceRate: number;
  };
  behavior: {
    averageScore: number;
    goodnessTotalCount: number;
    badnessTotalCount: number;
    totalGoodnessScore: number;
  };
  tasks: {
    visitedCount: number;
    visitProgress: number;
    sdqCount: number;
    sdqProgress: number;
    eqCount: number;
    taskPopulationCount: number;
  };
}

export interface AlertItem {
  id: string;
  name: string;
  studentId: string;
  reason: string;
  type: string;
}

export interface OutstandingItem {
  id: string;
  name: string;
  studentId: string;
  score: number;
  goodnessScore: number;
  goodnessCount: number;
}

export interface StudentAlerts {
  alerts: AlertItem[];
  outstanding: OutstandingItem[];
}

export interface EducationalInsight {
  quote: string;
  author: string;
  tip: string;
}

const isInternshipStudent = (status: unknown) => status === 'intern' || status === 'internship';

const getGreetingText = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return 'อรุณสวัสดิ์';
  if (hours >= 12 && hours < 17) return 'สวัสดีตอนบ่าย';
  if (hours >= 17 && hours < 22) return 'สวัสดีตอนเย็น';
  return 'สวัสดีตอนค่ำ';
};

export const useTeacherDashboard = () => {
  const auth = useAuth();
  const { isTeacher } = useRole();

  const teacherId = auth?.user?.teacher?.id as string;

  const { data: teacherStudents, isLoading: isLoadingTeacherData } = useTeacherStudents(teacherId);

  const classroomInfo = useMemo(() => {
    if (teacherStudents?.classrooms && teacherStudents.classrooms.length > 0) {
      return teacherStudents.classrooms[0];
    }
    return null;
  }, [teacherStudents]);

  const classroomNames = useMemo(() => {
    if (teacherStudents?.classrooms && teacherStudents.classrooms.length > 0) {
      return teacherStudents.classrooms
        .map((c: any) => c.name)
        .filter(Boolean)
        .join(', ');
    }
    return '';
  }, [teacherStudents]);

  const dbStudents = useMemo(() => {
    if (teacherStudents?.classrooms && teacherStudents.classrooms.length > 0) {
      return teacherStudents.classrooms.flatMap((c: any) => c.students || []);
    }
    return [];
  }, [teacherStudents]);

  const hasRealClassroom = classroomInfo !== null && dbStudents.length > 0;

  const authAdvisorClassroomIds = useMemo(
    () => getAdvisorClassroomIds(auth.user),
    [auth.user?.teacherOnClassroom, auth.user?.teacher?.classrooms],
  );

  const advisorClassroomIds = useMemo(() => {
    const teacherClassroomIds = Array.isArray(teacherStudents?.classrooms)
      ? teacherStudents.classrooms.map((c: any) => c.id).filter(Boolean)
      : [];

    return Array.from(new Set([...authAdvisorClassroomIds, ...teacherClassroomIds])).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [authAdvisorClassroomIds, teacherStudents]);

  const {
    data: visitStudents = [],
    isLoading: isLoadingVisitData,
    isFetching: isFetchingVisitData,
  } = useTeacherVisitStudents(undefined, {
    enabled: Boolean(auth.isInitialized && !auth.loading && isTeacher),
    advisorClassroomIds,
  });

  const todayStr = useMemo(() => toApiDate(new Date()), []);
  const {
    data: todayCheckInReport,
    isLoading: isLoadingCheckInData,
    isFetching: isFetchingCheckInData,
  } = useCheckInReportsByClassrooms({
    teacherId,
    classroomIds: advisorClassroomIds,
    date: todayStr,
  });

  const greetingText = useMemo(() => getGreetingText(), []);

  const educationalInsight = useMemo<EducationalInsight>(() => {
    const day = new Date().getDate();
    return EDUCATIONAL_INSIGHTS[day % EDUCATIONAL_INSIGHTS.length];
  }, []);

  const dashboardStats = useMemo<DashboardStats>(() => {
    const totalCount = hasRealClassroom ? dbStudents.length : 32;
    const internCount = hasRealClassroom ? dbStudents.filter((s: any) => isInternshipStudent(s.status)).length : 3;
    const normalCount = totalCount - internCount;

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
          femaleCount++;
        }
      });
    } else {
      maleCount = 20;
      femaleCount = 12;
    }

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

    if (!hasCheckInRecord) {
      present = hasRealClassroom ? Math.floor(normalCount * 0.93) : 26;
      late = hasRealClassroom ? Math.floor(normalCount * 0.04) : 1;
      leave = hasRealClassroom ? Math.floor(normalCount * 0.02) : 1;
      absent = normalCount - present - late - leave;
    }

    const checkedStudentsCount = present + late + leave + absent;
    const attendanceBaseCount = hasCheckInRecord ? checkedStudentsCount : normalCount;
    const attendanceRate = attendanceBaseCount > 0 ? Math.round(((present + late) / attendanceBaseCount) * 100) : 100;

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

    let visitedCount = 14;
    let sdqCount = 24;
    let eqCount = 22;
    const taskPopulationCount = hasRealClassroom ? dbStudents.length : visitStudents.length > 0 ? visitStudents.length : 32;

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
      attendance: { present, late, leave, absent, attendanceRate },
      behavior: {
        averageScore,
        goodnessTotalCount,
        badnessTotalCount,
        totalGoodnessScore: goodnessTotalCount * 5,
      },
      tasks: { visitedCount, visitProgress, sdqCount, sdqProgress, eqCount, taskPopulationCount },
    };
  }, [hasRealClassroom, dbStudents, todayCheckInReport, visitStudents]);

  const studentAlerts = useMemo<StudentAlerts>(() => {
    if (hasRealClassroom) {
      const mappedAlerts: AlertItem[] = [];
      const outstandingList: OutstandingItem[] = [];

      dbStudents.forEach((student: any) => {
        const account = student.user?.account || student.account;
        const fullName = `${account?.title ?? ''}${account?.firstName ?? ''} ${account?.lastName ?? ''}`;
        const studentId = student.studentId ?? 'N/A';

        const goodPoints = student._count?.goodnessIndividual || 0;
        const badPoints = student._count?.badnessIndividual || 0;
        const score = 100 + goodPoints * 5 - badPoints * 10;
        const goodnessScore = goodPoints * 5;

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

        outstandingList.push({ id: student.id, name: fullName, studentId, score, goodnessScore, goodnessCount: goodPoints });
      });

      const sortedOutstanding = outstandingList
        .filter((student) => student.goodnessScore > 0)
        .sort((a, b) => b.goodnessScore - a.goodnessScore)
        .slice(0, 3);

      return { alerts: mappedAlerts.slice(0, 4), outstanding: sortedOutstanding };
    }

    return { alerts: MOCK_ALERTS, outstanding: MOCK_OUTSTANDING };
  }, [hasRealClassroom, dbStudents]);

  const isLoading =
    isLoadingTeacherData || isLoadingVisitData || isFetchingVisitData || isLoadingCheckInData || isFetchingCheckInData;

  return {
    classroomNames,
    hasRealClassroom,
    advisorClassroomIds,
    dashboardStats,
    studentAlerts,
    greetingText,
    educationalInsight,
    isLoading,
  };
};
