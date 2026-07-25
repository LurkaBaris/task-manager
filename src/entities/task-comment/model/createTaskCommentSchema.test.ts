import { describe, expect, it } from 'vitest';
import {
  TASK_COMMENT_FILE_ACCEPT,
  TASK_COMMENT_FORM_DEFAULT_VALUES,
  taskCommentFormSchema,
} from './createTaskCommentSchema';

const createFile = ({
  name = 'file.png',
  type = 'image/png',
  size = 1,
}: {
  name?: string;
  type?: string;
  size?: number;
} = {}) => {
  return new File([new Uint8Array(size)], name, { type });
};

const expectValidationError = (input: unknown, path: PropertyKey[]) => {
  const result = taskCommentFormSchema.safeParse(input);

  expect(result.success).toBe(false);

  if (!result.success) {
    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path })]),
    );
  }
};

describe('taskCommentFormSchema', () => {
  describe('текст комментария', () => {
    it('принимает комментарий только с текстом', () => {
      const input = {
        text: 'Новый комментарий',
        files: [],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает текст длиной 1000 символов', () => {
      const input = {
        text: 'a'.repeat(1000),
        files: [],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('отклоняет текст длиннее 1000 символов', () => {
      const input = {
        text: 'a'.repeat(1001),
        files: [],
      };

      expectValidationError(input, ['text']);
    });

    it('отклоняет пустой комментарий', () => {
      const input = {
        text: '',
        files: [],
      };

      expectValidationError(input, ['text']);
    });

    it('считает строку из пробелов пустым комментарием', () => {
      const input = {
        text: '   ',
        files: [],
      };

      expectValidationError(input, ['text']);
    });
  });

  describe('разрешенные файлы', () => {
    it('принимает комментарий только с файлом', () => {
      const input = {
        text: '',
        files: [createFile()],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает изображение', () => {
      const input = {
        text: '',
        files: [createFile({ name: 'photo.webp', type: 'image/webp' })],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает PDF', () => {
      const input = {
        text: '',
        files: [createFile({ name: 'document.pdf', type: 'application/pdf' })],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает DOCX', () => {
      const input = {
        text: '',
        files: [
          createFile({
            name: 'document.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }),
        ],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает текстовый файл', () => {
      const input = {
        text: '',
        files: [createFile({ name: 'notes.txt', type: 'text/plain' })],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает ZIP по расширению, даже если MIME-тип пустой', () => {
      const input = {
        text: '',
        files: [createFile({ name: 'archive.zip', type: '' })],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('принимает RAR без учета регистра расширения', () => {
      const input = {
        text: '',
        files: [createFile({ name: 'archive.RAR', type: '' })],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('отклоняет неподдерживаемый тип файла', () => {
      const input = {
        text: '',
        files: [createFile({ name: 'video.mp4', type: 'video/mp4' })],
      };

      expectValidationError(input, ['files']);
    });

    it('отклоняет обычный объект вместо File', () => {
      const input = {
        text: '',
        files: [{ name: 'file.png', type: 'image/png', size: 1 }],
      };

      expectValidationError(input, ['files', 0]);
    });
  });

  describe('ограничения файлов', () => {
    it('принимает пять файлов', () => {
      const files = Array.from({ length: 5 }, (_, index) =>
        createFile({ name: `image-${index}.png` }),
      );
      const input = {
        text: '',
        files,
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('отклоняет больше пяти файлов', () => {
      const files = Array.from({ length: 6 }, (_, index) =>
        createFile({ name: `image-${index}.png` }),
      );
      const input = {
        text: '',
        files,
      };

      expectValidationError(input, ['files']);
    });

    it('принимает файл размером ровно 10 МБ', () => {
      const input = {
        text: '',
        files: [createFile({ size: 10 * 1024 * 1024 })],
      };

      const result = taskCommentFormSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('отклоняет файл размером больше 10 МБ', () => {
      const input = {
        text: '',
        files: [createFile({ size: 10 * 1024 * 1024 + 1 })],
      };

      expectValidationError(input, ['files']);
    });
  });

  describe('настройки формы', () => {
    it('содержит пустые значения по умолчанию', () => {
      expect(TASK_COMMENT_FORM_DEFAULT_VALUES).toEqual({
        text: '',
        files: [],
      });
    });

    it('содержит разрешенные форматы для input', () => {
      expect(TASK_COMMENT_FILE_ACCEPT).toBe(
        'image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.txt,.zip,.rar',
      );
    });
  });
});
