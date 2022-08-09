// ** Icon imports
import {
  HomeOutline,
  EmailOutline,
  ShieldOutline,
  AlertCircleOutline,
  AccountOutline,
  HumanMaleBoard,
} from 'mdi-material-ui'
import { MdAccountCircle, MdOutlineFaceRetouchingNatural } from "react-icons/md";
import { RiUser5Line } from "react-icons/ri";

// ** Type import
import { VerticalNavItemsType } from '@/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'หน้าหลัก',
      icon: HomeOutline,
      path: '/home'
    },
    {
      title: 'Second Page',
      icon: EmailOutline,
      path: '/second-page'
    },
    {
      title: 'Access Control',
      icon: ShieldOutline,
      path: '/acl',
      action: 'read',
      subject: 'acl-page'
    },
    {
      sectionTitle: 'จัดการข้อมูล'
    },
    {
      title: 'ครู / บุคลากร',
      icon: HumanMaleBoard,
      action: 'read',
      children: [
        {
          title: 'List',
          icon: ShieldOutline,
          path: '/apps/user/list'
        },
        {
          title: 'View',
          path: '/apps/user/view',
        }
      ]
    },
    {
      title: 'นักเรียน',
      icon: RiUser5Line,
      action: 'read',
      children: [
        {
          title: 'List',
          icon: ShieldOutline,
          path: '/apps/user/list'
        },
        {
          title: 'View',
          path: '/apps/user/view',
        }
      ]
    },
    {
      sectionTitle: 'รายงาน'
    },
  ]
}

export default navigation
