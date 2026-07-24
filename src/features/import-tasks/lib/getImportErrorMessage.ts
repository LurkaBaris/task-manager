import { ZodError } from 'zod';
import {
  LEGACY_TASKS_BACKUP_VERSION,
  PREVIOUS_TASKS_BACKUP_VERSION,
  SUPPORTED_TASKS_BACKUP_VERSION,
  TAGS_TASKS_BACKUP_VERSION,
} from '../model/types';

type ImportIssue = ZodError['issues'][number];

const SUPPORTED_VERSIONS = [
  LEGACY_TASKS_BACKUP_VERSION,
  PREVIOUS_TASKS_BACKUP_VERSION,
  TAGS_TASKS_BACKUP_VERSION,
  SUPPORTED_TASKS_BACKUP_VERSION,
];

const DEFAULT_IMPORT_ERROR = 'Файл не соответствует формату выгрузки';
const ROOT_OBJECT_ERROR = 'Файл должен быть JSON-объектом формата экспорта';
const VERSION_ERROR = `Версия файла не поддерживается. Поддерживаются версии: ${SUPPORTED_VERSIONS.join(', ')}`;

const getIssuePath = (issue: ImportIssue): string => {
  return issue.path
    .map((pathPart) => (typeof pathPart === 'number' ? `[${pathPart + 1}]` : String(pathPart)))
    .join('.')
    .replace(/\.\[/g, '[');
};

const flattenIssues = (issue: ImportIssue): ImportIssue[] => {
  if (issue.code !== 'invalid_union') {
    return [issue];
  }

  return issue.errors.flatMap((issues) => issues.flatMap(flattenIssues));
};

const isRootInvalidTypeIssue = (issue: ImportIssue): boolean => {
  return issue.code === 'invalid_type' && issue.path.length === 0;
};

const isVersionIssue = (issue: ImportIssue): boolean => {
  return issue.path.length === 1 && issue.path[0] === 'version';
};

const isMissingFieldIssue = (issue: ImportIssue): boolean => {
  return issue.code === 'invalid_type' && 'input' in issue && issue.input === undefined;
};

const getReadableIssueMessage = (issue: ImportIssue): string => {
  if (isRootInvalidTypeIssue(issue)) {
    return ROOT_OBJECT_ERROR;
  }

  if (isVersionIssue(issue)) {
    return VERSION_ERROR;
  }

  if (issue.code === 'custom') {
    return issue.message;
  }

  const path = getIssuePath(issue);

  if (isMissingFieldIssue(issue)) {
    return path ? `В файле отсутствует поле "${path}"` : DEFAULT_IMPORT_ERROR;
  }

  if (issue.code === 'invalid_type') {
    return path ? `Поле "${path}" имеет неверный тип данных` : DEFAULT_IMPORT_ERROR;
  }

  if (issue.code === 'invalid_value') {
    return path ? `Поле "${path}" содержит неподдерживаемое значение` : DEFAULT_IMPORT_ERROR;
  }

  if (issue.code === 'unrecognized_keys') {
    const keys = issue.keys.join(', ');
    const objectPath = path ? ` в "${path}"` : '';

    return `В файле есть лишние поля${objectPath}: ${keys}`;
  }

  return issue.message || DEFAULT_IMPORT_ERROR;
};

const getMainIssue = (issues: ImportIssue[]): ImportIssue | undefined => {
  return (
    issues.find(isRootInvalidTypeIssue) ??
    issues.find(isVersionIssue) ??
    issues.find((issue) => issue.code === 'custom') ??
    issues.find(isMissingFieldIssue) ??
    issues.find((issue) => issue.path.length > 0) ??
    issues[0]
  );
};

export const getImportErrorMessage = (error: unknown): string => {
  if (error instanceof SyntaxError) {
    return 'Файл должен быть корректным JSON';
  }

  if (!(error instanceof ZodError)) {
    return 'Не удалось импортировать файл. Попробуйте еще раз';
  }

  const issues = error.issues.flatMap(flattenIssues);
  const mainIssue = getMainIssue(issues);

  return mainIssue ? getReadableIssueMessage(mainIssue) : DEFAULT_IMPORT_ERROR;
};
