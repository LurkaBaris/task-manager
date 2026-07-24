import type { TaskComment, TaskCommentAttachment } from '../model/types';

const IMAGE_FILE_EXTENSION = /\.(gif|jpe?g|png|webp)$/i;

export const isImageAttachment = (
  attachment: Pick<TaskCommentAttachment, 'name' | 'type'>,
): boolean => {
  return attachment.type.startsWith('image/') || IMAGE_FILE_EXTENSION.test(attachment.name);
};

export const sortTaskCommentsByCreatedAt = (comments: TaskComment[]): TaskComment[] => {
  return [...comments].sort((firstComment, secondComment) => {
    return new Date(firstComment.createdAt).getTime() - new Date(secondComment.createdAt).getTime();
  });
};

export const formatAttachmentSize = (size: number): string => {
  if (size < 1024) {
    return `${size} Б`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} КБ`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
};

export const formatCommentDate = (date: string): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
