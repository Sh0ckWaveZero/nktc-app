// ** Icon imports
import {
  HomeOutline,
  ShieldOutline,
  HumanMaleBoard,
} from 'mdi-material-ui';
import { RiUser5Line, RiUser6Line } from 'react-icons/ri';

// ** Type import
import { VerticalNavItemsType } from '@/@core/layouts/types';
import { HiOutlineFlag } from 'react-icons/hi';
import { BsBarChartLine, BsCalendar2Date, BsCalendar2Month, BsCalendar2Week, BsClipboardData } from "react-icons/bs";

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
      subject: 'teacherAll',
      children: [
        {
          title: 'รายชื่อทั้งหมด',
          icon: ShieldOutline,
          path: '/apps/teacher/list',
          action: 'manage',
          subject: 'teacherAll',
        },
        // {
        //   title: 'View',
        //   path: '/apps/teacher/view',
        // },
      ],
    },
    {
      title: 'นักเรียน',
      icon: RiUser5Line,
      action: 'read',
      subject: 'student',
      children: [
        {
          title: 'รายชื่อทั้งหมด',
          icon: ShieldOutline,
          // path: '/apps/user/list',
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
        // {
        //   title: 'รายสัปดาห์',
        //   icon: BsCalendar2Week,
        //   action: 'read',
        //   subject: 'report-check-in-page',
        //   path: '/apps/reports/check-in/weekly',
        // },
        // {
        //   title: 'รายเดือน',
        //   icon: BsCalendar2Month,
        //   action: 'read',
        //   subject: 'report-check-in-page',
        //   path: '/apps/reports/check-in/monthly',
        // },
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
      title: 'รายงานเช็คชื่อเช้า-ผู้ดูแลระบบ',
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
        {
          title: 'รายงานสรุป',
          icon: BsBarChartLine,
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/summary',
        }
      ],
    },
  ];
};

export default navigation;
