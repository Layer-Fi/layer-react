import { type TagDimension, type TagValueDefinition } from '@schemas/tag'

const makeValueDefinition = (
  id: string,
  key: string,
  value: string,
  displayName: string,
): TagValueDefinition => ({
  id,
  key,
  value,
  displayName,
  archivedAt: null,
})

const entityDimension: TagDimension = {
  id: '00000000-0000-4000-8000-000000000401',
  key: 'entity',
  displayName: 'Entity',
  strictness: 'BALANCING',
  definedValues: [
    makeValueDefinition('00000000-0000-4000-8000-000000000411', 'entity', 'pc', 'PC'),
    makeValueDefinition('00000000-0000-4000-8000-000000000412', 'entity', 'mso', 'MSO'),
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
    makeValueDefinition('00000000-0000-4000-8000-000000000421', 'location', 'downtown', 'Downtown'),
    makeValueDefinition('00000000-0000-4000-8000-000000000422', 'location', 'uptown', 'Uptown'),
    makeValueDefinition('00000000-0000-4000-8000-000000000423', 'location', 'online', 'Online'),
  ],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  userVisible: true,
}

export const tagDimensions: TagDimension[] = [entityDimension, locationDimension]
