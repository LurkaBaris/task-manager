import type { TaskComment } from '../model/types';
import { taskCommentRepository } from './taskCommentRepository';

export const saveTaskComment = (comment: TaskComment) => taskCommentRepository.put(comment);
