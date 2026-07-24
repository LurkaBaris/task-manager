import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { tagRepository } from '../api/tagRepository';
import { createTag as createTagEntity } from './createTag';
import type { TagSchemaType } from './tagSchema';
import type { Tag } from './types';

interface ITagState {
  tags: Tag[];
  isLoaded: boolean;
}

interface ITagActions {
  loadTags: () => Promise<void>;
  createTag: (data: TagSchemaType) => Promise<Tag>;
  createTagIfNotExists: (name: string) => Promise<Tag>;
  removeTagsIfUnused: (ids: Tag['id'][]) => Promise<void>;
  setTags: (tags: Tag[]) => void;
}

type TagStore = ITagState & ITagActions;

const normalizeTagName = (name: string): string => {
  return name.trim();
};

const sortTagsByName = (tags: Tag[]): Tag[] => {
  return [...tags].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
};

const findTagByName = (tags: Tag[], name: string): Tag | undefined => {
  const normalizedName = normalizeTagName(name).toLowerCase();

  return tags.find((tag) => tag.name.toLowerCase() === normalizedName);
};

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  isLoaded: false,

  loadTags: async () => {
    if (get().isLoaded) {
      return;
    }

    const tags = await tagRepository.getAll();

    set({
      tags: sortTagsByName(tags),
      isLoaded: true,
    });
  },

  setTags: (tags) => {
    set({
      tags: [...tags].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
      isLoaded: true,
    });
  },

  createTag: async (data) => {
    await get().loadTags();

    const normalizedName = normalizeTagName(data.name);
    const existingTag = findTagByName(get().tags, normalizedName);

    if (existingTag) {
      return existingTag;
    }

    const tag = createTagEntity({
      name: normalizedName,
    });

    await tagRepository.put(tag);

    set((state) => ({
      tags: sortTagsByName([...state.tags, tag]),
    }));

    return tag;
  },

  createTagIfNotExists: async (name) => {
    await get().loadTags();

    const normalizedName = normalizeTagName(name);
    const existingTag = findTagByName(get().tags, normalizedName);

    if (existingTag) {
      return existingTag;
    }

    return get().createTag({
      name: normalizedName,
    });
  },

  removeTagsIfUnused: async (ids) => {
    const removedTagIds = await tagRepository.removeUnusedMany(ids);

    if (!removedTagIds.length) {
      return;
    }

    const removedTagIdsSet = new Set(removedTagIds);

    set((state) => ({
      tags: state.tags.filter((tag) => !removedTagIdsSet.has(tag.id)),
    }));
  },
}));

export const selectTags = (state: TagStore): ITagState => ({
  tags: state.tags,
  isLoaded: state.isLoaded,
});

export const useTagActions = () =>
  useTagStore(
    useShallow((state) => ({
      loadTags: state.loadTags,
      createTag: state.createTag,
      createTagIfNotExists: state.createTagIfNotExists,
      removeTagsIfUnused: state.removeTagsIfUnused,
      setTags: state.setTags,
    })),
  );
