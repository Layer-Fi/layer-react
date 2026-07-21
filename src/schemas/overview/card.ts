import { Schema, pipe } from "effect";

export enum CardType {
    ProfitAndLoss = 'PROFIT_AND_LOSS',
    Mileage = 'MILEAGE',
    Expenses = 'EXPENSES',
    TaxSummary = 'TAX_SUMMARY'
}

export const CardSchema = Schema.Struct({
    id: Schema.String,
    cardType: pipe(
        Schema.propertySignature(Schema.Enums(CardType)),
        Schema.fromKey('card_type')
    ),
    title: Schema.String,
    cardProps: pipe(
        // Will need to use proper types here
        Schema.propertySignature(Schema.Any),
        Schema.fromKey('card_props')
    ),
    // Replace with position info schema if necessary
    numColumns: pipe(
        Schema.propertySignature(Schema.Number),
        Schema.fromKey('num_columns')
    )



})

export type Card = typeof CardSchema.Type
export type CardEncoded = typeof CardSchema.Type
