import { HomePage } from '@/pages/home'
import { ROUTES } from '@/shared/config'
import { AppLayout } from '../ui/AppLayout'

export const routes = [
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
    ],
  },
]
