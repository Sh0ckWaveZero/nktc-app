import { CardMenuProps } from '@/@core/components/card-statistics/types';
import IconifyIcon from '@/@core/components/icon';
import { HiOutlineClipboardList, HiOutlineChartPie, HiOutlineFlag, HiOutlineLightBulb, HiOutlineDatabase, HiOutlineSelector, HiStar, HiThumbDown } from 'react-icons/hi';
import { MdHistoryToggleOff, MdIso, MdManageAccounts, MdOutlineClass, MdOutlineHome, MdOutlineTrendingUp } from 'react-icons/md';
import { BsCalendar2Month, BsCalendar2Week, BsClipboardData } from 'react-icons/bs';
import { TbChartBar, TbReport } from 'react-icons/tb';

export const EDUCATIONAL_INSIGHTS = [
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

export const WEEKLY_ATTENDANCE_CHART_DATA = [
  { name: 'จันทร์', 'อัตรามาเรียน (%)': 96, 'ขาด/สาย (คน)': 1, 'มาเรียน (คน)': 28 },
  { name: 'อังคาร', 'อัตรามาเรียน (%)': 93, 'ขาด/สาย (คน)': 2, 'มาเรียน (คน)': 27 },
  { name: 'พุธ', 'อัตรามาเรียน (%)': 90, 'ขาด/สาย (คน)': 3, 'มาเรียน (คน)': 26 },
  { name: 'พฤหัสบดี', 'อัตรามาเรียน (%)': 96, 'ขาด/สาย (คน)': 1, 'มาเรียน (คน)': 28 },
  { name: 'ศุกร์', 'อัตรามาเรียน (%)': 93, 'ขาด/สาย (คน)': 2, 'มาเรียน (คน)': 27 },
];

export const MOCK_ALERTS = [
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
];

export const MOCK_OUTSTANDING = [
  { id: 'good-1', name: 'นางสาวธนภรณ์ รัตนโชติ', studentId: '66309012428', score: 145, goodnessScore: 45, goodnessCount: 9 },
  { id: 'good-2', name: 'นางสาวปรียาภรณ์ มั่งมี', studentId: '66309012431', score: 130, goodnessScore: 30, goodnessCount: 6 },
  { id: 'good-3', name: 'นายสรวิชญ์ บูรณพิมพ์', studentId: '66309012421', score: 125, goodnessScore: 25, goodnessCount: 5 },
];

export const MENU_LIST: CardMenuProps[] = [
  // --- GROUP: DAILY LOGS ---
  {
    title: 'เช็คชื่อเสาธง',
    subtitle: 'ตอนเช้าหน้าเสาธง',
    color: '#FF9D7E',
    icon: <IconifyIcon icon='icon-park-twotone:flag' />,
    navLink: { title: 'เช็คชื่อหน้าเสาธง', path: '/apps/reports/check-in', action: 'read', subject: 'check-in-page' },
    badge: 'daily',
  },
  {
    title: 'เช็คชื่อกิจกรรม',
    subtitle: 'กิจกรรมพิเศษวิทยาลัย',
    color: '#d7c842',
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
    color: '#4caf50',
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
    subtitle: 'นักเรียนรายกลุ่มประสงค์',
    color: '#2e7d32',
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
    color: '#f44336',
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
    subtitle: 'ไม่เหมาะสมรายกลุ่มประสงค์',
    color: '#c62828',
    icon: <IconifyIcon icon='heroicons:hand-thumb-down' />,
    navLink: {
      title: 'บันทึกพฤติกรรมไม่เหมาะสม รายกลุ่ม',
      action: 'read',
      subject: 'record-badness-page',
      path: '/apps/record-badness/individual',
    },
    badge: 'group',
  },

  // --- GROUP: REPORTS & STATISTICS ---
  {
    title: 'รายงานเช็คเสาธงรายวัน',
    subtitle: 'สรุปการมาแถวรายวัน',
    color: '#82ad09',
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
    color: '#82ad09',
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
    color: '#19adb5',
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
    color: '#19adb5',
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
    color: '#4caf50',
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
    color: '#f44336',
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
    color: '#ffd700',
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
    color: '#a02d2d',
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
    color: '#49cbd5',
    icon: <HiOutlineClipboardList />,
    navLink: { title: 'สถิติการมาเรียน', path: '/home', action: 'read', subject: 'report-attendance-page' },
    badge: 'analytics',
  },
  {
    title: 'สรุปชั่วโมงเวลาเรียน',
    subtitle: 'สรุปเปอร์เซ็นต์เวลาเรียนเข้าสอบ',
    color: '#5b77c5',
    icon: <HiOutlineChartPie />,
    navLink: { title: 'สรุปเวลาเรียน', path: '/home', action: 'read', subject: 'report-summary-time-page' },
    badge: 'summary',
  },
  {
    title: 'สรุปคัดกรอง SDQ / EQ',
    subtitle: 'วิเคราะห์พฤติกรรมและอารมณ์เด็ก',
    color: '#9e4861',
    icon: <MdOutlineTrendingUp />,
    navLink: { title: 'สรุปคัดกรอง SDQ EQ', path: '/home', action: 'read', subject: 'summary-sdq-eq-page' },
    badge: 'screening',
  },
  {
    title: 'สรุปผลบันทึกเยี่ยมบ้าน',
    subtitle: 'สรุปผลและรายงานแผนที่เยี่ยมบ้าน',
    color: '#72823e',
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
    color: '#FF8787',
    icon: <TbReport />,
    navLink: {
      title: 'รายงานการเข้าใช้งาน',
      path: '/apps/reports/access-report',
      action: 'read',
      subject: 'access-report',
    },
    badge: 'access',
  },

  // --- GROUP: ADMIN / MANAGEMENT ---
  {
    title: 'ข้อมูลนักเรียนทั้งหมด',
    subtitle: 'ค้นหาและดูข้อมูลระเบียนรายคน',
    color: '#353ad6',
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
    color: '#2f8935',
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
    title: 'จัดการข้อมูลครู/บุคลากร',
    subtitle: 'สืบค้นฐานข้อมูลอาจารย์ NKTC',
    color: '#f08383',
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
    color: '#db64c1',
    icon: <MdOutlineClass />,
    navLink: { title: 'จัดการข้อมูลจำนวนห้องเรียน', path: '/home', action: 'read', subject: 'manage-class-page' },
    badge: 'admin',
  },
  {
    title: 'สถิติเสาธงรายวันวิทยาลัย',
    subtitle: 'รายงานกลางเสาธง (ผู้บริหาร/แอดมิน)',
    color: '#19adb5',
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
    color: '#ead415',
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
    color: '#9a0a74',
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
    subtitle: 'กำหนดคะแนนตั้งต้นและการหักแต้มออโต้',
    color: '#bd5656',
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
    subtitle: 'กำหนดหมวดหมู่และคะแนนตรรกะความประพฤติ',
    color: '#67ad9a',
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
    subtitle: 'กำหนดช่วงเวลาอนุญาตลงบันทึกเช็คชื่อย้อนหลัง',
    color: '#2d8da8',
    icon: <MdHistoryToggleOff />,
    navLink: {
      title: 'เปิด-ปิด ระบบ เช็คชื่อย้อนหลัง',
      path: '/home',
      action: 'read',
      subject: 'toggle-checkIn-history-page',
    },
    badge: 'setting',
  },
];
