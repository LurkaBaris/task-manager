import { useEffect } from 'react'

const APP_NAME = 'Task Manager'

export const useDocumentTitle = (pageTitle?: string): void => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${APP_NAME}` : APP_NAME
  }, [pageTitle])
}
