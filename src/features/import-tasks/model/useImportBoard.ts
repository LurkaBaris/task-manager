import {
  getAllColumns,
  normalizeColumnOrder,
  useColumnActions,
  type Column,
} from '@/entities/column'
import { getAllTags, useTagActions, type Tag } from '@/entities/tag'
import { getAllTasks, normalizeTasksByColumnId, useTaskActions, type Task } from '@/entities/task'
import {
  getAllTaskComments,
  sortTaskCommentsByCreatedAt,
  type TaskComment,
} from '@/entities/task-comment'
import { importBoardRepository } from '../api/importBoardRepository'
import { IMPORT_TASKS_MODE, type ImportTasksMode } from './types'

interface ImportBoardParams {
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
  comments: TaskComment[]
  mode: ImportTasksMode
}

const normalizeTagName = (name: string): string => {
  return name.trim().toLowerCase()
}

export const useImportBoard = () => {
  const { setColumns } = useColumnActions()
  const { setTasks } = useTaskActions()
  const { setTags } = useTagActions()

  const importBoard = async ({ columns, tasks, tags, comments, mode }: ImportBoardParams) => {
    let columnsToImport = columns
    let tasksToImport = tasks
    let tagsToImport = tags
    let commentsToImport = comments

    if (mode === IMPORT_TASKS_MODE.Merge) {
      const [currentColumns, currentTasks, currentTags, currentComments] = await Promise.all([
        getAllColumns(),
        getAllTasks(),
        getAllTags(),
        getAllTaskComments(),
      ])

      const columnsById = new Map(currentColumns.map((column) => [column.id, column]))
      const tagsById = new Map(currentTags.map((tag) => [tag.id, tag]))
      const tagIdByName = new Map(currentTags.map((tag) => [normalizeTagName(tag.name), tag.id]))
      const replacedTagIds = new Map<Tag['id'], Tag['id']>()
      const importedTaskIds = new Set(tasks.map((task) => task.id))
      const importedCommentIds = new Set(comments.map((comment) => comment.id))

      columns.forEach((column) => {
        columnsById.set(column.id, column)
      })

      tags.forEach((tag) => {
        const normalizedName = normalizeTagName(tag.name)
        const existingTagId = tagIdByName.get(normalizedName)

        if (existingTagId && existingTagId !== tag.id) {
          replacedTagIds.set(tag.id, existingTagId)
          return
        }

        tagsById.set(tag.id, tag)
        tagIdByName.set(normalizedName, tag.id)
      })

      const remappedTasks = tasks.map((task) => {
        if (!task.tagId) {
          return task
        }

        const nextTagId = replacedTagIds.get(task.tagId)

        if (!nextTagId) {
          return task
        }

        return {
          ...task,
          tagId: nextTagId,
        }
      })

      columnsToImport = [...columnsById.values()].sort((a, b) => a.order - b.order)
      tagsToImport = [...tagsById.values()]
      tasksToImport = [
        ...currentTasks.filter((task) => !importedTaskIds.has(task.id)),
        ...remappedTasks,
      ]
      commentsToImport = sortTaskCommentsByCreatedAt([
        ...currentComments.filter((comment) => !importedCommentIds.has(comment.id)),
        ...comments,
      ])
    }

    const normalizedColumns = normalizeColumnOrder(columnsToImport)
    const normalizedTasks = normalizeTasksByColumnId(tasksToImport)

    await importBoardRepository.replaceBoard({
      columns: normalizedColumns,
      tasks: normalizedTasks,
      tags: tagsToImport,
      comments: commentsToImport,
    })

    setColumns(normalizedColumns)
    setTags(tagsToImport)
    setTasks(normalizedTasks)
  }

  return {
    importBoard,
  }
}
