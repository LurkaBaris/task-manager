import type { TaskComment } from '../model/types';
import { taskCommentRepository } from './taskCommentRepository';

export const deleteTaskCommentsByTaskId = (taskId: TaskComment['taskId']) =>
  taskCommentRepository.deleteByTaskId(taskId);
