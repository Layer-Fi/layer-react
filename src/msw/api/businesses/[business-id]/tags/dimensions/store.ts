import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema } from '@schemas/tag'

import { createMockStore } from '@msw/utils/createMockStore'
import { tagDimensions } from '@fixtures/tagDimensions/mocks'

export const tagDimensionStore = createMockStore<TagDimension>(() => tagDimensions)

const decodeTagDimension = Schema.decodeSync(TagDimensionSchema)

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

// The schema requires a UUID id: a UUID identifier is kept as the id so later
// reads by id still match; anything else becomes the key with a fresh id.
export const makeFallbackTagDimension = (identifier: string): TagDimension => decodeTagDimension({
  id: isUuid(identifier) ? identifier : crypto.randomUUID(),
  key: identifier,
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
  identifier: string,
): TagDimension => {
  const existing = findExisting(tagDimensionStore.all())
  if (existing) return existing

  const fallback = makeFallbackTagDimension(identifier)
  tagDimensionStore.save(fallback)

  return fallback
}
