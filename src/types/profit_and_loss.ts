import type { ReportingBasis } from '@internal-types/general'
import { ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { LineItem } from '@schemas/common/lineItem'
import { TagViewConfig } from '@internal-types/tags'

export interface TagComparisonOption {
  displayName: string
  tagFilterConfig: TagViewConfig
}

export interface ProfitAndLossCompareConfig {
  tagComparisonOptions: TagComparisonOption[]
  defaultTagFilter: TagComparisonOption
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
  income: LineItem
  cost_of_goods_sold: LineItem
  gross_profit: number
  expenses: LineItem
  profit_before_taxes: number
  taxes: LineItem
  net_profit: number
  other_outflows?: LineItem | null
  personal_expenses?: LineItem | null
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
