import { pipe, Schema } from 'effect'

const TaxableIncomeApiDataSchema = Schema.Struct({
  year: Schema.Number,
  federalTaxableIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('federal_taxable_income'),
  ),
  stateTaxableIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_taxable_income'),
  ),
})

export type TaxableIncomeApiData = typeof TaxableIncomeApiDataSchema.Type

export const TaxableIncomeApiResponseSchema = Schema.Struct({
  data: TaxableIncomeApiDataSchema,
})

export type TaxableIncomeApiResponse = typeof TaxableIncomeApiResponseSchema.Type
