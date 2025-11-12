import type { ReportingBasis } from '@internal-types/general'
import { ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { type LineItemEncoded } from '@schemas/common/lineItem'
import { TagViewConfig } from '@internal-types/tags'

export interface TagComparisonOption {
  displayName: string
  tagFilterConfig: TagViewConfig
}

export interface ProfitAndLossCompareConfig {
  tagComparisonOptions: TagComparisonOption[]
  defaultTagFilter: TagComparisonOption

  /**
   * @deprecated This is a deprecated property - the number of periods to compare is derived from the date range.
   */
  defaultPeriods?: number
}

export interface ProfitAndLossComparison {
  type: string
  pnls: ProfitAndLossComparisonItem[]
}

export interface ProfitAndLossComparisonPnl {
  business_id: string
  start_date: string
  end_date: string
  income: LineItemEncoded
  cost_of_goods_sold: LineItemEncoded
  gross_profit: number
  expenses: LineItemEncoded
  profit_before_taxes: number
  taxes: LineItemEncoded
  net_profit: number
  other_outflows?: LineItemEncoded | null
  personal_expenses?: LineItemEncoded | null
  fully_categorized: boolean
}

type ProfitAndLossComparisonPeriods = {
  type: 'Comparison_Months'
  months: ReadonlyArrayWithAtLeastOne<{ year: number, month: number }>
} | {
  type: 'Comparison_Years'
  years: ReadonlyArrayWithAtLeastOne<{ year: number }>
} | {
  type: 'Comparison_Date_Ranges'
  date_ranges: ReadonlyArrayWithAtLeastOne<{ start_date: string, end_date: string }>
}

export type ProfitAndLossComparisonTags = {
  structure: string | undefined
  required_tags?: ReadonlyArray<{ key: string, value: string }>
}

export type ProfitAndLossComparisonRequestBody = {
  periods: ProfitAndLossComparisonPeriods
  tag_filters?: ReadonlyArrayWithAtLeastOne<ProfitAndLossComparisonTags>
  reporting_basis?: ReportingBasis
}

export interface ProfitAndLossComparisonItem {
  period: {
    type: string
    year?: number
    month?: number
    start_date?: string
    end_date?: string
  }
  tag_filter?: {
    key: string
    values: string[]
  }
  pnl: ProfitAndLossComparisonPnl
}
