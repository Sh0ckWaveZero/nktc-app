// ** Icon imports
import {
  HomeOutline,
  EmailOutline,
  ShieldOutline,
  AlertCircleOutline,
} from 'mdi-material-ui'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Home',
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
      title: '500',
      icon: AlertCircleOutline,
      path: '/500'
    },
  ]
}

export default navigation
