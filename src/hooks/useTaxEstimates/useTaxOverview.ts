import useSWR from 'swr'
import { Schema } from 'effect'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { getTaxOverview } from '@api/layer/taxEstimates'
import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'
import { taxEstimateDefaults } from './mockData'
import { TaxOverviewResponseSchema } from '@schemas/taxEstimates'

type UseTaxOverviewOptions = {
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
      method: 'tax-overview',
      accessToken,
      apiUrl,
      businessId,
      year,
      tags: [TAX_ESTIMATES_TAG_KEY],
    } as const
  }
}

export function useTaxOverview({ year, useMockData = false }: UseTaxOverviewOptions = {}) {
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
        const totalDeductions = taxEstimateDefaults.deductibleExpenses
          + taxEstimateDefaults.deductibleMileage
          + taxEstimateDefaults.selfEmploymentDeduction
          + taxEstimateDefaults.qualifiedTipDeduction
          + taxEstimateDefaults.qualifiedOvertimeDeduction
          + taxEstimateDefaults.federalDeductions
          + taxEstimateDefaults.businessIncomeDeduction

        return Schema.decodeUnknownSync(TaxOverviewResponseSchema)({
          data: {
            taxable_income_estimate: taxEstimateDefaults.taxableIncome,
            excludes_pending_transactions: true,
            total_income: taxEstimateDefaults.businessIncome,
            deductions: totalDeductions,
            estimated_taxes: {
              total_owed: taxEstimateDefaults.projectedTaxesOwed,
              taxes_due_date: taxEstimateDefaults.taxesDueDate.toISOString().split('T')[0],
              federal: taxEstimateDefaults.federalTaxesOwed,
              state: taxEstimateDefaults.stateTaxesOwed,
            },
            deadlines: taxEstimateDefaults.quarterlyEstimates.map((q, index) => ({
              date: new Date(2025, [0, 3, 5, 8][index], 15).toISOString().split('T')[0],
              description: `${q.quarter} estimated tax due`,
              amount: q.amount,
            })),
          },
        })
      }

      return getTaxOverview(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
          },
        },
      )().then(Schema.decodeUnknownPromise(TaxOverviewResponseSchema))
    },
  )
}
