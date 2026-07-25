import { appDbPromise } from '@/shared/lib';
import type { Task } from '../model/types';
import { mapTaskFromDb, mapTaskToDb } from './taskMapper';

const TASKS_STORE_NAME = 'tasks';

export const taskRepository = {
  async getAll(): Promise<Task[]> {
    const db = await appDbPromise;
    const records = await db.getAll(TASKS_STORE_NAME);

    return records.map(mapTaskFromDb).filter((task): task is Task => task !== null);
  },

  async getByColumnId(columnId: Task['columnId']): Promise<Task[]> {
    const db = await appDbPromise;
    const records = await db.getAllFromIndex(TASKS_STORE_NAME, 'by-column-id', columnId);

    return records.map(mapTaskFromDb).filter((task): task is Task => task !== null);
  },

  async put(task: Task): Promise<void> {
    const db = await appDbPromise;

    await db.put(TASKS_STORE_NAME, mapTaskToDb(task));
  },

  async putMany(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) {
      return;
    }

    const db = await appDbPromise;
    const transaction = db.transaction(TASKS_STORE_NAME, 'readwrite');

    await Promise.all(tasks.map((task) => transaction.store.put(mapTaskToDb(task))));

    await transaction.done;
  },

  async delete(taskId: Task['id']): Promise<void> {
    const db = await appDbPromise;

    await db.delete(TASKS_STORE_NAME, taskId);
  },
};
