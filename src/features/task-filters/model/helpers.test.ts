import type { Task } from '@/entities/task'
import { describe, expect, it } from 'vitest'
import { isTaskMatchingFilters } from './helpers'
import type { TaskFilters } from './types'

const task: Task = {
  id: 'task-1',
  title: 'Исправить ошибку',
  description: '',
  createdAt: '2026-07-15T10:00:00.000Z',
  columnId: 'column-1',
  priority: 'high',
  position: 1000,
  type: 'bug',
  tagId: 'tag-1',
}

const emptyFilters: TaskFilters = {
  priorities: [],
  types: [],
  tagIds: [],
}

describe('isTaskMatchingFilters', () => {
  it('возвращает true, если фильтры не выбраны', () => {
    const result = isTaskMatchingFilters(task, emptyFilters)

    expect(result).toBe(true)
  })

  it('возвращает true, если приоритет задачи выбран', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      priorities: ['high'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(true)
  })

  it('возвращает false, если приоритет задачи не выбран', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      priorities: ['low'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(false)
  })

  it('возвращает true, если один из выбранных приоритетов совпадает', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      priorities: ['low', 'high'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(true)
  })

  it('возвращает true, если тип задачи выбран', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      types: ['bug'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(true)
  })

  it('возвращает false, если тип задачи не выбран', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      types: ['story'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(false)
  })

  it('возвращает true, если тег задачи выбран', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      tagIds: ['tag-1'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(true)
  })

  it('возвращает false, если тег задачи не выбран', () => {
    const filters: TaskFilters = {
      ...emptyFilters,
      tagIds: ['tag-2'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(false)
  })

  it('возвращает false для задачи без тега, если выбран фильтр по тегам', () => {
    const taskWithoutTag: Task = {
      ...task,
      tagId: undefined,
    }
    const filters: TaskFilters = {
      ...emptyFilters,
      tagIds: ['tag-1'],
    }

    const result = isTaskMatchingFilters(taskWithoutTag, filters)

    expect(result).toBe(false)
  })

  it('возвращает true, если совпадают все выбранные группы фильтров', () => {
    const filters: TaskFilters = {
      priorities: ['high'],
      types: ['bug'],
      tagIds: ['tag-1'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(true)
  })

  it('возвращает false, если хотя бы одна группа фильтров не совпадает', () => {
    const filters: TaskFilters = {
      priorities: ['high'],
      types: ['story'],
      tagIds: ['tag-1'],
    }

    const result = isTaskMatchingFilters(task, filters)

    expect(result).toBe(false)
  })
})
