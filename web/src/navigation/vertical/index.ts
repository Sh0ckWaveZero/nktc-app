// ** Icon imports
import {
  mdiHomeOutline,
  mdiMonitorDashboard,
  mdiAccountCogOutline,
  mdiLogin,
  mdiAccountPlusOutline,
  mdiAlertCircleOutline,
} from '@mdi/js';

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types';

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Home',
      icon: mdiHomeOutline,
      path: '/'
    },
    {
      title: 'Dashboard',
      icon: mdiMonitorDashboard,
      path: '/dashboard'
    },
    {
      title: 'Account Settings',
      icon: mdiAccountCogOutline,
      path: '/account-settings'
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
