import { IMPORT_TASKS_MODE, type ImportTasksMode } from '../model/types';

const IMPORT_TASKS_MODE_VALUES: readonly ImportTasksMode[] = Object.values(IMPORT_TASKS_MODE);

export const isImportTasksMode = (value: string): value is ImportTasksMode =>
  IMPORT_TASKS_MODE_VALUES.includes(value as ImportTasksMode);
