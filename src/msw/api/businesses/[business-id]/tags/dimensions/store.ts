import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema, type TagValueDefinition, TagValueDefinitionSchema } from '@schemas/tag'

import { createMockStore } from '@msw/utils/createMockStore'
import { tagDimensions } from '@fixtures/tagDimensions/mocks'

export const tagDimensionStore = createMockStore<TagDimension>(() => tagDimensions)

const makeTagDimension = Schema.decodeSync(TagDimensionSchema)
const decodeTagValueDefinition = Schema.decodeSync(TagValueDefinitionSchema)

// The schema requires a UUID id, so fallbacks get a fresh one and carry the
// requested key.
export const makeFallbackTagDimension = (key: string): TagDimension => makeTagDimension({
  id: crypto.randomUUID(),
  key,
  display_name: null,
  strictness: 'BALANCING',
  defined_values: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_visible: true,
})

export const makeTagValueDefinition = (
  { key, value, displayName }: { key: string, value: string, displayName?: string | null },
): TagValueDefinition => decodeTagValueDefinition({
  id: crypto.randomUUID(),
  key,
  value,
  display_name: displayName ?? null,
  archived_at: null,
})
