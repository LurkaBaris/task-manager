import type { Tag } from '../model/types';

interface ResolveSelectedTagParams {
  selectedTagId?: Tag['id'];
  draftTagName: string;
  tags: Tag[];
  createTagIfNotExists: (name: string) => Promise<Tag>;
}

export const resolveSelectedTag = async ({
  selectedTagId,
  draftTagName,
  tags,
  createTagIfNotExists,
}: ResolveSelectedTagParams) => {
  const normalizedDraftTagName = draftTagName.trim();

  if (selectedTagId) {
    return {
      tag: tags.find((tag) => tag.id === selectedTagId),
    };
  }

  if (!normalizedDraftTagName) {
    return {};
  }

  const existingTag = tags.find(
    (tag) => tag.name.toLowerCase() === normalizedDraftTagName.toLowerCase(),
  );
  const tag = await createTagIfNotExists(normalizedDraftTagName);

  return {
    tag,
    createdTag: existingTag ? undefined : tag,
  };
};
