import type { TaskComment } from '@/entities/task-comment';
import { describe, expect, it } from 'vitest';
import { TASK_COMMENT_SORT_ORDER } from '../model/types';
import { sortTaskCommentsByDate } from './sortTaskCommentsByDate';

const createComment = (overrides: Partial<TaskComment> = {}): TaskComment => ({
  id: 'comment-1',
  taskId: 'task-1',
  text: 'Тестовый комментарий',
  createdAt: '2026-07-15T10:00:00.000Z',
  attachments: [],
  ...overrides,
});

const getCommentIds = (comments: TaskComment[]) => comments.map((comment) => comment.id);

describe('sortTaskCommentsByDate', () => {
  it('сортирует комментарии по возрастанию даты', () => {
    const comments = [
      createComment({
        id: 'comment-3',
        createdAt: '2026-07-15T12:00:00.000Z',
      }),
      createComment({
        id: 'comment-1',
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
      createComment({
        id: 'comment-2',
        createdAt: '2026-07-15T11:00:00.000Z',
      }),
    ];

    const result = sortTaskCommentsByDate(comments, TASK_COMMENT_SORT_ORDER.Asc);

    expect(getCommentIds(result)).toEqual(['comment-1', 'comment-2', 'comment-3']);
  });

  it('сортирует комментарии по убыванию даты', () => {
    const comments = [
      createComment({
        id: 'comment-1',
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
      createComment({
        id: 'comment-3',
        createdAt: '2026-07-15T12:00:00.000Z',
      }),
      createComment({
        id: 'comment-2',
        createdAt: '2026-07-15T11:00:00.000Z',
      }),
    ];

    const result = sortTaskCommentsByDate(comments, TASK_COMMENT_SORT_ORDER.Desc);

    expect(getCommentIds(result)).toEqual(['comment-3', 'comment-2', 'comment-1']);
  });

  it('не меняет порядок комментариев с одинаковой датой', () => {
    const createdAt = '2026-07-15T10:00:00.000Z';
    const comments = [
      createComment({
        id: 'comment-1',
        createdAt,
      }),
      createComment({
        id: 'comment-2',
        createdAt,
      }),
    ];

    const result = sortTaskCommentsByDate(comments, TASK_COMMENT_SORT_ORDER.Asc);

    expect(getCommentIds(result)).toEqual(['comment-1', 'comment-2']);
  });

  it('не изменяет исходный массив', () => {
    const comments = [
      createComment({
        id: 'comment-2',
        createdAt: '2026-07-15T11:00:00.000Z',
      }),
      createComment({
        id: 'comment-1',
        createdAt: '2026-07-15T10:00:00.000Z',
      }),
    ];

    sortTaskCommentsByDate(comments, TASK_COMMENT_SORT_ORDER.Asc);

    expect(getCommentIds(comments)).toEqual(['comment-2', 'comment-1']);
  });

  it('возвращает новый массив', () => {
    const comments = [createComment()];

    const result = sortTaskCommentsByDate(comments, TASK_COMMENT_SORT_ORDER.Asc);

    expect(result).not.toBe(comments);
  });

  it('возвращает пустой массив для пустого списка', () => {
    expect(sortTaskCommentsByDate([], TASK_COMMENT_SORT_ORDER.Asc)).toEqual([]);
  });

  it('корректно обрабатывает один комментарий', () => {
    const comment = createComment();

    const result = sortTaskCommentsByDate([comment], TASK_COMMENT_SORT_ORDER.Desc);

    expect(result).toEqual([comment]);
  });
});
