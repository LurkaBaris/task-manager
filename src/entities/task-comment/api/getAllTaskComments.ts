import { taskCommentRepository } from './taskCommentRepository';

export const getAllTaskComments = () => taskCommentRepository.getAll();
