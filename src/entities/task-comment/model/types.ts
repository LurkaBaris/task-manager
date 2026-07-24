export interface TaskCommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file: Blob;
}

export interface TaskComment {
  id: string;
  taskId: string;
  text: string;
  createdAt: string;
  attachments: TaskCommentAttachment[];
}
