import { columnSchema, DEFAULT_COLUMNS, type Column } from '@/entities/column';
import { tagSchema, type Tag } from '@/entities/tag';
import { TASK_TYPES, taskSchema, type Task } from '@/entities/task';
import type { TaskComment, TaskCommentAttachment } from '@/entities/task-comment';
import { DEFAULT_TYPE } from '@/shared/config';
import { base64ToUint8Array } from 'uint8array-extras';
import { z } from 'zod';
import {
  LEGACY_TASKS_BACKUP_VERSION,
  PREVIOUS_TASKS_BACKUP_VERSION,
  SUPPORTED_TASKS_BACKUP_VERSION,
  TAGS_TASKS_BACKUP_VERSION,
} from './types';

const MAX_COMMENT_FILES_COUNT = 5;
const MAX_COMMENT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_COMMENT_FILE_BASE64_LENGTH = 4 * Math.ceil(MAX_COMMENT_FILE_SIZE / 3);
const MAX_COMMENT_TEXT_LENGTH = 1000;
const BASE64_PATTERN = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/;

const importedColumnSchema = columnSchema.extend({
  id: z.string().trim().min(1, 'У колонки должен быть id'),
  order: z.number().int().positive('Порядок колонки должен быть положительным числом'),
});

const importedTagSchema = tagSchema.extend({
  id: z.string().trim().min(1, 'У тега должен быть id'),
});

export const importedTaskSchema = taskSchema.extend({
  id: z.string().trim().min(1, 'У задачи должен быть id'),
  createdAt: z.iso.datetime('Дата создания задачи должна быть корректной'),
  position: z.number().int().positive('Позиция задачи должна быть положительным числом'),
  type: z.enum(TASK_TYPES).default(DEFAULT_TYPE),
});

const importedCommentAttachmentSchema = z
  .object({
    id: z.string().trim().min(1, 'У вложения должен быть id'),
    name: z.string().trim().min(1, 'У вложения должно быть название'),
    type: z.string(),
    size: z.number().int().nonnegative('Размер вложения должен быть положительным числом'),
    data: z
      .string()
      .max(MAX_COMMENT_FILE_BASE64_LENGTH, 'Размер одного вложения не должен превышать 10 МБ')
      .regex(BASE64_PATTERN, 'Вложение должно быть закодировано в Base64'),
  })
  .strict();

const importedCommentSchema = z
  .object({
    id: z.string().trim().min(1, 'У комментария должен быть id'),
    taskId: z.string().trim().min(1, 'У комментария должен быть id задачи'),
    text: z
      .string()
      .max(
        MAX_COMMENT_TEXT_LENGTH,
        `Комментарий не должен быть длиннее ${MAX_COMMENT_TEXT_LENGTH} символов`,
      ),
    createdAt: z.iso.datetime('Дата создания комментария должна быть корректной'),
    attachments: z
      .array(importedCommentAttachmentSchema)
      .max(
        MAX_COMMENT_FILES_COUNT,
        `У комментария не может быть больше ${MAX_COMMENT_FILES_COUNT} вложений`,
      ),
  })
  .strict();

const legacyBackupSchema = z
  .object({
    version: z.literal(LEGACY_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    tasks: z.array(importedTaskSchema),
  })
  .strict();

const previousBackupSchema = z
  .object({
    version: z.literal(PREVIOUS_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    columns: z.array(importedColumnSchema).min(1, 'В файле должна быть хотя бы одна колонка'),
    tasks: z.array(importedTaskSchema),
  })
  .strict();

const tagsBackupSchema = z
  .object({
    version: z.literal(TAGS_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    columns: z.array(importedColumnSchema).min(1, 'В файле должна быть хотя бы одна колонка'),
    tasks: z.array(importedTaskSchema),
    tags: z.array(importedTagSchema),
  })
  .strict();

const currentBackupSchema = z
  .object({
    version: z.literal(SUPPORTED_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    columns: z.array(importedColumnSchema).min(1, 'В файле должна быть хотя бы одна колонка'),
    tasks: z.array(importedTaskSchema),
    tags: z.array(importedTagSchema),
    comments: z.array(importedCommentSchema),
  })
  .strict();

const decodeAttachment = (
  attachment: z.infer<typeof importedCommentAttachmentSchema>,
): TaskCommentAttachment => {
  const bytes = base64ToUint8Array(attachment.data);

  return {
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    file: new Blob([bytes], { type: attachment.type }),
  };
};

export const tasksBackupSchema = z
  .discriminatedUnion('version', [
    legacyBackupSchema,
    previousBackupSchema,
    tagsBackupSchema,
    currentBackupSchema,
  ])
  .transform(
    (
      backup,
    ): {
      version: typeof SUPPORTED_TASKS_BACKUP_VERSION;
      exportedAt: string;
      columns: Column[];
      tasks: Task[];
      tags: Tag[];
      comments: TaskComment[];
    } => {
      if (backup.version === LEGACY_TASKS_BACKUP_VERSION) {
        return {
          version: SUPPORTED_TASKS_BACKUP_VERSION,
          exportedAt: backup.exportedAt,
          columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
          tasks: backup.tasks,
          tags: [],
          comments: [],
        };
      }

      if (backup.version === PREVIOUS_TASKS_BACKUP_VERSION) {
        return {
          version: SUPPORTED_TASKS_BACKUP_VERSION,
          exportedAt: backup.exportedAt,
          columns: backup.columns,
          tasks: backup.tasks,
          tags: [],
          comments: [],
        };
      }

      if (backup.version === TAGS_TASKS_BACKUP_VERSION) {
        return {
          version: SUPPORTED_TASKS_BACKUP_VERSION,
          exportedAt: backup.exportedAt,
          columns: backup.columns,
          tasks: backup.tasks,
          tags: backup.tags,
          comments: [],
        };
      }

      return {
        version: backup.version,
        exportedAt: backup.exportedAt,
        columns: backup.columns,
        tasks: backup.tasks,
        tags: backup.tags,
        comments: backup.comments.map((comment) => ({
          id: comment.id,
          taskId: comment.taskId,
          text: comment.text,
          createdAt: comment.createdAt,
          attachments: comment.attachments.map(decodeAttachment),
        })),
      };
    },
  )
  .superRefine((backup, ctx) => {
    const exportedAtTime = Date.parse(backup.exportedAt);
    const nowWithClockSkew = Date.now() + 60_000;

    const columnIds = new Set<string>();
    const columnOrders = new Set<number>();
    const taskIds = new Set<string>();
    const tagIds = new Set<string>();
    const tagNames = new Set<string>();
    const commentIds = new Set<string>();
    const attachmentIds = new Set<string>();

    if (exportedAtTime > nowWithClockSkew) {
      ctx.addIssue({
        code: 'custom',
        message: 'Дата выгрузки не может быть в будущем',
        path: ['exportedAt'],
      });
    }

    backup.columns.forEach((column, index) => {
      if (columnIds.has(column.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся колонки',
          path: ['columns', index, 'id'],
        });
      }

      columnIds.add(column.id);

      if (columnOrders.has(column.order)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть колонки с одинаковым порядком',
          path: ['columns', index, 'order'],
        });
      }

      columnOrders.add(column.order);
    });

    backup.tags.forEach((tag, index) => {
      const normalizedTagName = tag.name.trim().toLowerCase();

      if (tagIds.has(tag.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся теги',
          path: ['tags', index, 'id'],
        });
      }

      tagIds.add(tag.id);

      if (tagNames.has(normalizedTagName)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть теги с одинаковым названием',
          path: ['tags', index, 'name'],
        });
      }

      tagNames.add(normalizedTagName);
    });

    backup.tasks.forEach((task, index) => {
      if (taskIds.has(task.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся задачи',
          path: ['tasks', index, 'id'],
        });
      }

      taskIds.add(task.id);

      if (!columnIds.has(task.columnId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Задача ссылается на колонку, которой нет в файле',
          path: ['tasks', index, 'columnId'],
        });
      }

      if (task.tagId && !tagIds.has(task.tagId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Задача ссылается на тег, которого нет в файле',
          path: ['tasks', index, 'tagId'],
        });
      }

      if (Date.parse(task.createdAt) > exportedAtTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Дата создания задачи не может быть позже даты выгрузки',
          path: ['tasks', index, 'createdAt'],
        });
      }
    });

    backup.comments.forEach((comment, commentIndex) => {
      if (commentIds.has(comment.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся комментарии',
          path: ['comments', commentIndex, 'id'],
        });
      }

      commentIds.add(comment.id);

      if (!taskIds.has(comment.taskId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Комментарий ссылается на задачу, которой нет в файле',
          path: ['comments', commentIndex, 'taskId'],
        });
      }

      if (Date.parse(comment.createdAt) > exportedAtTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Дата создания комментария не может быть позже даты выгрузки',
          path: ['comments', commentIndex, 'createdAt'],
        });
      }

      if (!comment.text.trim() && comment.attachments.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Комментарий должен содержать текст или вложение',
          path: ['comments', commentIndex],
        });
      }

      comment.attachments.forEach((attachment, attachmentIndex) => {
        if (attachmentIds.has(attachment.id)) {
          ctx.addIssue({
            code: 'custom',
            message: 'В файле есть повторяющиеся вложения',
            path: ['comments', commentIndex, 'attachments', attachmentIndex, 'id'],
          });
        }

        attachmentIds.add(attachment.id);

        if (attachment.file.size !== attachment.size) {
          ctx.addIssue({
            code: 'custom',
            message: 'Размер вложения не совпадает с данными файла',
            path: ['comments', commentIndex, 'attachments', attachmentIndex, 'size'],
          });
        }

        if (attachment.size > MAX_COMMENT_FILE_SIZE) {
          ctx.addIssue({
            code: 'custom',
            message: 'Размер одного вложения не должен превышать 10 МБ',
            path: ['comments', commentIndex, 'attachments', attachmentIndex, 'size'],
          });
        }
      });
    });
  });
