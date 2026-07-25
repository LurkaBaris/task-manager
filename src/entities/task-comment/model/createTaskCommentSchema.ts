import { z } from 'zod';

const MAX_FILES_COUNT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 1000;

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
];

const ACCEPTED_FILE_EXTENSIONS = ['.zip', '.rar'];

export const TASK_COMMENT_FILE_ACCEPT =
  'image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.txt,.zip,.rar';

export const TASK_COMMENT_FORM_DEFAULT_VALUES: TaskCommentFormValues = {
  text: '',
  files: [],
};

const isAcceptedFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();

  return (
    ACCEPTED_FILE_TYPES.includes(file.type) ||
    ACCEPTED_FILE_EXTENSIONS.some((extension) => fileName.endsWith(extension))
  );
};

export const taskCommentFormSchema = z
  .object({
    text: z
      .string()
      .max(MAX_TEXT_LENGTH, `Комментарий не должен быть длиннее ${MAX_TEXT_LENGTH} символов`),
    files: z
      .array(z.instanceof(File))
      .max(MAX_FILES_COUNT, `Можно прикрепить не больше ${MAX_FILES_COUNT} файлов`)
      .refine((files) => files.every(isAcceptedFile), {
        message: 'Можно прикрепить изображения, PDF, DOC, DOCX, TXT, ZIP или RAR',
      })
      .refine(
        (files) => {
          return files.every((file) => file.size <= MAX_FILE_SIZE);
        },
        {
          message: 'Размер одного файла не должен превышать 10 МБ',
        },
      ),
  })
  .refine(
    (values) => {
      return values.text.trim().length > 0 || values.files.length > 0;
    },
    {
      message: 'Добавьте текст или прикрепите файл',
      path: ['text'],
    },
  );

export type TaskCommentFormValues = z.infer<typeof taskCommentFormSchema>;
