import type { TaskComment, TaskCommentAttachment } from '../model/types';

interface CreateTaskCommentParams {
  taskId: TaskComment['taskId'];
  text: string;
  files: File[];
}

interface UpdateTaskCommentParams {
  comment: TaskComment;
  text: string;
  files: File[];
}

type CreateOrUpdateTaskCommentParams = CreateTaskCommentParams | UpdateTaskCommentParams;

const createTaskCommentAttachments = (files: File[]): TaskCommentAttachment[] => {
  return files.map((file) => ({
    id: window.crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: file.size,
    file,
  }));
};

export const createOrUpdateTaskComment = (params: CreateOrUpdateTaskCommentParams): TaskComment => {
  const nextCommentData = {
    text: params.text.trim(),
    attachments: createTaskCommentAttachments(params.files),
  };

  if ('comment' in params) {
    return {
      ...params.comment,
      ...nextCommentData,
    };
  }

  return {
    id: window.crypto.randomUUID(),
    taskId: params.taskId,
    createdAt: new Date().toISOString(),
    ...nextCommentData,
  };
};
