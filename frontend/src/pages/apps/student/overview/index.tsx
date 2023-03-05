import CardMenu from '@/@core/components/card-statistics/card-menu';
import { CardMenuProps } from '@/@core/components/card-statistics/types';
import Icon from '@/@core/components/icon';
import { AbilityContext } from '@/layouts/components/acl/Can';
import CardAward from '@/views/apps/student/view/CardAward';
import UsersProjectListTable from '@/views/apps/student/view/UsersProjectListTable';
import UserViewLeft from '@/views/apps/student/view/UserViewLeft';
import { Grid } from '@mui/material';
import * as React from 'react';
import { BsCalendar2Date } from 'react-icons/bs';
import { HiOutlineFlag } from 'react-icons/hi';
import { TbReport } from 'react-icons/tb';

export interface IStudentOverviewProps {}

const StudentOverview = (props: IStudentOverviewProps) => {
  // ** Hook
  const ability = React.useContext(AbilityContext);
  const filterAbility = (menu: CardMenuProps) => {
    return ability.can(menu?.navLink?.action, menu?.navLink?.subject);
  };

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
  ];

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        <UserViewLeft />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        {/* <CardAward/> */}
        {/* <UserViewRight tab={tab} invoiceData={invoiceData} /> */}

        <Grid container spacing={6}>
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
  );
};

StudentOverview.acl = {
  action: 'read',
  subject: 'student-overview-page',
};

export default StudentOverview;
