// ** Icon imports
import {
  mdiHomeOutline,
  mdiMonitorDashboard,
  mdiAccountCogOutline,
  mdiLogin,
  mdiAccountPlusOutline,
  mdiAlertCircleOutline,
  mdiHumanMaleBoard,
} from '@mdi/js';

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types';

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'หน้าหลัก',
      icon: mdiHomeOutline,
      path: '/'
    },
    {
      title: 'แผงควบคุม',
      icon: mdiMonitorDashboard,
      path: '/dashboard'
    },
    {
      sectionTitle: 'การจัดการข้อมูล',
    },
    {
      title: 'การตั้งค่าบัญชี',
      icon: mdiAccountCogOutline,
      path: '/account-settings'
    },
    {
      title: 'จัดการครู/บุคลากร',
      icon: mdiHumanMaleBoard,
      path: '/teachers'
    },
    {
      sectionTitle: 'Pages'
    },
    {
      title: 'Login',
      icon: mdiLogin,
      path: '/pages/login',
      openInNewTab: true
    },
    {
      title: 'Register',
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
    {
      sectionTitle: 'User Interface'
    },
  ];
};

export default navigation;
