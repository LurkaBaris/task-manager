export const ROUTES = {
  HOME: '/',
  STATISTIC: '/statistic',
  TASK_DETAILS: '/tasks/:taskId',
} as const

export const getTaskDetailsRoute = (taskId: string) => `/tasks/${taskId}`
