import type { ACLObj } from '@/configs/acl'
import type { ReactElement, ReactNode } from 'react'
import type { NextComponentType, NextPageContext } from 'next/dist/shared/lib/utils'

declare module 'next' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export declare type NextPage<P = {}, IP = P> = NextComponentType<NextPageContext, IP, P> & {
    acl?: ACLObj
    authGuard?: boolean
    guestGuard?: boolean
    setConfig?: () => void
    getLayout?: (page: ReactElement) => ReactNode
  }
}
