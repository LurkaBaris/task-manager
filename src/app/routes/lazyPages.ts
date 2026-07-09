import { lazy } from 'react'

export const LazyHomePage = lazy(() =>
  import('@/pages/home').then((module) => ({
    default: module.HomePage,
  })),
)

export const LazyStatisticPage = lazy(() =>
  import('@/pages/statistic').then((module) => ({
    default: module.StatisticPage,
  })),
)

export const LazyErrorPage = lazy(() =>
  import('@/pages/error').then((module) => ({
    default: module.ErrorPage,
  })),
)
