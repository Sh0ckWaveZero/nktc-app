// ** MUI Imports
import { Grid } from '@mui/material';

// ** Custom Components Imports
import CardMenu from '@/@core/components/card-statistics/card-menu';

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
  MdOutlineSentimentDissatisfied,
  MdOutlineSort,
  MdOutlineTrendingUp,
  MdOutlineTungsten,
  MdTagFaces,
} from 'react-icons/md';
import { CardMenuProps } from '@/@core/components/card-statistics/types';
import { AbilityContext } from '@/layouts/components/acl/Can';
import { useContext } from 'react';
import { BsCalendar2Date, BsCalendar2Month, BsCalendar2Week, BsClipboardData } from 'react-icons/bs';
import { TbChartBar, TbReport } from 'react-icons/tb';
import IconifyIcon from '@/@core/components/icon';

const Home = () => {
  // ** Hook
  const ability = useContext(AbilityContext);

  const menuList: CardMenuProps[] = [
    {
      title: 'รายงานการเข้าใช้งาน',
      subtitle: 'ของครู/อาจารย์',
      color: '#FF8787',
      icon: <TbReport />,
      navLink: {
        title: 'รายงานการเข้าใช้งาน',
        path: '/apps/reports/access-report',
        action: 'read',
        subject: 'access-report',
      },
    },
    {
      title: 'เช็คชื่อ',
      subtitle: 'ตอนเช้า/หน้าเสาธง',
      color: '#FF9D7E',
      icon: <IconifyIcon icon='icon-park-twotone:flag' />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/apps/reports/check-in',
        action: 'read',
        subject: 'check-in-page',
      },
    },
    {
      title: 'เช็คชื่อ',
      subtitle: 'กิจกรรม',
      color: '#d7c842',
      icon: <IconifyIcon icon='pepicons-pop:flag' />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/apps/reports/activity-check-in',
        action: 'read',
        subject: 'activity-check-in-page',
      },
    },
    {
      title: 'บันทึกความดี',
      subtitle: 'รายบุคคล',
      color: '#d7c842',
      icon: <IconifyIcon icon='ic:round-star-outline' />,
      navLink: {
        title: 'บันทึกความดี รายบุคคล',
        icon: 'heroicons:inbox',
        action: 'read',
        subject: 'record-goodness-page',
        path: '/apps/record-goodness/individual',
      },
      badge: 'icon-park-outline:people',
    },
    {
      title: 'บันทึกความดี',
      subtitle: 'รายกลุ่ม',
      color: '#d7c842',
      icon: <IconifyIcon icon='ic:round-star-outline' />,
      navLink: {
        title: 'บันทึกความดี รายกลุ่ม',
        icon: 'heroicons:inbox-stack',
        action: 'read',
        subject: 'record-goodness-page',
        path: '/apps/record-goodness/group',
      },
      badge: 'ri:group-line',
    },
    {
      title: 'บันทึกพฤติกรรม',
      subtitle: 'ไม่เหมาะสม รายบุคคล',
      color: '#d7c842',
      icon: <IconifyIcon icon='heroicons:hand-thumb-down' />,
      navLink: {
        title: 'บันทึกพฤติกรรมที่ไม่เหมาะสม รายบุคคล',
        icon: 'heroicons:inbox',
        action: 'read',
        subject: 'record-badness-page',
        path: '/apps/record-badness/individual',
      },
      badge: 'icon-park-outline:people',
    },
    {
      title: 'บันทึกพฤติกรรม',
      subtitle: 'ไม่เหมาะสม รายกลุ่ม',
      color: '#d7c842',
      icon: <IconifyIcon icon='heroicons:hand-thumb-down' />,
      navLink: {
        title: 'บันทึกพฤติกรรมที่ไม่เหมาะสม รายกลุ่ม',
        icon: 'heroicons:inbox',
        action: 'read',
        subject: 'record-badness-page',
        path: '/apps/record-badness/individual',
      },
      badge: 'ri:group-line',
    },
    {
      title: 'Report',
      subtitle: 'เช็คชื่อหน้าเสาธง',
      color: '#82ad09',
      icon: <BsClipboardData />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/apps/reports/check-in/daily',
        action: 'read',
        subject: 'report-check-in-daily-page',
      },
      badge: 'bi:calendar2-date',
    },
    {
      title: 'Report',
      subtitle: 'เช็คชื่อหน้าเสาธง',
      color: '#82ad09',
      icon: <BsClipboardData />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/apps/reports/check-in/summary',
        action: 'read',
        subject: 'report-check-in-page',
      },
      badge: 'tabler:sum',
    },
    {
      title: 'Report',
      subtitle: 'เช็คชื่อกิจกรรม',
      color: '#82ad09',
      icon: <TbChartBar />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/apps/reports/activity-check-in/daily',
        action: 'read',
        subject: 'activity-check-in-page',
      },
      badge: 'bi:calendar2-date',
    },
    {
      title: 'Report',
      subtitle: 'เช็คชื่อกิจกรรม',
      color: '#82ad09',
      icon: <TbChartBar />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/apps/reports/activity-check-in/summary',
        action: 'read',
        subject: 'activity-check-in-page',
      },
      badge: 'tabler:sum',
    },
    {
      title: 'Report',
      subtitle: 'ความดี',
      color: '#82ad09',
      icon: <HiStar />,
      navLink: {
        title: 'ทั้งหมด',
        icon: 'heroicons:inbox-stack',
        action: 'read',
        subject: 'report-goodness-page',
        path: '/apps/reports/goodness/all',
      },
    },
    {
      title: 'Report',
      subtitle: 'พฤติกรรมไม่เหมาะสม',
      color: '#82ad09',
      icon: <HiThumbDown />,
      navLink: {
        title: 'ทั้งหมด',
        icon: 'heroicons:inbox-stack',
        action: 'read',
        subject: 'report-badness-page',
        path: '/apps/reports/badness/all',
      },
    },
    {
      title: 'Report',
      subtitle: 'ลำดับความดี',
      color: '#82ad09',
      icon: <IconifyIcon icon='game-icons:trophy' />,
      navLink: {
        title: 'ลำดับคะแนนความดี',
        icon: 'game-icons:trophy',
        path: '/apps/reports/goodness/summary',
        action: 'read',
        subject: 'student-goodness-summary-report',
      },
    },
    {
      title: 'Report',
      subtitle: 'ลำดับความประพฤติ',
      color: '#82ad09',
      icon: <IconifyIcon icon='icon-park-outline:bad-two' />,
      navLink: {
        title: 'ลำดับคะแนนความประพฤติ',
        icon: 'icon-park-outline:bad-two',
        path: '/apps/reports/badness/summary',
        action: 'read',
        subject: 'student-badness-summary-report',
      },
    },
    {
      title: 'รายงานเช็คชื่อ',
      subtitle: 'เสาธงรายวัน',
      color: '#19adb5',
      icon: <IconifyIcon icon='icon-park-twotone:flag' />,
      navLink: {
        title: 'รายงานเช็คชื่อเสาธงรายวัน',
        path: '/apps/admin/reports/check-in/daily',
        action: 'read',
        subject: 'admin-report-check-in-daily-page',
      },
    },
    {
      title: 'รายงานเช็คชื่อ',
      subtitle: 'เสาธงรายสัปดาห์',
      color: '#ead415',
      icon: <BsCalendar2Week />,
      navLink: {
        title: 'รายงานเช็คชื่อเสาธงรายสัปดาห์',
        path: '/apps/admin/reports/check-in/weekly',
        action: 'read',
        subject: 'admin-report-check-in-weekly-page',
      },
    },
    {
      title: 'รายงานเช็คชื่อ',
      subtitle: 'เสาธงรายเดือน',
      color: '#9a0a74',
      icon: <BsCalendar2Month />,
      navLink: {
        title: 'รายงานเช็คชื่อเสาธงรายเดือน',
        path: '/apps/admin/reports/check-in/monthly',
        action: 'read',
        subject: 'admin-report-check-in-monthly-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'สถิติการมาเรียน',
      color: '#49cbd5',
      icon: <HiOutlineClipboardList />,
      navLink: {
        title: 'Report สถิติการมาเรียน',
        path: '/home',
        action: 'read',
        subject: 'report-attendance-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'สรุปเวลาเรียน',
      color: '#5b77c5',
      icon: <HiOutlineChartPie />,
      navLink: {
        title: 'Report สรุปเวลาเรียน',
        path: '/home',
        action: 'read',
        subject: 'report-summary-time-page',
      },
    },
    {
      title: 'ตั้งค่าเพิ่ม/ลบ',
      subtitle: 'คะแนนอัตโนมัติ',
      color: '#bd5656',
      icon: <MdIso />,
      navLink: {
        title: 'ตั้งค่าเพิ่ม/ลบ คะแนนอัตโนมัติ',
        path: '/home',
        action: 'read',
        subject: 'setting-add-delete-auto-score-page',
      },
    },
    {
      title: 'ตั้งค่าเกณฑ์คะแนน',
      subtitle: 'ความดี/พฤติกรรม',
      color: '#67ad9a',
      icon: <HiOutlineLightBulb />,
      navLink: {
        title: 'ตั้งค่าเกณฑ์คะแนน ความดี/พฤติกรรม',
        path: '/home',
        action: 'read',
        subject: 'setting-criteria-score-good-behavior-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'ความดี',
      color: '#c3e080',
      icon: <MdTagFaces />,
      navLink: {
        title: 'Report ความดี',
        path: '/home',
        action: 'read',
        subject: 'report-good-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'พฤติกรรม',
      color: '#e25e25',
      icon: <MdOutlineSentimentDissatisfied />,
      navLink: {
        title: 'Report พฤติกรรม',
        path: '/home',
        action: 'read',
        subject: 'report-behavior-page',
      },
    },
    {
      title: 'ข้อมูลนักเรียน',
      subtitle: 'ทั้งหมด',
      color: '#353ad6',
      icon: <HiOutlineDatabase />,
      navLink: {
        title: 'ข้อมูลนักเรียนทั้งหมด',
        path: '/apps/student/list',
        action: 'read',
        subject: 'student-list-pages',
      },
    },
    {
      title: 'เพิ่ม ลบ แก้ไข',
      subtitle: 'ข้อมูลนักเรียน',
      color: '#2f8935',
      icon: <HiOutlineSelector />,
      navLink: {
        title: 'เพิ่ม ลบ แก้ไข ข้อมูลนักเรียน',
        path: '/apps/student/list',
        action: 'read',
        subject: 'student-manage-pages',
      },
    },
    {
      title: 'จัดการข้อมูล',
      subtitle: 'ครู/ บุคลากร',
      color: '#f08383',
      icon: <MdManageAccounts />,
      navLink: {
        title: 'จัดการข้อมูลครู/ บุคลากร',
        path: '/apps/teacher/list',
        action: 'read',
        subject: 'teacher-list-pages',
      },
    },
    {
      title: 'จัดการข้อมูล',
      subtitle: 'จำนวนห้องเรียน',
      color: '#db64c1',
      icon: <MdOutlineClass />,
      navLink: {
        title: 'จัดการข้อมูลจำนวนห้องเรียน',
        path: '/home',
        action: 'read',
        subject: 'manage-class-page',
      },
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'คะแนนความดี',
      color: '#6ef775',
      icon: <MdOutlineSort />,
      navLink: {
        title: 'เรียงลำดับ คะแนนความดี',
        path: '/home',
        action: 'read',
        subject: 'sort-score-good-page',
      },
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'ความพฤติกรรม',
      color: '#a02d2d',
      icon: <MdOutlineTungsten />,
      navLink: {
        title: 'เรียงลำดับ ความพฤติกรรม',
        path: '/home',
        action: 'read',
        subject: 'sort-score-behavior-page',
      },
    },
    {
      title: 'เปิด-ปิด ระบบ',
      subtitle: 'เช็คชื่อย้อนหลัง',
      color: '#2d8da8',
      icon: <MdHistoryToggleOff />,
      navLink: {
        title: 'เปิด-ปิด ระบบ เช็คชื่อย้อนหลัง',
        path: '/home',
        action: 'read',
        subject: 'toggle-checkIn-history-page',
      },
    },
    {
      title: 'สรุปคัดกรอก',
      subtitle: 'SDQ EQ',
      color: '#9e4861',
      icon: <MdOutlineTrendingUp />,
      navLink: {
        title: 'สรุปคัดกรอก SDQ EQ',
        path: '/home',
        action: 'read',
        subject: 'summary-sdq-eq-page',
      },
    },
    {
      title: 'สรุปบันทึก',
      subtitle: 'เยี่ยมบ้านนักเรียน',
      color: '#72823e',
      icon: <MdOutlineHome />,
      navLink: {
        title: 'สรุปบันทึก เยี่ยมบ้านนักเรียน',
        path: '/home',
        action: 'read',
        subject: 'summary-home-visit-page',
      },
    },
  ];

  const filterAbility = (menu: CardMenuProps) => {
    return ability.can(menu?.navLink?.action, menu?.navLink?.subject);
  };

  return (
    <Grid container spacing={6}>
      {menuList
        .filter((menu: CardMenuProps) => filterAbility(menu))
        .map((item, index) => (
          <Grid
            key={`grid-item-${index}`}
            sx={{ order: index }}
            size={{
              xs: 12,
              sm: 6,
              md: 2
            }}>
            <CardMenu
              key={`card-menu-${index}`}
              title={item.title}
              subtitle={item.subtitle}
              color={item.color}
              icon={item.icon}
              navLink={item.navLink}
              badge={item.badge}
            />
          </Grid>
        ))}
    </Grid>
  );
};

Home.acl = {
  action: 'read',
  subject: 'home-page',
};

export default Home;
