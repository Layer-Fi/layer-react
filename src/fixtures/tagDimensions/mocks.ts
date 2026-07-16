import { Schema } from 'effect'

import { type TagDimension, type TagValueDefinition, TagValueDefinitionSchema } from '@schemas/tag'

const decodeTagValueDefinition = Schema.decodeSync(TagValueDefinitionSchema)

export const makeTagValueDefinition = (
  { id = crypto.randomUUID(), key, value, displayName }:
  { id?: string, key: string, value: string, displayName?: string | null },
): TagValueDefinition => decodeTagValueDefinition({
  id,
  key,
  value,
  display_name: displayName ?? null,
  archived_at: null,
})

const jobDimension: TagDimension = {
  id: '00000000-0000-4000-8000-000000000401',
  key: 'job',
  displayName: 'Job',
  strictness: 'NON_BALANCING',
  definedValues: [
    makeTagValueDefinition({ id: '00000000-0000-4000-8000-000000000411', key: 'job', value: 'kitchen_remodel', displayName: 'Kitchen Remodel' }),
    makeTagValueDefinition({ id: '00000000-0000-4000-8000-000000000412', key: 'job', value: 'bathroom_remodel', displayName: 'Bathroom Remodel' }),
    makeTagValueDefinition({ id: '00000000-0000-4000-8000-000000000413', key: 'job', value: 'deck_construction', displayName: 'Deck Construction' }),
  ],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  userVisible: true,
}

const locationDimension: TagDimension = {
  id: '00000000-0000-4000-8000-000000000402',
  key: 'location',
  displayName: 'Location',
  strictness: 'NON_BALANCING',
  definedValues: [
    makeTagValueDefinition({ id: '00000000-0000-4000-8000-000000000421', key: 'location', value: 'new_york', displayName: 'New York' }),
    makeTagValueDefinition({ id: '00000000-0000-4000-8000-000000000422', key: 'location', value: 'san_francisco', displayName: 'San Francisco' }),
    makeTagValueDefinition({ id: '00000000-0000-4000-8000-000000000423', key: 'location', value: 'los_angeles', displayName: 'Los Angeles' }),
  ],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  userVisible: true,
}

export const tagDimensions: TagDimension[] = [jobDimension, locationDimension]
