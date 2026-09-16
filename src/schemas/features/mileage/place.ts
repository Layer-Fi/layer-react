import { pipe, Schema } from 'effect'

export const PlaceSuggestionSchema = Schema.Struct({
  placeId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('place_id'),
  ),
  description: Schema.String,
})

export type PlaceSuggestion = typeof PlaceSuggestionSchema.Type

export const PlaceDetailsSchema = Schema.Struct({
  placeId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('place_id'),
  ),
  formattedAddress: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('formatted_address'),
  ),
  latitude: Schema.NullishOr(Schema.String),
  longitude: Schema.NullishOr(Schema.String),
})

export type PlaceDetails = typeof PlaceDetailsSchema.Type
