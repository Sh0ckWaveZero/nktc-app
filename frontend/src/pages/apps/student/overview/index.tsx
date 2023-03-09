import React, { Fragment, useContext, useEffect, useState } from 'react';

import { AbilityContext } from '@/layouts/components/acl/Can';
import CardAward from '@/views/apps/student/view/CardAward';
import CardMenu from '@/@core/components/card-statistics/card-menu';
import { CardMenuProps } from '@/@core/components/card-statistics/types';
import Confetti from 'react-confetti';
import { Grid } from '@mui/material';
import Icon from '@/@core/components/icon';
import { LocalStorageService } from '@/services/localStorageService';
import UserViewLeft from '@/views/apps/student/view/UserViewLeft';
import { shallow } from 'zustand/shallow';
import { useAuth } from '@/hooks/useAuth';
import useGetImage from '@/hooks/useGetImage';
import { useStudentStore } from '@/store/index';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useSpring, animated } from 'react-spring';

const localStorage = new LocalStorageService();
const accessToken = localStorage.getToken()!;

const ConfettiAnimation = ({ width, height }: any) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const props = useSpring({
    opacity: showConfetti ? 1 : 0,
    config: { duration: 500 },
  });

  useEffect(() => {
    const hideConfetti = setTimeout(() => {
      setShowConfetti(false);
    }, 10000);
    return () => {
      clearTimeout(hideConfetti);
    };
  }, []);

  return (
    <animated.div style={props}>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          tweenDuration={300}
          style={{
            zIndex: 1501,
          }}
        />
      )}
    </animated.div>
  );
};

const StudentOverview = (props: any) => {
  // ** Hook
  const { user }: any = useAuth();
  const { width, height } = useWindowSize();
  const confettiWidth = Math.floor(width * 0.9);
  const confettiHeight = Math.floor(height * 0.9);

  const ability = useContext(AbilityContext);
  const filterAbility = (menu: CardMenuProps) => {
    return ability.can(menu?.navLink?.action, menu?.navLink?.subject);
  };

  const { getTrophyOverview, getTeacherClassroom }: any = useStudentStore(
    (state) => ({
      getTrophyOverview: state.getTrophyOverview,
      getTeacherClassroom: state.getTeacherClassroom,
    }),
    shallow,
  );

  const [trophyOverview, setTrophyOverview] = useState<any>(null);

  const [teacherClassroom, setTeacherClassroom] = useState<any>([]);
  const fullName = user?.account?.title + '' + user?.account?.firstName + ' ' + user?.account?.lastName;
  const classroomName = user?.student?.classroom?.name;

  const { isLoading, image } = useGetImage(user?.account?.avatar as string, accessToken as string);

  const getTrophyOverviewData = async () => {
    const data = await getTrophyOverview(accessToken, user?.student?.id);
    setTrophyOverview(data);
  };

  const getTeacherClassroomData = async () => {
    const data = await getTeacherClassroom(accessToken, user?.student?.classroom?.id);
    setTeacherClassroom(data);
  };

  useEffect(() => {
    getTrophyOverviewData();
    getTeacherClassroomData();

    return () => {
      setTrophyOverview(null);
      setTeacherClassroom([]);
    };
  }, []);

  const menuList: CardMenuProps[] = [
    {
      title: 'รายงานการเช็คชื่อ',
      subtitle: 'หน้าเสาธง',
      color: '#706161',
      icon: <Icon icon='healthicons:i-schedule-school-date-time' />,
      navLink: {
        title: 'รายงานการเช็คชื่อ เช้า-เย็น',
        path: '/apps/reports/student/check-in-report',
        action: 'read',
        subject: 'student-check-in-report',
      },
    },
    {
      title: 'Report',
      subtitle: 'ความประพฤติ',
      color: '#FF9D7E',
      icon: <Icon icon='fluent:people-error-24-regular' />,
      navLink: {
        title: 'Report ความประพฤติ',
        path: '/apps/reports/student/badness-report',
        action: 'read',
        subject: 'student-badness-report',
      },
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'คะแนนความดี',
      color: '#FFD700',
      icon: <Icon icon='game-icons:trophy' />,
      navLink: {
        title: 'เรียงลำดับ คะแนนความดี',
        path: '/apps/reports/student/goodness-report',
        action: 'read',
        subject: 'student-goodness-report',
      },
    },
    {
      title: 'ประกาศ',
      subtitle: 'ผลการเรียน',
      color: '#23954f',
      icon: <Icon icon='ic:round-add-chart' />,
      navLink: {
        title: 'ประกาศ ผลการเรียน',
        path: 'https://student.vec.go.th/web/Login.htm?mode=indexStudent',
        action: 'read',
        subject: 'student-academic-performance-report',
      },
    },
    {
      title: 'เปลี่ยน',
      subtitle: 'รหัสผ่าน 🔑',
      color: '#9a17dc',
      icon: <Icon icon='mdi:password-check-outline' />,
      navLink: {
        title: 'เปลี่ยนรหัสผ่าน',
        path: 'https://student.vec.go.th/web/Login.htm?mode=indexStudent',
        action: 'read',
        subject: 'student-change-password',
      },
    },
  ];

  return (
    <Fragment>
      {trophyOverview?.totalTrophy >= 1 && <ConfettiAnimation width={confettiWidth} height={confettiHeight} />}
      <Grid container spacing={6}>
        <Grid item xs={12} md={5} lg={4}>
          <UserViewLeft
            classroomName={classroomName}
            fullName={fullName}
            image={image}
            isLoading={isLoading}
            teacherClassroom={teacherClassroom}
            trophyOverview={trophyOverview}
            user={user}
          />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <Grid container spacing={6}>
            {trophyOverview?.totalTrophy >= 1 && (
              <Grid item xs={12}>
                <CardAward trophyOverview={trophyOverview} fullName={fullName} />
              </Grid>
            )}
            {menuList
              .filter((menu: CardMenuProps) => filterAbility(menu))
              .map((item, index) => (
                <Grid item key={`grid-item-${index}`} xs={12} sm={6} md={4} sx={{ order: index }}>
                  <CardMenu
                    key={`card-menu-${index}`}
                    title={item.title}
                    subtitle={item.subtitle}
                    color={item.color}
                    icon={item.icon}
                    navLink={item.navLink}
                  />
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  );
};

StudentOverview.acl = {
  action: 'read',
  subject: 'student-overview-page',
};

export default StudentOverview;
