import 'fake-indexeddb/auto'
import type { Task } from '@/entities/task'
import { describe, expect, it } from 'vitest'
import { TASK_SORT_ORDER } from '../model/sort'
import { sortTasksBySortOrder } from './sortTasksBySortOrder'

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Тестовая задача',
  description: 'Описание тестовой задачи',
  columnId: 'todo',
  priority: 'medium',
  type: 'task',
  position: 1000,
  createdAt: '2026-07-15T10:00:00.000Z',
  ...overrides,
})

const getTaskIds = (tasks: Task[]) => tasks.map((task) => task.id)

describe('sortTasksBySortOrder', () => {
  it('сортирует задачи правильно по позиции', () => {
    const tasks = [
      createTask({
        id: 'task-3',
        position: 3000,
      }),
      createTask({
        id: 'task-1',
        position: 1000,
      }),
      createTask({
        id: 'task-2',
        position: 2000,
      }),
    ]

    const result = sortTasksBySortOrder(tasks, TASK_SORT_ORDER.Manual)

    expect(getTaskIds(result)).toEqual(['task-1', 'task-2', 'task-3'])
  })

  it('сортирует новые задачи сверху', () => {
    const tasks = [
      createTask({
        id: 'old-task',
        createdAt: '2026-07-14T10:00:00.000Z',
      }),
      createTask({
        id: 'new-task',
        createdAt: '2026-07-16T10:00:00.000Z',
      }),
      createTask({
        id: 'middle-task',
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
    ]

    const result = sortTasksBySortOrder(tasks, TASK_SORT_ORDER.Newest)

    expect(getTaskIds(result)).toEqual(['new-task', 'middle-task', 'old-task'])
  })

  it('сортирует старые задачи сверху', () => {
    const tasks = [
      createTask({
        id: 'middle-task',
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
      createTask({
        id: 'new-task',
        createdAt: '2026-07-16T10:00:00.000Z',
      }),
      createTask({
        id: 'old-task',
        createdAt: '2026-07-14T10:00:00.000Z',
      }),
    ]

    const result = sortTasksBySortOrder(tasks, TASK_SORT_ORDER.Oldest)

    expect(getTaskIds(result)).toEqual(['old-task', 'middle-task', 'new-task'])
  })

  it('не меняет исходный массив', () => {
    const tasks = [
      createTask({
        id: 'task-2',
        createdAt: '2026-07-16T10:00:00.000Z',
      }),
      createTask({
        id: 'task-1',
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
    ]

    sortTasksBySortOrder(tasks, TASK_SORT_ORDER.Oldest)

    expect(getTaskIds(tasks)).toEqual(['task-2', 'task-1'])
  })

  it('возвращает новый массив', () => {
    const tasks = [createTask()]

    const result = sortTasksBySortOrder(tasks, TASK_SORT_ORDER.Newest)

    expect(result).not.toBe(tasks)
  })

  it('возвращает пустой массив для пустого списка', () => {
    expect(sortTasksBySortOrder([], TASK_SORT_ORDER.Manual)).toEqual([])
  })

  it('корректно обрабатывает одну задачу', () => {
    const task = createTask()

    const result = sortTasksBySortOrder([task], TASK_SORT_ORDER.Oldest)

    expect(result).toEqual([task])
  })
})
