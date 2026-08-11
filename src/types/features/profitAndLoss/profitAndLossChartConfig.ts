export type ProfitAndLossChartColors = {
  /**
   * Ordered palette for the revenue scope. Categorized line items are assigned colors from this
   * list in order; once exhausted it cycles with reduced opacity.
   */
  revenue?: string[]
  /** Ordered palette for the expenses scope. */
  expenses?: string[]
  /**
   * Applied to uncategorized line items in both scopes. When omitted, donut slices keep the
   * default dot pattern and swatches use the neutral default.
   */
  uncategorized?: string
}

export type ProfitAndLossChartConfig = {
  /**
   * Shared by the scope donuts, the summary mini charts, and the summary tile swatches, so one
   * palette keeps them consistent.
   */
  colors?: ProfitAndLossChartColors
  /** The twelve-month bar and line chart. */
  trendChart?: {
    barSize?: number
    /**
     * Bar width once the chart is narrower than 620px. Defaults to half of `barSize`, matching
     * the built-in 20 to 10 ratio.
     */
    compactBarSize?: number
  }
  /** The scope donuts rendered by the detailed charts and the expenses summary card. */
  donutChart?: {
    innerRadius?: string | number
    outerRadius?: string | number
  }
}
