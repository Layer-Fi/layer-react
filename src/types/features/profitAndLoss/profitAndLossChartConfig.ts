export type ProfitAndLossChartColors = {
  /** Ordered palette; cycles with reduced opacity once exhausted. */
  revenue?: string[]
  expenses?: string[]
  /** Omit to keep the dot-pattern donut fill and the neutral default swatch. */
  uncategorized?: string
}

export type ProfitAndLossChartConfig = {
  /** Shared by the donuts, the summary mini charts, and the summary tile swatches. */
  colors?: ProfitAndLossChartColors
  trendChart?: {
    barSize?: number
    /** Bar width below 620px wide. Defaults to half `barSize`. */
    compactBarSize?: number
  }
  donutChart?: {
    innerRadius?: string | number
    outerRadius?: string | number
  }
}
