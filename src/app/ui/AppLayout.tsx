import { selectColumns, useColumnActions, useColumnStore } from '@/entities/column'
import { useTaskActions } from '@/entities/task'
import { Alert, AppShell, Container } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { Header } from './header/Header'
import styles from './AppLayout.module.css'

export const AppLayout = () => {
  const [hasLoadError, setHasLoadError] = useState(false)
  const { columns, isLoaded: isColumnsLoaded } = useColumnStore(useShallow(selectColumns))
  const { loadColumns } = useColumnActions()
  const { loadTasksByColumnIds } = useTaskActions()
  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])
  const hasColumns = columns.length > 0

  useEffect(() => {
    const load = async () => {
      try {
        setHasLoadError(false)

        await loadColumns()
      } catch {
        setHasLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить колонки',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    load()
  }, [loadColumns])

  useEffect(() => {
    if (!isColumnsLoaded || hasLoadError || !hasColumns) {
      return
    }

    const load = async () => {
      try {
        setHasLoadError(false)

        await loadTasksByColumnIds(columnIds)
      } catch {
        setHasLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить задачи',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    load()
  }, [columnIds, hasColumns, hasLoadError, isColumnsLoaded, loadTasksByColumnIds])

  return (
    <AppShell className={styles.layout} header={{ height: 64 }}>
      <Header />

      <AppShell.Main className={styles.main}>
        <Container className={styles.container} size="xl">
          {hasLoadError ? (
            <Alert color="red" title="Не удалось загрузить данные">
              Попробуйте обновить страницу
            </Alert>
          ) : (
            <Outlet />
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
