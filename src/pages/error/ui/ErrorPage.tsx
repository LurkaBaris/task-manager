import { ErrorState } from '@/shared/ui'

interface ErrorPageProps {
  title?: string
  description?: string
  showReload?: boolean
}

export const ErrorPage = ({
  title = 'Что-то пошло не так',
  description = 'Попробуйте повторить действие или перезагрузить страницу',
  showReload = true,
}: ErrorPageProps) => {
  return <ErrorState title={title} description={description} showReload={showReload} />
}
