import type { TaskComment } from '../model/types';
import { taskCommentRepository } from './taskCommentRepository';

export const restoreTaskComments = (comments: TaskComment[]) =>
  taskCommentRepository.restoreMany(comments);
