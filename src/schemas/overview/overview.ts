import { Schema, pipe } from "effect";
import { CardSchema } from "./card";


export const OverviewSchema = Schema.Struct({
    id: Schema.UUID,
    businessId: pipe(
        Schema.propertySignature(Schema.UUID),
        Schema.fromKey('business_id')
    ),
    title: Schema.String,
    showBookKeeping: pipe(
        Schema.propertySignature(Schema.Boolean),
        Schema.fromKey('show_book_keeping')
    ),
    cards: Schema.Array(CardSchema),
    slotProps: pipe(
        Schema.propertySignature(Schema.Boolean),
        Schema.fromKey('slot_props')
    ),
    bannerProps: pipe(
        // Replace with banner prop schema/array of banner props
        Schema.propertySignature(Schema.String),
        Schema.fromKey('banner_props')
    )

})

export type Overview = typeof OverviewSchema.Type
export type OverviewEncoded = typeof OverviewSchema.Encoded
