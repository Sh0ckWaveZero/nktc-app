// ** Icon imports
import {
  HomeOutline,
  HumanMaleBoard,
} from 'mdi-material-ui';
import { RiContactsBookLine, RiTeamLine, RiUser6Line } from 'react-icons/ri';
import { FaFlagCheckered } from 'react-icons/fa';

// ** Type import
import { VerticalNavItemsType } from '@/@core/layouts/types';
import { HiOutlineFlag } from 'react-icons/hi';
import { BsBarChartLine, BsCalendar2Date, BsCalendar2Month, BsCalendar2Week, BsClipboardData } from "react-icons/bs";
import { TbChartBar } from 'react-icons/tb';

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'หน้าหลัก',
      icon: HomeOutline,
      path: '/home',
      action: 'read',
      subject: 'home-page',
    },
    {
      sectionTitle: 'จัดการข้อมูล',
      action: 'read',
      subject: 'manage-data',
    },
    {
      title: 'ครู / บุคลากร',
      icon: HumanMaleBoard,
      action: 'read',
      subject: 'teacher-page',
      children: [
        {
          title: 'รายชื่อทั้งหมด',
          icon: RiContactsBookLine,
          path: '/apps/teacher/list',
          action: 'read',
          subject: 'teacher-page',
        },
        // {
        //   title: 'View',
        //   path: '/apps/teacher/view',
        // },
      ],
    },
    {
      title: 'นักเรียน',
      icon: RiTeamLine,
      action: 'read',
      subject: 'student-page',
      children: [
        {
          title: 'รายชื่อทั้งหมด',
          icon: RiContactsBookLine,
          path: '/apps/student/list',
          action: 'read',
          subject: 'student-page',
        },
        // {
        // title: 'View',
        // path: '/apps/user/view',
        // },
      ],
    },
    {
      title: 'ข้อมูลส่วนตัว',
      icon: RiUser6Line,
      path: '/pages/account-settings',
      action: 'read',
      subject: 'account-page',
    },
    {
      sectionTitle: 'รายงาน',
      action: 'read',
      subject: 'report-category',
    },
    {
      title: 'เช็คชื่อหน้าเสาธง',
      icon: HiOutlineFlag,
      path: '/apps/reports/check-in',
      action: 'read',
      subject: 'check-in-page',
    },
    {
      title: 'รายงานเช็คชื่อ-เช้า',
      icon: BsClipboardData,
      action: 'read',
      subject: 'report-check-in-page',
      children: [
        {
          title: 'รายวัน',
          icon: BsCalendar2Date,
          action: 'read',
          subject: 'report-check-in-page',
          path: '/apps/reports/check-in/daily',
        },
        {
          title: 'รายงานสรุป',
          icon: BsBarChartLine,
          action: 'read',
          subject: 'report-check-in-page',
          path: '/apps/reports/check-in/summary',
        }
      ],
    },
    {
      sectionTitle: 'สำหรับผู้ดูแลระบบ',
      action: 'read',
      subject: 'admin-category',
    },
    {
      title: 'เช็คชื่อเช้า-ผู้ดูแลระบบ',
      icon: BsClipboardData,
      action: 'read',
      subject: 'admin-report-check-in-page',
      children: [
        {
          title: 'รายวัน',
          icon: BsCalendar2Date,
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/daily',
        },
        {
          title: 'รายสัปดาห์',
          icon: BsCalendar2Week,
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/weekly',
        },
        {
          title: 'รายเดือน',
          icon: BsCalendar2Month,
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/monthly',
        },
        // {
        //   title: 'รายงานสรุป',
        //   icon: BsBarChartLine,
        //   action: 'read',
        //   subject: 'admin-report-check-in-page',
        //   path: '/apps/admin/reports/check-in/summary',
        // }
      ],
    },
    {
      title: 'เช็คชื่อกิจกรรม',
      icon: FaFlagCheckered,
      path: '/apps/reports/activity-check-in',
      action: 'read',
      subject: 'activity-check-in-page',
    },
    {
      title: 'รายงานเช็คชื่อกิจกรรม',
      icon: TbChartBar,
      action: 'read',
      subject: 'activity-check-in-page',
      children: [
        {
          title: 'รายวัน',
          icon: BsCalendar2Date,
          action: 'read',
          subject: 'activity-check-in-page',
          path: '/apps/reports/activity-check-in/daily',
        },
        {
          title: 'รายงานสรุป',
          icon: BsBarChartLine,
          action: 'read',
          subject: 'activity-check-in-page',
          path: '/apps/reports/activity-check-in/summary',
        }
      ],
    },
    {
      title: 'เช็คชื่อกิจกรรม-ผู้ดูแลระบบ',
      icon: TbChartBar,
      action: 'read',
      subject: 'admin-activity-check-in-page',
      children: [
        {
          title: 'รายวัน',
          icon: BsCalendar2Date,
          action: 'read',
          subject: 'admin-activity-check-in-page',
          path: '/apps/admin/reports/activity-check-in/daily',
        },
        {
          title: 'รายสัปดาห์',
          icon: BsCalendar2Week,
          action: 'read',
          subject: 'admin-activity-check-in-page',
          path: '/apps/admin/reports/activity-check-in/weekly',
        },
        {
          title: 'รายเดือน',
          icon: BsCalendar2Month,
          action: 'read',
          subject: 'admin-activity-check-in-page',
          path: '/apps/admin/reports/activity-check-in/monthly',
        },
      ],
    },
  ];
};

export default navigation;
