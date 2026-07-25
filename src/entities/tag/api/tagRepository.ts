import { appDbPromise } from '@/shared/lib';
import type { Tag } from '../model/types';
import { mapTagFromDb, mapTagToDb } from './tagMapper';

const TAGS_STORE_NAME = 'tags';
const TASKS_STORE_NAME = 'tasks';

export const tagRepository = {
  async getAll(): Promise<Tag[]> {
    const db = await appDbPromise;
    const records = await db.getAll(TAGS_STORE_NAME);

    return records.map(mapTagFromDb).filter((tag): tag is Tag => Boolean(tag));
  },

  async put(tag: Tag): Promise<void> {
    const db = await appDbPromise;

    await db.put(TAGS_STORE_NAME, mapTagToDb(tag));
  },

  async putMany(tags: Tag[]): Promise<void> {
    const db = await appDbPromise;
    const transaction = db.transaction(TAGS_STORE_NAME, 'readwrite');
    const tagStore = transaction.objectStore(TAGS_STORE_NAME);

    await Promise.all(tags.map((tag) => tagStore.put(mapTagToDb(tag))));
    await transaction.done;
  },

  async remove(id: Tag['id']): Promise<void> {
    const db = await appDbPromise;

    await db.delete(TAGS_STORE_NAME, id);
  },

  async removeUnusedMany(ids: Tag['id'][]): Promise<Tag['id'][]> {
    if (!ids.length) {
      return [];
    }

    const db = await appDbPromise;
    const tasks = await db.getAll(TASKS_STORE_NAME);
    const usedTagIds = new Set<string>();

    tasks.forEach((task) => {
      if (task.tagId) {
        usedTagIds.add(task.tagId);
      }
    });

    const uniqueIds = Array.from(new Set(ids));
    const unusedIds = uniqueIds.filter((id) => !usedTagIds.has(id));

    await Promise.all(unusedIds.map((id) => db.delete(TAGS_STORE_NAME, id)));

    return unusedIds;
  },
};
