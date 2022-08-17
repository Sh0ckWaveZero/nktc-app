// ** Icon imports
import {
  HomeOutline,
  EmailOutline,
  ShieldOutline,
  AlertCircleOutline,
  AccountOutline,
  HumanMaleBoard,
} from 'mdi-material-ui';
import { MdAccountCircle, MdOutlineFaceRetouchingNatural } from 'react-icons/md';
import { RiUser5Line, RiUser6Line } from 'react-icons/ri';

// ** Type import
import { VerticalNavItemsType } from '@/@core/layouts/types';

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'หน้าหลัก',
      icon: HomeOutline,
      path: '/home',
    },
    {
      title: 'Second Page',
      icon: EmailOutline,
      path: '/second-page',
    },
    {
      title: 'Access Control',
      icon: ShieldOutline,
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
    },
    {
      sectionTitle: 'จัดการข้อมูล',
    },
    {
      title: 'ครู / บุคลากร',
      icon: HumanMaleBoard,
      action: 'read',
      children: [
        {
          title: 'รายชื่อทั้งหมด',
          icon: ShieldOutline,
          path: '/apps/teacher/list',
        },
        {
          title: 'View',
          path: '/apps/teacher/view',
        },
      ],
    },
    {
      title: 'นักเรียน',
      icon: RiUser5Line,
      action: 'read',
      children: [
        {
          title: 'List',
          icon: ShieldOutline,
          path: '/apps/user/list',
        },
        {
          title: 'View',
          path: '/apps/user/view',
        },
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
    },
  ];
};

export default navigation;
