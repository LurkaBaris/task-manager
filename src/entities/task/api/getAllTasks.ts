import { taskRepository } from './taskRepository';

export const getAllTasks = () => taskRepository.getAll();
