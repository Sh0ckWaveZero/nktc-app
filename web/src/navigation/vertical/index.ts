import {
  mdiAccountOutline,
  mdiAccountPlusOutline,
  mdiAlertCircleOutline,
  mdiCreditCardOutline,
  mdiCubeOutline,
  mdiFileTableBoxOutline,
  mdiFormatLetterCaseLower,
  mdiGoogleCircles,
  mdiHomeVariantOutline,
  mdiLogin
} from '@mdi/js';

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'แดชบอร์ด',
      icon: mdiHomeVariantOutline,
      path: '/'
    },
    {
      title: 'การตั้งค่าบัญชี',
      icon: mdiAccountOutline,
      path: '/account-settings'
    },
    {
      sectionTitle: 'เพจที่สำคัญ'
    },
    {
      title: 'เข้าสู่ระบบ',
      icon: mdiLogin,
      path: '/pages/login',
      openInNewTab: true
    },
    {
      title: 'ลงทะเบียน',
      icon: mdiAccountPlusOutline,
      path: '/pages/register',
      openInNewTab: true
    },
    {
      title: 'Error',
      icon: mdiAlertCircleOutline,
      path: '/pages/error',
      openInNewTab: true
    },
    // {
    //   sectionTitle: 'User Interface'
    // },
    // {
    //   title: 'Typography',
    //   icon: mdiFormatLetterCaseLower,
    //   path: '/typography'
    // },
    // {
    //   title: 'Icons',
    //   path: '/icons',
    //   icon: mdiGoogleCircles
    // },
    // {
    //   title: 'Cards',
    //   icon: mdiCreditCardOutline,
    //   path: '/cards'
    // },
    // {
    //   title: 'Tables',
    //   icon: mdiFileTableBoxOutline,
    //   path: '/tables'
    // },
    // {
    //   icon: mdiCubeOutline,
    //   title: 'Form Layouts',
    //   path: '/form-layouts'
    // }
  ]
}

export default navigation
