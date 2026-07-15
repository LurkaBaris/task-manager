import 'fake-indexeddb/auto'
import { DEFAULT_COLUMNS } from '@/entities/column'
import { DEFAULT_TYPE } from '@/shared/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { tasksBackupSchema } from './tasksBackupSchema'
import {
  LEGACY_TASKS_BACKUP_VERSION,
  PREVIOUS_TASKS_BACKUP_VERSION,
  SUPPORTED_TASKS_BACKUP_VERSION,
  TAGS_TASKS_BACKUP_VERSION,
} from './types'

const NOW = '2026-07-15T10:00:00.000Z'
const CREATED_AT = '2026-07-15T09:00:00.000Z'

const column = {
  ...DEFAULT_COLUMNS[0],
  id: 'column-1',
  order: 1000,
}

const tag = {
  id: 'tag-1',
  name: 'Frontend',
}

const task = {
  id: 'task-1',
  title: 'Написать тесты',
  description: '',
  columnId: column.id,
  priority: 'medium' as const,
  type: 'task' as const,
  tagId: tag.id,
  position: 1000,
  createdAt: CREATED_AT,
}

const attachment = {
  id: 'attachment-1',
  name: 'file.bin',
  type: 'application/octet-stream',
  size: 3,
  data: 'AQID',
}

const comment = {
  id: 'comment-1',
  taskId: task.id,
  text: 'Комментарий',
  createdAt: CREATED_AT,
  attachments: [attachment],
}

const createBackup = (overrides: Record<string, unknown> = {}) => ({
  version: SUPPORTED_TASKS_BACKUP_VERSION,
  exportedAt: NOW,
  columns: [column],
  tasks: [task],
  tags: [tag],
  comments: [comment],
  ...overrides,
})

const expectValidationError = (input: unknown, path: PropertyKey[]) => {
  const result = tasksBackupSchema.safeParse(input)

  expect(result.success).toBe(false)

  if (!result.success) {
    expect(result.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path })]))
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('tasksBackupSchema', () => {
  describe('валидный backup', () => {
    it('принимает backup текущей версии', () => {
      const result = tasksBackupSchema.safeParse(createBackup())

      expect(result.success).toBe(true)
    })

    it('декодирует Base64-вложение в Blob', async () => {
      const result = tasksBackupSchema.parse(createBackup())
      const file = result.comments[0].attachments[0].file
      const bytes = new Uint8Array(await file.arrayBuffer())

      expect(file).toBeInstanceOf(Blob)
      expect(file.type).toBe('application/octet-stream')
      expect([...bytes]).toEqual([1, 2, 3])
    })

    it('подставляет тип задачи по умолчанию', () => {
      const taskWithoutType = Object.fromEntries(
        Object.entries(task).filter(([key]) => key !== 'type'),
      )

      const result = tasksBackupSchema.parse(
        createBackup({
          tasks: [taskWithoutType],
        }),
      )

      expect(result.tasks[0].type).toBe(DEFAULT_TYPE)
    })
  })

  describe('миграции старых версий', () => {
    it('мигрирует версию 1', () => {
      const legacyTask = {
        ...task,
        columnId: DEFAULT_COLUMNS[0].id,
        tagId: undefined,
      }

      const result = tasksBackupSchema.parse({
        version: LEGACY_TASKS_BACKUP_VERSION,
        exportedAt: NOW,
        tasks: [legacyTask],
      })

      expect(result.version).toBe(SUPPORTED_TASKS_BACKUP_VERSION)
      expect(result.columns).toEqual(DEFAULT_COLUMNS)
      expect(result.tags).toEqual([])
      expect(result.comments).toEqual([])
    })

    it('мигрирует версию 2', () => {
      const previousTask = {
        ...task,
        tagId: undefined,
      }

      const result = tasksBackupSchema.parse({
        version: PREVIOUS_TASKS_BACKUP_VERSION,
        exportedAt: NOW,
        columns: [column],
        tasks: [previousTask],
      })

      expect(result.version).toBe(SUPPORTED_TASKS_BACKUP_VERSION)
      expect(result.columns).toEqual([column])
      expect(result.tags).toEqual([])
      expect(result.comments).toEqual([])
    })

    it('мигрирует версию 3', () => {
      const result = tasksBackupSchema.parse({
        version: TAGS_TASKS_BACKUP_VERSION,
        exportedAt: NOW,
        columns: [column],
        tasks: [task],
        tags: [tag],
      })

      expect(result.version).toBe(SUPPORTED_TASKS_BACKUP_VERSION)
      expect(result.columns).toEqual([column])
      expect(result.tags).toEqual([tag])
      expect(result.comments).toEqual([])
    })
  })

  describe('структура backup', () => {
    it('отклоняет backup без колонок', () => {
      const input = createBackup({ columns: [] })

      expectValidationError(input, ['columns'])
    })

    it('отклоняет нулевой порядок колонки', () => {
      const input = createBackup({
        columns: [{ ...column, order: 0 }],
      })

      expectValidationError(input, ['columns', 0, 'order'])
    })

    it('отклоняет дробную позицию задачи', () => {
      const input = createBackup({
        tasks: [{ ...task, position: 1.5 }],
      })

      expectValidationError(input, ['tasks', 0, 'position'])
    })

    it('отклоняет неизвестный тип задачи', () => {
      const input = createBackup({
        tasks: [{ ...task, type: 'unknown' }],
      })

      expectValidationError(input, ['tasks', 0, 'type'])
    })

    it('отклоняет некорректную дату создания задачи', () => {
      const input = createBackup({
        tasks: [{ ...task, createdAt: 'yesterday' }],
      })

      expectValidationError(input, ['tasks', 0, 'createdAt'])
    })

    it('отклоняет лишние поля', () => {
      const input = {
        ...createBackup(),
        unexpected: true,
      }

      expectValidationError(input, [])
    })
  })

  describe('дубликаты', () => {
    it('отклоняет одинаковые id колонок', () => {
      const input = createBackup({
        columns: [column, { ...column, order: 2000 }],
      })

      expectValidationError(input, ['columns', 1, 'id'])
    })

    it('отклоняет одинаковый порядок колонок', () => {
      const input = createBackup({
        columns: [column, { ...column, id: 'column-2' }],
      })

      expectValidationError(input, ['columns', 1, 'order'])
    })

    it('отклоняет одинаковые id задач', () => {
      const input = createBackup({
        tasks: [task, { ...task, position: 2000 }],
      })

      expectValidationError(input, ['tasks', 1, 'id'])
    })

    it('отклоняет одинаковые id тегов', () => {
      const input = createBackup({
        tags: [tag, { ...tag, name: 'Backend' }],
      })

      expectValidationError(input, ['tags', 1, 'id'])
    })

    it('сравнивает названия тегов без учета регистра и пробелов', () => {
      const input = createBackup({
        tags: [tag, { id: 'tag-2', name: ' frontend ' }],
      })

      expectValidationError(input, ['tags', 1, 'name'])
    })

    it('отклоняет одинаковые id комментариев', () => {
      const input = createBackup({
        comments: [comment, { ...comment, text: 'Другой комментарий' }],
      })

      expectValidationError(input, ['comments', 1, 'id'])
    })

    it('отклоняет одинаковые id вложений', () => {
      const secondComment = {
        ...comment,
        id: 'comment-2',
      }
      const input = createBackup({
        comments: [comment, secondComment],
      })

      expectValidationError(input, ['comments', 1, 'attachments', 0, 'id'])
    })
  })

  describe('связи между сущностями', () => {
    it('отклоняет задачу с неизвестной колонкой', () => {
      const input = createBackup({
        tasks: [{ ...task, columnId: 'missing-column' }],
      })

      expectValidationError(input, ['tasks', 0, 'columnId'])
    })

    it('отклоняет задачу с неизвестным тегом', () => {
      const input = createBackup({
        tasks: [{ ...task, tagId: 'missing-tag' }],
      })

      expectValidationError(input, ['tasks', 0, 'tagId'])
    })

    it('отклоняет комментарий с неизвестной задачей', () => {
      const input = createBackup({
        comments: [{ ...comment, taskId: 'missing-task' }],
      })

      expectValidationError(input, ['comments', 0, 'taskId'])
    })
  })

  describe('даты', () => {
    it('отклоняет задачу, созданную после выгрузки', () => {
      const input = createBackup({
        tasks: [{ ...task, createdAt: '2026-07-15T10:00:01.000Z' }],
      })

      expectValidationError(input, ['tasks', 0, 'createdAt'])
    })

    it('отклоняет комментарий, созданный после выгрузки', () => {
      const input = createBackup({
        comments: [{ ...comment, createdAt: '2026-07-15T10:00:01.000Z' }],
      })

      expectValidationError(input, ['comments', 0, 'createdAt'])
    })

    it('разрешает погрешность часов до одной минуты', () => {
      const input = createBackup({
        exportedAt: '2026-07-15T10:01:00.000Z',
      })

      const result = tasksBackupSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('отклоняет дату выгрузки дальше одной минуты в будущем', () => {
      const input = createBackup({
        exportedAt: '2026-07-15T10:01:01.000Z',
      })

      expectValidationError(input, ['exportedAt'])
    })
  })

  describe('комментарии и вложения', () => {
    it('разрешает комментарий только с текстом', () => {
      const textComment = {
        ...comment,
        attachments: [],
      }
      const input = createBackup({ comments: [textComment] })

      const result = tasksBackupSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('разрешает комментарий только с вложением', () => {
      const attachmentComment = {
        ...comment,
        text: '',
      }
      const input = createBackup({ comments: [attachmentComment] })

      const result = tasksBackupSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('отклоняет комментарий без текста и вложений', () => {
      const emptyComment = {
        ...comment,
        text: '   ',
        attachments: [],
      }
      const input = createBackup({ comments: [emptyComment] })

      expectValidationError(input, ['comments', 0])
    })

    it('отклоняет комментарий длиннее 1000 символов', () => {
      const input = createBackup({
        comments: [{ ...comment, text: 'a'.repeat(1001) }],
      })

      expectValidationError(input, ['comments', 0, 'text'])
    })

    it('отклоняет больше пяти вложений', () => {
      const attachments = Array.from({ length: 6 }, (_, index) => ({
        ...attachment,
        id: `attachment-${index}`,
      }))
      const input = createBackup({
        comments: [{ ...comment, attachments }],
      })

      expectValidationError(input, ['comments', 0, 'attachments'])
    })

    it('отклоняет некорректный Base64', () => {
      const invalidAttachment = {
        ...attachment,
        data: '***',
      }
      const input = createBackup({
        comments: [{ ...comment, attachments: [invalidAttachment] }],
      })

      expectValidationError(input, ['comments', 0, 'attachments', 0, 'data'])
    })

    it('отклоняет несовпадение размера вложения', () => {
      const invalidAttachment = {
        ...attachment,
        size: 4,
      }
      const input = createBackup({
        comments: [{ ...comment, attachments: [invalidAttachment] }],
      })

      expectValidationError(input, ['comments', 0, 'attachments', 0, 'size'])
    })
  })
})
