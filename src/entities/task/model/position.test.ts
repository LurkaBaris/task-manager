import { TASK_POSITION_STEP } from '@/shared/config'
import { describe, expect, it } from 'vitest'
import {
  getNextTaskPosition,
  getTaskPositionAfterNormalization,
  normalizeTaskPositions,
  normalizeTaskPositionsByOrder,
  sortTasksByPosition,
} from './position'
import type { Task } from './types'

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Тестовая задача',
  description: 'Описание тестовой задачи',
  columnId: 'todo',
  priority: 'medium',
  type: 'task',
  position: TASK_POSITION_STEP,
  createdAt: '2026-07-15T10:00:00.000Z',
  ...overrides,
})

const copyTasks = (tasks: Task[]): Task[] => tasks.map((task) => ({ ...task }))

describe('sortTasksByPosition', () => {
  it('сортирует задачи по позиции по возрастанию', () => {
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

    const result = sortTasksByPosition(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-1', 'task-2', 'task-3'])
  })

  it('при одинаковой позиции сортирует задачи по дате создания', () => {
    const tasks = [
      createTask({
        id: 'task-2',
        position: 1000,
        createdAt: '2026-07-15T12:00:00.000Z',
      }),
      createTask({
        id: 'task-1',
        position: 1000,
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
      createTask({
        id: 'task-3',
        position: 1000,
        createdAt: '2026-07-15T14:00:00.000Z',
      }),
    ]

    const result = sortTasksByPosition(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-1', 'task-2', 'task-3'])
  })

  it('при одинаковой позиции и дате сортирует задачи по id', () => {
    const createdAt = '2026-07-15T10:00:00.000Z'

    const tasks = [
      createTask({
        id: 'task-c',
        position: 1000,
        createdAt,
      }),
      createTask({
        id: 'task-a',
        position: 1000,
        createdAt,
      }),
      createTask({
        id: 'task-b',
        position: 1000,
        createdAt,
      }),
    ]

    const result = sortTasksByPosition(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-a', 'task-b', 'task-c'])
  })

  it('использует позицию как основной критерий сортировки', () => {
    const tasks = [
      createTask({
        id: 'task-a',
        position: 2000,
        createdAt: '2026-07-14T10:00:00.000Z',
      }),
      createTask({
        id: 'task-z',
        position: 1000,
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
    ]

    const result = sortTasksByPosition(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-z', 'task-a'])
  })

  it('не изменяет исходный массив', () => {
    const tasks = [
      createTask({
        id: 'task-2',
        position: 2000,
      }),
      createTask({
        id: 'task-1',
        position: 1000,
      }),
    ]

    const tasksBeforeSorting = copyTasks(tasks)

    sortTasksByPosition(tasks)

    expect(tasks).toEqual(tasksBeforeSorting)
  })

  it('возвращает новый массив', () => {
    const tasks = [createTask()]

    const result = sortTasksByPosition(tasks)

    expect(result).not.toBe(tasks)
  })

  it('возвращает пустой массив для пустого списка', () => {
    expect(sortTasksByPosition([])).toEqual([])
  })

  it('корректно обрабатывает одну задачу', () => {
    const task = createTask()

    const result = sortTasksByPosition([task])

    expect(result).toEqual([task])
  })
})

describe('getNextTaskPosition', () => {
  it('возвращает стандартный шаг для пустого списка', () => {
    expect(getNextTaskPosition([])).toBe(TASK_POSITION_STEP)
  })

  it('возвращает позицию после последней задачи', () => {
    const tasks = [
      createTask({
        id: 'task-1',
        position: 1000,
      }),
      createTask({
        id: 'task-2',
        position: 2000,
      }),
    ]

    const result = getNextTaskPosition(tasks)

    expect(result).toBe(2000 + TASK_POSITION_STEP)
  })

  it('находит последнюю задачу независимо от порядка массива', () => {
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

    const result = getNextTaskPosition(tasks)

    expect(result).toBe(3000 + TASK_POSITION_STEP)
  })

  it('корректно обрабатывает одинаковые максимальные позиции', () => {
    const tasks = [
      createTask({
        id: 'task-1',
        position: 2000,
      }),
      createTask({
        id: 'task-2',
        position: 2000,
      }),
    ]

    const result = getNextTaskPosition(tasks)

    expect(result).toBe(2000 + TASK_POSITION_STEP)
  })

  it('не изменяет исходный массив', () => {
    const tasks = [
      createTask({
        id: 'task-2',
        position: 2000,
      }),
      createTask({
        id: 'task-1',
        position: 1000,
      }),
    ]

    const tasksBeforeCalculation = copyTasks(tasks)

    getNextTaskPosition(tasks)

    expect(tasks).toEqual(tasksBeforeCalculation)
  })
})

describe('normalizeTaskPositions', () => {
  it('сортирует задачи и назначает позиции с заданным шагом', () => {
    const tasks = [
      createTask({
        id: 'task-3',
        position: 101,
      }),
      createTask({
        id: 'task-1',
        position: 99,
      }),
      createTask({
        id: 'task-2',
        position: 100,
      }),
    ]

    const result = normalizeTaskPositions(tasks)

    expect(
      result.map((task) => ({
        id: task.id,
        position: task.position,
      })),
    ).toEqual([
      {
        id: 'task-1',
        position: TASK_POSITION_STEP,
      },
      {
        id: 'task-2',
        position: TASK_POSITION_STEP * 2,
      },
      {
        id: 'task-3',
        position: TASK_POSITION_STEP * 3,
      },
    ])
  })

  it('учитывает дату создания при одинаковых позициях', () => {
    const tasks = [
      createTask({
        id: 'task-new',
        position: 1000,
        createdAt: '2026-07-15T12:00:00.000Z',
      }),
      createTask({
        id: 'task-old',
        position: 1000,
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
    ]

    const result = normalizeTaskPositions(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-old', 'task-new'])

    expect(result.map((task) => task.position)).toEqual([
      TASK_POSITION_STEP,
      TASK_POSITION_STEP * 2,
    ])
  })

  it('учитывает id при одинаковых позициях и датах', () => {
    const createdAt = '2026-07-15T10:00:00.000Z'

    const tasks = [
      createTask({
        id: 'task-b',
        position: 1000,
        createdAt,
      }),
      createTask({
        id: 'task-a',
        position: 1000,
        createdAt,
      }),
    ]

    const result = normalizeTaskPositions(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-a', 'task-b'])
  })

  it('сохраняет остальные свойства задач', () => {
    const task = createTask({
      id: 'task-special',
      title: 'Важная задача',
      description: 'Особое описание',
      columnId: 'done',
      priority: 'high',
      type: 'bug',
      position: 17,
    })

    const [result] = normalizeTaskPositions([task])

    expect(result).toEqual({
      ...task,
      position: TASK_POSITION_STEP,
    })
  })

  it('не изменяет исходный массив и задачи', () => {
    const tasks = [
      createTask({
        id: 'task-2',
        position: 101,
      }),
      createTask({
        id: 'task-1',
        position: 100,
      }),
    ]

    const tasksBeforeNormalization = copyTasks(tasks)

    normalizeTaskPositions(tasks)

    expect(tasks).toEqual(tasksBeforeNormalization)
  })

  it('создаёт новые объекты задач', () => {
    const tasks = [
      createTask({
        id: 'task-1',
      }),
      createTask({
        id: 'task-2',
      }),
    ]

    const result = normalizeTaskPositions(tasks)

    expect(result[0]).not.toBe(tasks[0])
    expect(result[1]).not.toBe(tasks[1])
  })

  it('возвращает пустой массив для пустого списка', () => {
    expect(normalizeTaskPositions([])).toEqual([])
  })
})

describe('normalizeTaskPositionsByOrder', () => {
  it('сохраняет текущий порядок задач', () => {
    const tasks = [
      createTask({
        id: 'task-3',
        position: 300,
      }),
      createTask({
        id: 'task-1',
        position: 100,
      }),
      createTask({
        id: 'task-2',
        position: 200,
      }),
    ]

    const result = normalizeTaskPositionsByOrder(tasks)

    expect(result.map((task) => task.id)).toEqual(['task-3', 'task-1', 'task-2'])
  })

  it('назначает позиции с заданным шагом в порядке массива', () => {
    const tasks = [
      createTask({
        id: 'task-3',
        position: 300,
      }),
      createTask({
        id: 'task-1',
        position: 100,
      }),
      createTask({
        id: 'task-2',
        position: 200,
      }),
    ]

    const result = normalizeTaskPositionsByOrder(tasks)

    expect(result.map((task) => task.position)).toEqual([
      TASK_POSITION_STEP,
      TASK_POSITION_STEP * 2,
      TASK_POSITION_STEP * 3,
    ])
  })

  it('не изменяет исходный массив и задачи', () => {
    const tasks = [
      createTask({
        id: 'task-1',
        position: 50,
      }),
      createTask({
        id: 'task-2',
        position: 51,
      }),
    ]

    const tasksBeforeNormalization = copyTasks(tasks)

    normalizeTaskPositionsByOrder(tasks)

    expect(tasks).toEqual(tasksBeforeNormalization)
  })

  it('создаёт новые объекты задач', () => {
    const tasks = [
      createTask({
        id: 'task-1',
      }),
      createTask({
        id: 'task-2',
      }),
    ]

    const result = normalizeTaskPositionsByOrder(tasks)

    expect(result[0]).not.toBe(tasks[0])
    expect(result[1]).not.toBe(tasks[1])
  })

  it('возвращает пустой массив для пустого списка', () => {
    expect(normalizeTaskPositionsByOrder([])).toEqual([])
  })
})

describe('getTaskPositionAfterNormalization', () => {
  describe('без нормализации', () => {
    it('возвращает стандартную позицию, когда соседних задач нет', () => {
      const result = getTaskPositionAfterNormalization([], undefined, undefined)

      expect(result).toEqual({
        position: TASK_POSITION_STEP,
        normalizedTasks: null,
      })
    })

    it('возвращает половину позиции следующей задачи при вставке в начало', () => {
      const nextTask = createTask({
        id: 'task-next',
        position: 1000,
      })

      const result = getTaskPositionAfterNormalization([nextTask], undefined, nextTask)

      expect(result).toEqual({
        position: 500,
        normalizedTasks: null,
      })
    })

    it('округляет позицию вниз при вставке перед задачей', () => {
      const nextTask = createTask({
        id: 'task-next',
        position: 11,
      })

      const result = getTaskPositionAfterNormalization([nextTask], undefined, nextTask)

      expect(result.position).toBe(5)
      expect(result.normalizedTasks).toBeNull()
    })

    it('считает позицию 2 допустимой для вставки перед задачей', () => {
      const nextTask = createTask({
        id: 'task-next',
        position: 2,
      })

      const result = getTaskPositionAfterNormalization([nextTask], undefined, nextTask)

      expect(result).toEqual({
        position: 1,
        normalizedTasks: null,
      })
    })

    it('добавляет стандартный шаг при вставке после последней задачи', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1750,
      })

      const result = getTaskPositionAfterNormalization([previousTask], previousTask, undefined)

      expect(result).toEqual({
        position: 1750 + TASK_POSITION_STEP,
        normalizedTasks: null,
      })
    })

    it('возвращает середину между соседними задачами', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1000,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 2000,
      })

      const result = getTaskPositionAfterNormalization(
        [previousTask, nextTask],
        previousTask,
        nextTask,
      )

      expect(result).toEqual({
        position: 1500,
        normalizedTasks: null,
      })
    })

    it('округляет середину вниз при нечётном промежутке', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 10,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 15,
      })

      const result = getTaskPositionAfterNormalization(
        [previousTask, nextTask],
        previousTask,
        nextTask,
      )

      expect(result).toEqual({
        position: 12,
        normalizedTasks: null,
      })
    })

    it('не выполняет нормализацию при минимальном допустимом промежутке 2', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1000,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 1002,
      })

      const result = getTaskPositionAfterNormalization(
        [previousTask, nextTask],
        previousTask,
        nextTask,
      )

      expect(result).toEqual({
        position: 1001,
        normalizedTasks: null,
      })
    })
  })

  describe('с нормализацией', () => {
    it('нормализует задачи, когда между соседями нет свободной позиции', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1000,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 1001,
      })

      const result = getTaskPositionAfterNormalization(
        [previousTask, nextTask],
        previousTask,
        nextTask,
      )

      expect(result.position).toBe(TASK_POSITION_STEP + Math.floor(TASK_POSITION_STEP / 2))

      expect(
        result.normalizedTasks?.map((task) => ({
          id: task.id,
          position: task.position,
        })),
      ).toEqual([
        {
          id: 'task-previous',
          position: TASK_POSITION_STEP,
        },
        {
          id: 'task-next',
          position: TASK_POSITION_STEP * 2,
        },
      ])
    })

    it('нормализует задачи при одинаковых позициях соседей', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1000,
        createdAt: '2026-07-15T10:00:00.000Z',
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 1000,
        createdAt: '2026-07-15T11:00:00.000Z',
      })

      const result = getTaskPositionAfterNormalization(
        [previousTask, nextTask],
        previousTask,
        nextTask,
      )

      expect(result.position).toBe(TASK_POSITION_STEP + Math.floor(TASK_POSITION_STEP / 2))

      expect(result.normalizedTasks).not.toBeNull()
    })

    it('нормализует задачи при вставке перед задачей с позицией 1', () => {
      const nextTask = createTask({
        id: 'task-next',
        position: 1,
      })

      const result = getTaskPositionAfterNormalization([nextTask], undefined, nextTask)

      expect(result.position).toBe(Math.floor(TASK_POSITION_STEP / 2))

      expect(result.normalizedTasks).toEqual([
        {
          ...nextTask,
          position: TASK_POSITION_STEP,
        },
      ])
    })

    it('нормализует задачи при вставке перед задачей с неположительной позицией', () => {
      const nextTask = createTask({
        id: 'task-next',
        position: 0,
      })

      const result = getTaskPositionAfterNormalization([nextTask], undefined, nextTask)

      expect(result.position).toBe(Math.floor(TASK_POSITION_STEP / 2))

      expect(result.normalizedTasks).not.toBeNull()
    })

    it('нормализует весь список задач, а не только соседние задачи', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1000,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 1001,
      })

      const lastTask = createTask({
        id: 'task-last',
        position: 5000,
      })

      const result = getTaskPositionAfterNormalization(
        [lastTask, nextTask, previousTask],
        previousTask,
        nextTask,
      )

      expect(
        result.normalizedTasks?.map((task) => ({
          id: task.id,
          position: task.position,
        })),
      ).toEqual([
        {
          id: 'task-previous',
          position: TASK_POSITION_STEP,
        },
        {
          id: 'task-next',
          position: TASK_POSITION_STEP * 2,
        },
        {
          id: 'task-last',
          position: TASK_POSITION_STEP * 3,
        },
      ])
    })

    it('находит соседние задачи после нормализации по id', () => {
      const previousTaskInList = createTask({
        id: 'task-previous',
        position: 1000,
      })

      const nextTaskInList = createTask({
        id: 'task-next',
        position: 1001,
      })

      const previousTaskArgument = {
        ...previousTaskInList,
      }

      const nextTaskArgument = {
        ...nextTaskInList,
      }

      const result = getTaskPositionAfterNormalization(
        [previousTaskInList, nextTaskInList],
        previousTaskArgument,
        nextTaskArgument,
      )

      expect(result.position).toBe(TASK_POSITION_STEP + Math.floor(TASK_POSITION_STEP / 2))

      expect(result.normalizedTasks).not.toBeNull()
    })

    it('не изменяет исходные задачи во время нормализации', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 1000,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 1001,
      })

      const tasks = [previousTask, nextTask]
      const tasksBeforeNormalization = copyTasks(tasks)

      getTaskPositionAfterNormalization(tasks, previousTask, nextTask)

      expect(tasks).toEqual(tasksBeforeNormalization)
    })
  })

  describe('ошибочные состояния', () => {
    it('выбрасывает ошибку, когда предыдущая задача находится после следующей', () => {
      const previousTask = createTask({
        id: 'task-previous',
        position: 2000,
      })

      const nextTask = createTask({
        id: 'task-next',
        position: 1000,
      })

      expect(() =>
        getTaskPositionAfterNormalization([previousTask, nextTask], previousTask, nextTask),
      ).toThrow('Не удалось изменить порядок даже после нормализации')
    })

    it('выбрасывает ошибку, когда предыдущей и следующей является одна задача', () => {
      const task = createTask({
        id: 'task-1',
        position: 1000,
      })

      expect(() => getTaskPositionAfterNormalization([task], task, task)).toThrow(
        'Не удалось изменить порядок даже после нормализации',
      )
    })
  })
})
