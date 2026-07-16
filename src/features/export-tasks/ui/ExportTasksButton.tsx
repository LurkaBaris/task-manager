import { getAllColumns } from '@/entities/column'
import { getAllTags } from '@/entities/tag'
import { getAllTasks } from '@/entities/task'
import { getAllTaskComments } from '@/entities/task-comment'
import { Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { createTasksBackup } from '../lib/createTasksBackup'
import { useDownloadJsonFile } from '../model/useDownloadJsonFile'

interface ExportTasksButtonProps {
  disabled?: boolean
}

export const ExportTasksButton = ({ disabled = false }: ExportTasksButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const downloadJsonFile = useDownloadJsonFile()

  const handleExport = async () => {
    if (isExporting) {
      return
    }

    setIsExporting(true)

    try {
      const [columns, tasks, tags, comments] = await Promise.all([
        getAllColumns(),
        getAllTasks(),
        getAllTags(),
        getAllTaskComments(),
      ])

      if (columns.length === 0) {
        notifications.show({
          title: 'Не удалось выгрузить данные',
          message: 'Создайте хотя бы одну колонку перед экспортом',
          color: 'red',
        })
        return
      }

      const taskIds = new Set(tasks.map((task) => task.id))
      const exportableComments = comments.filter((comment) => taskIds.has(comment.taskId))

      const backup = await createTasksBackup({
        columns,
        tasks,
        tags,
        comments: exportableComments,
      })

      downloadJsonFile('task-manager-backup.json', backup)

      notifications.show({
        title: 'Скачивание началось',
        message: `Экспортировано колонок: ${columns.length}, задач: ${tasks.length}, тегов: ${tags.length}, комментариев: ${exportableComments.length}`,
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
