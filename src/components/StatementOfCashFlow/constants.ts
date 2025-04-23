export const STATEMENT_OF_CASH_FLOW_ROWS = [
  {
    name: 'OperatingActivities',
    displayName: 'Operating Activities',
    lineItem: 'operating_activities',
    type: 'line_item',
    summarize: true,
  },
  {
    name: 'InvestingActivities',
    displayName: 'Investing Activities',
    lineItem: 'investing_activities',
    type: 'line_item',
    summarize: true,
  },
  {
    name: 'FinancingActivities',
    displayName: 'Financing Activities',
    lineItem: 'financing_activities',
    type: 'line_item',
    summarize: true,
  },
  {
    name: 'PeriodNetCashIncrease',
    displayName: 'Net Cash Increase For Period',
    lineItem: 'period_net_cash_increase',
    type: 'summary_value',
    summarize: false,
  },
  {
    name: 'CashAtBeginningOfPeriod',
    displayName: 'Cash at Beginning of Period',
    lineItem: 'cash_at_beginning_of_period',
    type: 'summary_value',
    summarize: false,
  },
  {
    name: 'CashAtEndOfPeriod',
    displayName: 'Cash at End of Period',
    lineItem: 'cash_at_end_of_period',
    type: 'summary_value',
    summarize: false,
  },
]

export const ADJUSTMENTS_ROW_NAME = 'Adjustments to Net Income'
