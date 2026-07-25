import type { ColumnSchemaType } from './columnSchema';
import { DEFAULT_COLUMN_COLOR } from './constants';
import type { Column } from './types';

interface CreateColumnSchema extends ColumnSchemaType {
  order: number;
}

export const createColumn = (data: CreateColumnSchema): Column => {
  const newColumn: Column = {
    id: `column-${window.crypto.randomUUID()}`,
    title: data.title,
    color: data.color ?? DEFAULT_COLUMN_COLOR,
    order: data.order,
  };

  return newColumn;
};
