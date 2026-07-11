import { ROUTES } from '@/shared/config'
import { Center, Loader } from '@mantine/core'
import { Suspense, type ReactNode } from 'react'
import { AppLayout } from '../ui/AppLayout'
import { LazyErrorPage, LazyHomePage, LazyStatisticPage, LazyTaskDetailsPage } from './lazyPages'

const withSuspense = (element: ReactNode) => {
  return (
    <Suspense
      fallback={
        <Center h="100%">
          <Loader size="sm" />
        </Center>
      }
    >
      {element}
    </Suspense>
  )
}

export const routes = [
  {
    element: <AppLayout />,
    errorElement: withSuspense(<LazyErrorPage />),
    children: [
      {
        path: ROUTES.HOME,
        element: withSuspense(<LazyHomePage />),
      },
      {
        path: ROUTES.STATISTIC,
        element: withSuspense(<LazyStatisticPage />),
      },
      {
        path: ROUTES.TASK_DETAILS,
        element: withSuspense(<LazyTaskDetailsPage />),
      },
    ],
  },
]
