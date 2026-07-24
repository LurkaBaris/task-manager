import type { TagSchemaType } from './tagSchema';
import type { Tag } from './types';

export const createTag = (data: TagSchemaType): Tag => {
  return {
    id: `tag-${window.crypto.randomUUID()}`,
    name: data.name.trim(),
  };
};
