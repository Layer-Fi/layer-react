import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'

export type SummaryChartProps = {
  categories: readonly TaxOverviewCategory[]
  total: number
}
