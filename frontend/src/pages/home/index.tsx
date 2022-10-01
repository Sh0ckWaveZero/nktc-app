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

const Home = () => {
  const menuList: CardMenuProps[] = [
    {
      title: 'Report',
      subtitle: 'สถิติการมาเรียน',
      color: '#49cbd5',
      icon: <HiOutlineClipboardList />,
      navLink: {
        title: 'Report สถิติการมาเรียน',
        path: '/apps/reports/check-in',
      },
    },
    {
      title: 'Report',
      subtitle: 'เช็คชื่อนหน้าเสาธง',
      color: '#af7a4e',
      icon: <HiOutlineFlag />,
      navLink: {
        title: 'Report เช็คชื่อนหน้าเสาธง',
        path: '/second-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'สรุปเวลาเรียน',
      color: '#5b77c5',
      icon: <HiOutlineChartPie />,
      navLink: {
        title: 'Report สรุปเวลาเรียน',
        path: '/second-page',
      },
    },
    {
      title: 'ตั้งค่าเพิ่ม/ลบ',
      subtitle: 'คะแนนอัตโนมัติ',
      color: '#bd5656',
      icon: <MdIso />,
      navLink: {
        title: 'ตั้งค่าเพิ่ม/ลบ คะแนนอัตโนมัติ',
        path: '/second-page',
      },
    },
    {
      title: 'ตั้งค่าเกณฑ์คะแนน',
      subtitle: 'ความดี/พฤติกรรม',
      color: '#67ad9a',
      icon: <HiOutlineLightBulb />,
      navLink: {
        title: 'ตั้งค่าเกณฑ์คะแนน ความดี/พฤติกรรม',
        path: '/second-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'ความดี',
      color: '#c3e080',
      icon: <MdTagFaces />,
      navLink: {
        title: 'Report ความดี',
        path: '/second-page',
      },
    },
    {
      title: 'Report',
      subtitle: 'พฤติกรรม',
      color: '#e25e25',
      icon: <MdOutlineSentimentDissatisfied />,
      navLink: {
        title: 'Report พฤติกรรม',
        path: '/second-page',
      },
    },
    {
      title: 'ข้อมูลนักเรียน',
      subtitle: 'ทั้งหมด',
      color: '#353ad6',
      icon: <HiOutlineDatabase />,
      navLink: {
        title: 'ข้อมูลนักเรียนทั้งหมด',
        path: '/second-page',
      },
    },
    {
      title: 'เพิ่ม ลบ แก้ไข',
      subtitle: 'ข้อมูลนักเรียน',
      color: '#2f8935',
      icon: <HiOutlineSelector />,
      navLink: {
        title: 'เพิ่ม ลบ แก้ไข ข้อมูลนักเรียน',
        path: '/second-page',
      },
    },
    {
      title: 'จัดการข้อมูล',
      subtitle: 'ครู/ บุคลากร',
      color: '#f08383',
      icon: <MdManageAccounts />,
      navLink: {
        title: 'จัดการข้อมูลครู/ บุคลากร',
        path: '/second-page',
      },
    },
    {
      title: 'จัดการข้อมูล',
      subtitle: 'จำนวนห้องเรียน',
      color: '#db64c1',
      icon: <MdOutlineClass />,
      navLink: {
        title: 'จัดการข้อมูลจำนวนห้องเรียน',
        path: '/second-page',
      },
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'คะแนนความดี',
      color: '#6ef775',
      icon: <MdOutlineSort />,
      navLink: {
        title: 'เรียงลำดับ คะแนนความดี',
        path: '/second-page',
      },
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'ความพฤติกรรม',
      color: '#a02d2d',
      icon: <MdOutlineTungsten />,
      navLink: {
        title: 'เรียงลำดับ ความพฤติกรรม',
        path: '/second-page',
      },
    },
    {
      title: 'เปิด-ปิด ระบบ',
      subtitle: 'เช็คชื่อย้อนหลัง',
      color: '#2d8da8',
      icon: <MdHistoryToggleOff />,
      navLink: {
        title: 'เปิด-ปิด ระบบ เช็คชื่อย้อนหลัง',
        path: '/second-page',
      },
    },
    {
      title: 'สรุปคัดกรอก',
      subtitle: 'SDQ EQ',
      color: '#9e4861',
      icon: <MdOutlineTrendingUp />,
      navLink: {
        title: 'สรุปคัดกรอก SDQ EQ',
        path: '/second-page',
      },
    },
    {
      title: 'สรุปบันทึก',
      subtitle: 'เยี่ยมบ้านนักเรียน',
      color: '#72823e',
      icon: <MdOutlineHome />,
      navLink: {
        title: 'สรุปบันทึก เยี่ยมบ้านนักเรียน',
        path: '/second-page',
      },
    },
  ];

  return (
    <Grid container spacing={6}>
      {menuList.map((item, index) => (
        <Grid item key={`grid-item-${index}`} xs={12} sm={6} md={2} sx={{ order: index }}>
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
  );
};

export default Home;
