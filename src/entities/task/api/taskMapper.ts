import type { TaskDbRecord } from '@/shared/lib';
import { z } from 'zod';
import { taskSchema } from '../model/taskSchema';
import type { Task } from '../model/types';

const taskDbRecordSchema = taskSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  position: z.number(),
});

export const mapTaskFromDb = (record: TaskDbRecord): Task | null => {
  const result = taskDbRecordSchema.safeParse(record);

  if (!result.success) {
    console.error('Некорректная задача в IndexedDB', result.error);

    return null;
  }

  return result.data;
};

export const mapTaskToDb = (task: Task): TaskDbRecord => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    createdAt: task.createdAt,
    columnId: task.columnId,
    priority: task.priority,
    position: task.position,
    type: task.type,
    tagId: task.tagId,
  };
};
