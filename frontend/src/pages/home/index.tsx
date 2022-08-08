// ** MUI Imports
import Grid from '@mui/material/Grid';

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

type MenuCardProps = {
  title: string;
  subtitle?: string;
  color?: string;
  sx?: object;
  icon?: React.ReactElement;
  path?: string;
};

const Home = () => {
  const menuList: MenuCardProps[] = [
    {
      title: 'Report',
      subtitle: 'สถิติการมาเรียน',
      color: '#49cbd5',
      icon: <HiOutlineClipboardList />,
      path: '/second-page',
    },
    {
      title: 'Report',
      subtitle: 'เช็คชื่อนหน้าเสาธง',
      color: '#af7a4e',
      icon: <HiOutlineFlag />,
      path: '/second-page',
    },
    {
      title: 'Report',
      subtitle: 'สรุปเวลาเรียน',
      color: '#5b77c5',
      icon: <HiOutlineChartPie />,
      path: '/second-page',
    },
    {
      title: 'ตั้งค่าเพิ่ม/ลบ',
      subtitle: 'คะแนนอัตโนมัติ',
      color: '#bd5656',
      icon: <MdIso />,
      path: '/second-page',
    },
    {
      title: 'ตั้งค่าเกณฑ์คะแนน',
      subtitle: 'ความดี/พฤติกรรม',
      color: '#67ad9a',
      icon: <HiOutlineLightBulb />,
      path: '/second-page',
    },
    {
      title: 'Report',
      subtitle: 'ความดี',
      color: '#c3e080',
      icon: <MdTagFaces />,
      path: '/second-page',
    },
    {
      title: 'Report',
      subtitle: 'พฤติกรรม',
      color: '#e25e25',
      icon: <MdOutlineSentimentDissatisfied />,
      path: '/second-page',
    },
    {
      title: 'ข้อมูลนักเรียน',
      subtitle: 'ทั้งหมด',
      color: '#353ad6',
      icon: <HiOutlineDatabase />,
      path: '/second-page',
    },
    {
      title: 'เพิ่ม ลบ แก้ไข',
      subtitle: 'ข้อมูลนักเรียน',
      color: '#2f8935',
      icon: <HiOutlineSelector />,
      path: '/second-page',
    },
    {
      title: 'จัดการข้อมูล',
      subtitle: 'ครู/ บุคลากร',
      color: '#f08383',
      icon: <MdManageAccounts />,
      path: '/second-page',
    },
    {
      title: 'จัดการข้อมูล',
      subtitle: 'จำนวนห้องเรียน',
      color: '#db64c1',
      icon: <MdOutlineClass />,
      path: '/second-page',
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'คะแนนความดี',
      color: '#6ef775',
      icon: <MdOutlineSort />,
      path: '/second-page',
    },
    {
      title: 'เรียงลำดับ',
      subtitle: 'ความพฤติกรรม',
      color: '#a02d2d',
      icon: <MdOutlineTungsten />,
      path: '/second-page',
    },
    {
      title: 'เปิด-ปิด ระบบ',
      subtitle: 'เช็คชื่อย้อนหลัง',
      color: '#2d8da8',
      icon: <MdHistoryToggleOff />,
      path: '/second-page',
    },
    {
      title: 'สรุปคัดกรอก',
      subtitle: 'SDQ EQ',
      color: '#9e4861',
      icon: <MdOutlineTrendingUp />,
      path: '/second-page',
    },
    {
      title: 'สรุปบันทึก',
      subtitle: 'เยี่ยมบ้านนักเรียน',
      color: '#72823e',
      icon: <MdOutlineHome />,
      path: '/second-page',
    },
  ];

  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <Card>
          <CardHeader title='Kick start your project 🚀'></CardHeader>
          <CardContent>
            <Typography sx={{ mb: 2 }}>
              All the best for your new project.
            </Typography>
            <Typography>
              Please make sure to read our Template Documentation to understand
              where to go from here and how to use our template.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='ACL and JWT 🔒'></CardHeader>
          <CardContent>
            <Typography sx={{ mb: 2 }}>
              Access Control (ACL) and Authentication (JWT) are the two main
              security features of our template and are implemented in the
              starter-kit as well.
            </Typography>
            <Typography>
              Please read our Authentication and ACL Documentations to get more
              out of them.
            </Typography>
          </CardContent>
        </Card>
      </Grid> */}
      {menuList.map((item, index) => (
        <Grid
          item
          key={`grid-item-${index}`}
          xs={12}
          sm={6}
          md={2}
          sx={{ order: 0 }}
        >
          <CardMenu
            key={`card-menu-${index}`}
            title={item.title}
            subtitle={item.subtitle}
            color={item.color}
            icon={item.icon}
            path={item.path}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Home;
