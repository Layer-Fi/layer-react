import { type ReactNode } from 'react'

import { type TaxOverviewCategory, type TaxOverviewNextTax } from '@schemas/taxEstimates/overview'

export type SummaryCardProps = {
  categories: readonly TaxOverviewCategory[]
  className?: string
  headerAction?: ReactNode
  layout?: 'taxOverview' | 'summaryCard'
  nextTax: TaxOverviewNextTax
  title: string
  total: number
}
