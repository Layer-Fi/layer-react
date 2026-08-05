import { pipe, Schema } from 'effect'

export const TagValueDefinitionSchema = Schema.Struct({
  id: Schema.UUID,
  key: Schema.NonEmptyTrimmedString,
  value: Schema.NonEmptyTrimmedString,
  displayName: Schema.propertySignature(Schema.NullishOr(Schema.NonEmptyTrimmedString)).pipe(Schema.fromKey('display_name')),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('archived_at'),
  ),
})
export type TagValueDefinition = typeof TagValueDefinitionSchema.Type

export const isActiveTagValueDefinition = (tagValueDefinition: TagValueDefinition): boolean => tagValueDefinition.archivedAt == null
