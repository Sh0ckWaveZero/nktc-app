// ** Icon imports
import { HumanMaleBoard } from 'mdi-material-ui';
import { RiSurveyLine, RiTeamLine } from 'react-icons/ri';

// ** Type import
import type { VerticalNavItemsType } from '@/@core/layouts/types';
import { HiOutlineStar, HiOutlineThumbDown, HiStar, HiThumbDown } from 'react-icons/hi';
import { BsClipboardData } from 'react-icons/bs';
import { TbChartBar } from 'react-icons/tb';
import { FiSettings } from 'react-icons/fi';

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'หน้าหลัก',
      icon: 'icon-park-outline:school',
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
          icon: 'heroicons:inbox-stack',
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
          icon: 'heroicons:inbox-stack',
          path: '/apps/student/list',
          action: 'read',
          subject: 'student-page',
        },
      ],
    },
    {
      title: 'ข้อมูลส่วนตัว',
      icon: 'line-md:account',
      path: '/pages/account-settings',
      action: 'read',
      subject: 'account-page',
    },
    {
      title: 'การตั้งค่าระบบ',
      icon: FiSettings,
      action: 'read',
      subject: 'setting-system-page',
      children: [
        {
          title: 'แผนกวิชา',
          icon: 'tabler:building-community',
          path: '/apps/settings/department',
          action: 'manage',
          subject: 'settings-department-list-pages',
        },
        {
          title: 'ห้องเรียน',
          icon: 'material-symbols:room-preferences-outline-rounded',
          path: '/apps/settings/classroom',
          action: 'read',
          subject: 'setting-system-page',
        },
        {
          title: 'สาขาวิชา',
          icon: 'material-symbols:school-outline',
          path: '/apps/settings/program',
          action: 'manage',
          subject: 'settings-program-list-pages',
        },
        {
          title: 'ปฏิทิน',
          icon: 'mdi:calendar-blank-outline',
          path: '/apps/calendar',
          action: 'read',
          subject: 'calendar-page',
        },
      ],
    },
    {
      sectionTitle: 'เกี่ยวกับระบบ',
      action: 'read',
      subject: 'about-the-system',
    },
    {
      title: 'เช็คชื่อหน้าเสาธง',
      icon: 'icon-park-twotone:flag',
      path: '/apps/reports/check-in',
      action: 'read',
      subject: 'check-in-page',
    },
    {
      title: 'เช็คชื่อกิจกรรม',
      icon: 'pepicons-pop:flag',
      path: '/apps/reports/activity-check-in',
      action: 'read',
      subject: 'activity-check-in-page',
    },
    {
      title: 'บันทึกความดี',
      icon: HiOutlineStar,
      action: 'read',
      subject: 'record-goodness-page',
      children: [
        {
          title: 'รายบุคคล',
          icon: 'heroicons:inbox',
          action: 'read',
          subject: 'record-goodness-page',
          path: '/apps/record-goodness/individual',
        },
        {
          title: 'รายกลุ่ม',
          icon: 'heroicons:inbox-stack',
          action: 'read',
          subject: 'record-goodness-page',
          path: '/apps/record-goodness/group',
        },
      ],
    },
    {
      title: 'บันทึกพฤติกรรมที่ไม่เหมาะสม',
      icon: HiOutlineThumbDown,
      action: 'read',
      subject: 'record-badness-page', //badness-individual
      children: [
        {
          title: 'รายบุคคล',
          icon: 'heroicons:inbox',
          action: 'read',
          subject: 'record-badness-page',
          path: '/apps/record-badness/individual',
        },
        {
          title: 'รายกลุ่ม',
          icon: 'heroicons:inbox-stack',
          action: 'read',
          subject: 'report-badness-group-page',
          path: '/apps/record-badness/group',
        },
      ],
    },
    {
      title: 'บันทึกเยี่ยมบ้าน',
      icon: RiSurveyLine,
      action: 'read',
      subject: 'visit-student-page',
      children: [
        {
          title: 'รายชื่อนักเรียน',
          icon: 'mdi:home-switch-outline',
          path: '/apps/visit/list',
          action: 'read',
          subject: 'visit-student-list-page',
        },
      ],
    },
    {
      sectionTitle: '📝 รายงาน',
      action: 'read',
      subject: 'report-category',
    },
    {
      title: 'รายงานเช็คชื่อ-เช้า',
      icon: BsClipboardData,
      action: 'read',
      subject: 'report-check-in-page',
      children: [
        {
          title: 'รายวัน',
          icon: 'bi:calendar2-date',
          action: 'read',
          subject: 'report-check-in-page',
          path: '/apps/reports/check-in/daily',
        },
        {
          title: 'รายงานสรุป',
          icon: 'tabler:sum',
          action: 'read',
          subject: 'report-check-in-page',
          path: '/apps/reports/check-in/summary',
        },
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
          icon: 'bi:calendar2-date',
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/daily',
        },
        {
          title: 'รายสัปดาห์',
          icon: 'bi:calendar2-week',
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/weekly',
        },
        {
          title: 'รายเดือน',
          icon: 'bi:calendar2-month',
          action: 'read',
          subject: 'admin-report-check-in-page',
          path: '/apps/admin/reports/check-in/monthly',
        },
      ],
    },

    {
      title: 'รายงานเช็คชื่อกิจกรรม',
      icon: TbChartBar,
      action: 'read',
      subject: 'activity-check-in-page',
      children: [
        {
          title: 'รายวัน',
          icon: 'bi:calendar2-date',
          action: 'read',
          subject: 'activity-check-in-page',
          path: '/apps/reports/activity-check-in/daily',
        },
        {
          title: 'รายงานสรุป',
          icon: 'tabler:sum',
          action: 'read',
          subject: 'activity-check-in-page',
          path: '/apps/reports/activity-check-in/summary',
        },
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
          icon: 'bi:calendar2-date',
          action: 'read',
          subject: 'admin-activity-check-in-page',
          path: '/apps/admin/reports/activity-check-in/daily',
        },
        {
          title: 'รายสัปดาห์',
          icon: 'bi:calendar2-week',
          action: 'read',
          subject: 'admin-activity-check-in-page',
          path: '/apps/admin/reports/activity-check-in/weekly',
        },
        {
          title: 'รายเดือน',
          icon: 'bi:calendar2-month',
          action: 'read',
          subject: 'admin-activity-check-in-page',
          path: '/apps/admin/reports/activity-check-in/monthly',
        },
      ],
    },
    {
      title: 'สถิติการใช้งานระบบ',
      icon: 'carbon:analytics',
      path: '/apps/admin/reports/statistics',
      action: 'read',
      subject: 'admin-statistics-page',
    },
    {
      title: 'ความดี',
      icon: HiStar,
      action: 'read',
      subject: 'report-goodness-page',
      children: [
        {
          title: 'ทั้งหมด',
          icon: 'heroicons:inbox-stack',
          action: 'read',
          subject: 'report-goodness-page',
          path: '/apps/reports/goodness/all',
        },
      ],
    },
    {
      title: 'พฤติกรรมที่ไม่เหมาะสม',
      icon: HiThumbDown,
      action: 'read',
      subject: 'report-check-in-page',
      children: [
        {
          title: 'ทั้งหมด',
          icon: 'heroicons:inbox-stack',
          action: 'read',
          subject: 'report-badness-page',
          path: '/apps/reports/badness/all',
        },
      ],
    },
    {
      title: 'หน้าหลัก',
      icon: 'icon-park-outline:school',
      path: '/apps/student/overview',
      action: 'read',
      subject: 'student-overview-page',
    },
    {
      title: 'รายงานการเช็คชื่อ',
      icon: 'healthicons:i-schedule-school-date-time',
      path: '/apps/reports/student/check-in-report',
      action: 'read',
      subject: 'student-check-in-report',
    },
    {
      title: 'Report ความดี',
      icon: 'humbleicons:bulb',
      path: '/apps/reports/goodness/individual',
      action: 'read',
      subject: 'student-goodness-report',
    },
    {
      title: 'Report ความประพฤติ',
      icon: 'fluent:people-error-24-regular',
      path: '/apps/reports/badness/individual',
      action: 'read',
      subject: 'student-badness-report',
    },
    {
      title: 'ลำดับคะแนนความดี',
      icon: 'game-icons:trophy',
      path: '/apps/reports/goodness/summary',
      action: 'read',
      subject: 'student-goodness-summary-report',
    },
    {
      title: 'ลำดับคะแนนความประพฤติ',
      icon: 'icon-park-outline:bad-two',
      path: '/apps/reports/badness/summary',
      action: 'read',
      subject: 'student-badness-summary-report',
    },
    {
      icon: 'ic:round-add-chart',
      title: 'ประกาศ ผลการเรียน',
      path: 'https://student.vec.go.th/web/Login.htm?mode=indexStudent',
      action: 'read',
      subject: 'student-academic-performance-report',
    },
  ];
};

export default navigation;
