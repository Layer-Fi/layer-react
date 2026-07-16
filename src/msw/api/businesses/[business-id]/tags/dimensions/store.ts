import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema } from '@schemas/tag'

import { createMockStore } from '@msw/utils/createMockStore'
import { tagDimensions } from '@fixtures/tagDimensions/mocks'

export const tagDimensionStore = createMockStore<TagDimension>(() => tagDimensions)

const decodeTagDimension = Schema.decodeSync(TagDimensionSchema)

export const makeFallbackTagDimension = (
  { id = crypto.randomUUID(), key }: { id?: string, key: string },
): TagDimension => decodeTagDimension({
  id,
  key,
  display_name: null,
  strictness: 'BALANCING',
  defined_values: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_visible: true,
})

/** Reads seed a stable fallback so repeated requests return the same dimension. */
export const findOrSeedTagDimension = (
  findExisting: (dimensions: readonly TagDimension[]) => TagDimension | undefined,
  fallbackFields: { id?: string, key: string },
): TagDimension => {
  const existing = findExisting(tagDimensionStore.all())
  if (existing) return existing

  const fallback = makeFallbackTagDimension(fallbackFields)
  tagDimensionStore.save(fallback)

  return fallback
}
