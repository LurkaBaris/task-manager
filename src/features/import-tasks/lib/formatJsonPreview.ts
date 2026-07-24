const MAX_JSON_PREVIEW_LENGTH = 50_000;

const truncatePreview = (preview: string): string => {
  if (preview.length <= MAX_JSON_PREVIEW_LENGTH) return preview;

  return `${preview.slice(0, MAX_JSON_PREVIEW_LENGTH)}\n\n... Остальная часть скрыта`;
};

export const formatJsonPreview = (fileContent: string): string => {
  if (!fileContent) return 'Файл не выбран';

  try {
    const formattedContent = JSON.stringify(
      JSON.parse(fileContent),
      (key: string, value: unknown) => {
        if (key === 'data' && typeof value === 'string') {
          return `[Base64 вложения скрыт, ${value.length} символов]`;
        }

        return value;
      },
      2,
    );

    return truncatePreview(formattedContent);
  } catch {
    return truncatePreview(fileContent);
  }
};
