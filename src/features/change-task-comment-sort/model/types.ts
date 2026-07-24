export const TASK_COMMENT_SORT_ORDER = {
  Asc: 'asc',
  Desc: 'desc',
} as const;

export type TaskCommentSortOrder =
  (typeof TASK_COMMENT_SORT_ORDER)[keyof typeof TASK_COMMENT_SORT_ORDER];

export const isTaskCommentSortOrder = (value: unknown): value is TaskCommentSortOrder => {
  return value === TASK_COMMENT_SORT_ORDER.Asc || value === TASK_COMMENT_SORT_ORDER.Desc;
};
