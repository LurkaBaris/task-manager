import { getAllColumns } from '@/entities/column'
import { getAllTasks } from '@/entities/task'
import { Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { createTasksBackup } from '../lib/createTasksBackup'
import { downloadJsonFile } from '../lib/downloadJsonFile'

interface ExportTasksButtonProps {
  disabled?: boolean
}

export const ExportTasksButton = ({ disabled = false }: ExportTasksButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) {
      return
    }

    setIsExporting(true)

    try {
      const [columns, tasks] = await Promise.all([getAllColumns(), getAllTasks()])

      if (columns.length === 0) {
        notifications.show({
          title: 'Не удалось выгрузить данные',
          message: 'Создайте хотя бы одну колонку перед экспортом',
          color: 'red',
        })
        return
      }

      const backup = createTasksBackup({ columns, tasks })

      downloadJsonFile('task-manager-backup.json', backup)

      notifications.show({
        title: 'Скачивание началось',
        message: `Экспортировано колонок: ${columns.length}, задач: ${tasks.length}`,
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: 'Не удалось выгрузить задачи',
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      disabled={disabled || isExporting}
      leftSection={<Download size={16} strokeWidth={2} />}
      loading={isExporting}
      onClick={handleExport}
      type="button"
      variant="light"
    >
      Экспорт
    </Button>
  )
}
