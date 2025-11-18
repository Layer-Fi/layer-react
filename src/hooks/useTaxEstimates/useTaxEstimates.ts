import useSWR from 'swr'
import { Schema } from 'effect'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { getTaxEstimates } from '@api/layer/taxEstimates'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useCallback } from 'react'
import { taxEstimateDefaults } from './mockData'
import { TaxEstimateResponseSchema } from '@schemas/taxEstimates'

export const TAX_ESTIMATES_TAG_KEY = '#tax-estimates'

type UseTaxEstimatesOptions = {
  year?: number
  useMockData?: boolean
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  year,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  year?: number
}) {
  if (accessToken && apiUrl) {
    return {
      method: 'tax-estimates',
      accessToken,
      apiUrl,
      businessId,
      year,
      tags: [TAX_ESTIMATES_TAG_KEY],
    } as const
  }
}

export function useTaxEstimates({ year, useMockData = false }: UseTaxEstimatesOptions = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ accessToken, apiUrl, businessId, year }) => {
      if (useMockData) {
        return Schema.decodeUnknownSync(TaxEstimateResponseSchema)({
          data: {
            projected_taxes_owed: taxEstimateDefaults.projectedTaxesOwed,
            taxes_due_date: taxEstimateDefaults.taxesDueDate.toISOString().split('T')[0],
            federal_taxes: {
              total: taxEstimateDefaults.federalTaxesOwed,
              taxes_owed: taxEstimateDefaults.federalTaxesOwed,
              taxes_paid: taxEstimateDefaults.federalTaxesPaid,
              breakdown: {
                adjusted_gross_income: taxEstimateDefaults.adjustedGrossIncome,
                standard_deduction: taxEstimateDefaults.federalDeductions,
                qbi_deduction: taxEstimateDefaults.businessIncomeDeduction,
                taxable_income: taxEstimateDefaults.taxableIncome,
                income_tax: taxEstimateDefaults.federalTaxEstimate,
                social_security_tax: taxEstimateDefaults.socialSecurityTaxEstimate,
                medicare_tax: taxEstimateDefaults.medicareTaxEstimate,
              },
            },
            state_taxes: {
              total: taxEstimateDefaults.stateTaxesOwed,
              taxes_owed: taxEstimateDefaults.stateTaxesOwed,
              taxes_paid: taxEstimateDefaults.stateTaxesPaid,
              breakdown: {
                taxable_income: taxEstimateDefaults.stateTaxableIncome,
                state_tax_estimate: taxEstimateDefaults.stateTaxEstimate,
              },
            },
            taxable_business_income: {
              business_income: taxEstimateDefaults.businessIncome,
              deductible_expenses: -taxEstimateDefaults.deductibleExpenses,
              deductible_mileage_expenses: -taxEstimateDefaults.deductibleMileage,
              self_employment_deduction: -taxEstimateDefaults.selfEmploymentDeduction,
              qualified_tip_deduction: -taxEstimateDefaults.qualifiedTipDeduction,
              qualified_overtime_deduction: -taxEstimateDefaults.qualifiedOvertimeDeduction,
              adjusted_gross_income: taxEstimateDefaults.adjustedGrossIncome,
            },
            quarterly_estimates: taxEstimateDefaults.quarterlyEstimates.map(q => ({
              quarter: q.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
              amount: q.amount,
              due_date: new Date(2025, [0, 3, 5, 8][['Q1', 'Q2', 'Q3', 'Q4'].indexOf(q.quarter)], 15).toISOString().split('T')[0],
            })),
          },
        })
      }

      return getTaxEstimates(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
          },
        },
      )().then(Schema.decodeUnknownPromise(TaxEstimateResponseSchema))
    },
  )
}

export const useTaxEstimatesGlobalCacheActions = () => {
  const { invalidate, forceReload } = useGlobalCacheActions()

  const invalidateTaxEstimates = useCallback(
    () => invalidate(tags => tags.includes(TAX_ESTIMATES_TAG_KEY)),
    [invalidate],
  )

  const forceReloadTaxEstimates = useCallback(
    () => forceReload(tags => tags.includes(TAX_ESTIMATES_TAG_KEY)),
    [forceReload],
  )

  return {
    invalidateTaxEstimates,
    forceReloadTaxEstimates,
  }
}
