import type { ColumnDbRecord } from '@/shared/lib';
import { z } from 'zod';
import { columnSchema } from '../model/columnSchema';
import type { Column } from '../model/types';

const columnDbRecordSchema = columnSchema.extend({
  id: z.string().trim().min(1),
  order: z.number(),
});

export const mapColumnFromDb = (record: ColumnDbRecord): Column | null => {
  const result = columnDbRecordSchema.safeParse(record);

  if (!result.success) {
    console.error('Некорректная колонка в IndexedDB', result.error);

    return null;
  }

  return result.data;
};

export const mapColumnToDb = (column: Column): ColumnDbRecord => {
  return {
    id: column.id,
    title: column.title,
    color: column.color,
    order: column.order,
  };
};
