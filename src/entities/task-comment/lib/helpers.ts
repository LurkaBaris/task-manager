import type { TaskComment } from '../model/types'

export const sortTaskCommentsByCreatedAt = (comments: TaskComment[]): TaskComment[] => {
  return [...comments].sort((firstComment, secondComment) => {
    return new Date(firstComment.createdAt).getTime() - new Date(secondComment.createdAt).getTime()
  })
}

export const formatAttachmentSize = (size: number): string => {
  if (size < 1024) {
    return `${size} Б`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} КБ`
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`
}

export const formatCommentDate = (date: string): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
