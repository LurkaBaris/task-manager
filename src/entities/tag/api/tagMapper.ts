import type { TagDbRecord } from '@/shared/lib'
import { z } from 'zod'
import { tagSchema } from '../model/tagSchema'
import type { Tag } from '../model/types'

const tagDbRecordSchema = tagSchema.extend({
  id: z.string().trim().min(1),
})

export const mapTagFromDb = (record: TagDbRecord): Tag | null => {
  const result = tagDbRecordSchema.safeParse(record)

  if (!result.success) {
    console.error('Некорректный тег в IndexedDB', result.error)

    return null
  }

  return result.data
}

export const mapTagToDb = (tag: Tag): TagDbRecord => {
  return {
    id: tag.id,
    name: tag.name,
  }
}
